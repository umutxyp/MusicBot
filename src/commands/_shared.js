'use strict';

const { InteractionContextType, SlashCommandBuilder } = require('discord.js');
const i18n = require('../core/i18n');
const actions = require('../music/actions');
const { checkVoice, say } = require('../handlers/guards');

/**
 * Slash command builder limited to guilds, with description localizations when available.
 */
function command(name, description) {
    return new SlashCommandBuilder()
        .setName(name)
        .setDescription(description)
        .setDescriptionLocalizations(i18n.localizations(`commands.${name}.description`))
        .setContexts(InteractionContextType.Guild);
}

/**
 * Run a playback action on the guild queue after the voice checks, then reply.
 */
async function queueAction(interaction, ctx, run) {
    const { t, manager } = ctx;
    const check = checkVoice(interaction, manager, t);
    if (check.error) return say(interaction, check.error);
    const outcome = await actions.safely(() => run(check.queue, t), t);
    if (outcome.ok) manager.changed(check.queue);
    return say(interaction, outcome.message);
}

module.exports = { command, queueAction };
