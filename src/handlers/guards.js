'use strict';

const { PermissionFlagsBits, MessageFlags, RESTJSONErrorCodes } = require('discord.js');
const { isTextChannelInstance } = require('distube');
const views = require('../ui/views');

/**
 * Check that the user may control music: in a voice channel, and in the bot's channel if it is connected.
 * `join: true` also verifies the bot can connect and speak there.
 */
function checkVoice(interaction, manager, t, { requireQueue = true, join = false } = {}) {
    const guild = interaction.guild;
    const channel = interaction.member?.voice?.channel;
    if (!channel) return { error: t('commands.play.voice_channel_required') };

    const botChannelId = guild.members.me?.voice?.channelId;
    if (botChannelId && botChannelId !== channel.id) return { error: t('commands.play.same_channel_required') };

    const queue = manager.getQueue(guild.id);
    if (requireQueue && (!queue || !queue.songs.length)) return { error: t('commands.nowplaying.no_track') };

    if (join && !botChannelId) {
        const permissions = channel.permissionsFor(guild.members.me);
        if (!permissions?.has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak])) {
            return { error: t('commands.play.no_permissions') };
        }
        if (channel.full && !permissions.has(PermissionFlagsBits.MoveMembers)) return { error: t('ui.voice_full') };
    }
    return { channel, queue };
}

/**
 * Text channel DisTube may post the panel in (or undefined when the bot can't write there).
 */
function panelChannel(interaction) {
    const channel = interaction.channel;
    // Exactly the channels DisTube accepts as a queue text channel.
    if (!channel?.isTextBased() || !isTextChannelInstance(channel)) return undefined;
    const permissions = channel.permissionsFor?.(interaction.guild.members.me);
    if (!permissions?.has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) return undefined;
    if (channel.isThread() && !permissions.has(PermissionFlagsBits.SendMessagesInThreads)) return undefined;
    return channel;
}

const IGNORED_CODES = new Set([RESTJSONErrorCodes.UnknownInteraction, RESTJSONErrorCodes.InteractionHasAlreadyBeenAcknowledged]);

/**
 * Reply, follow up or edit depending on the interaction state. Never throws for expired interactions.
 */
async function respond(interaction, payload) {
    try {
        if (interaction.deferred && !interaction.replied) {
            const { flags, ...rest } = payload;
            return await interaction.editReply({ ...rest, flags: flags & MessageFlags.IsComponentsV2 ? MessageFlags.IsComponentsV2 : undefined });
        }
        if (interaction.replied) return await interaction.followUp(payload);
        return await interaction.reply(payload);
    } catch (error) {
        if (IGNORED_CODES.has(error.code)) return null;
        throw error;
    }
}

const say = (interaction, message, options) => respond(interaction, views.notice(message, options));

module.exports = { checkVoice, panelChannel, respond, say, IGNORED_CODES };
