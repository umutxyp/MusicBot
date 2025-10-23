const { Events, EmbedBuilder } = require('discord.js');
const config = require('../config');
const LanguageManager = require('../src/LanguageManager');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isModalSubmit() && !interaction.isStringSelectMenu()) return;

        const client = interaction.client;
        const guild = interaction.guild;
        const member = interaction.member;

        try {
            // Handle select menus
            if (interaction.isStringSelectMenu()) {
                if (interaction.customId.startsWith('autoplay_genre:')) {
                    await this.handleAutoplayGenre(interaction, client);
                    return;
                }
            }

            // Handle modals
            switch (interaction.customId) {
                case 'volume_modal':
                    await this.handleVolumeModal(interaction, client);
                    break;

                default:
                    await interaction.reply({
                        content: await LanguageManager.getTranslation(guild?.id, 'modalhandler.unknown_modal'),
                        ephemeral: true
                    });
            }
        } catch (error) {
            if (!interaction.replied && !interaction.deferred) {
                try {
                    await interaction.reply({
                        content: await LanguageManager.getTranslation(guild?.id, 'modalhandler.processing_error'),
                        ephemeral: true
                    });
                } catch (replyError) {
                }
            }
        }
    },

    async handleAutoplayGenre(interaction, client) {
        const guild = interaction.guild;
        const member = interaction.member;

        // Check if user is in a voice channel
        if (!member.voice.channel) {
            return await interaction.reply({
                content: await LanguageManager.getTranslation(guild?.id, 'modalhandler.voice_channel_required'),
                flags: [1 << 6]
            });
        }

        // Get music player
        const player = client.players.get(guild.id);
        if (!player) {
            return await interaction.reply({
                content: await LanguageManager.getTranslation(guild?.id, 'modalhandler.no_music_playing'),
                flags: [1 << 6]
            });
        }

        // Check if user is in the same voice channel as bot
        if (player.voiceChannel.id !== member.voice.channel.id) {
            return await interaction.reply({
                content: await LanguageManager.getTranslation(guild?.id, 'modalhandler.different_voice_channel'),
                flags: [1 << 6]
            });
        }

        const selectedGenre = interaction.values[0];
        
        // Enable autoplay with selected genre
        player.autoplay = selectedGenre;

        const genreName = await LanguageManager.getTranslation(guild?.id, `genres.${selectedGenre}`);
        const embed = new EmbedBuilder()
            .setTitle('🎲 ' + await LanguageManager.getTranslation(guild?.id, 'buttonhandler.autoplay_enabled'))
            .setDescription(
                (await LanguageManager.getTranslation(guild?.id, 'buttonhandler.autoplay_enabled_desc'))
                    .replace('{genre}', genreName)
            )
            .setColor(config.bot.embedColor)
            .setTimestamp()
            .addFields({
                name: await LanguageManager.getTranslation(guild?.id, 'buttonhandler.changed_by'),
                value: `${member}`,
                inline: true
            });

        await interaction.reply({ embeds: [embed], flags: [1 << 6] });

        // Update the main embed to show autoplay is enabled
        if (client.musicEmbedManager) {
            await client.musicEmbedManager.updateNowPlayingEmbed(player);
        }
    },

    async handleVolumeModal(interaction, client) {

        const guild = interaction.guild;
        const member = interaction.member;

        // Check if user is in a voice channel
        if (!member.voice.channel) {
            return await interaction.reply({
                content: await LanguageManager.getTranslation(guild?.id, 'modalhandler.voice_channel_required'),
                ephemeral: true
            });
        }

        // Get music player
        const player = client.players.get(guild.id);
        if (!player) {
            return await interaction.reply({
                content: await LanguageManager.getTranslation(guild?.id, 'modalhandler.no_music_playing'),
                ephemeral: true
            });
        }

        // Check if user is in the same voice channel as bot
        if (player.voiceChannel.id !== member.voice.channel.id) {
            return await interaction.reply({
                content: await LanguageManager.getTranslation(guild?.id, 'modalhandler.same_channel_required'),
                ephemeral: true
            });
        }

        const volumeInput = interaction.fields.getTextInputValue('volume_input');
        const volume = parseInt(volumeInput);

        // Validate volume
        if (isNaN(volume) || volume < 0 || volume > 100) {
            return await interaction.reply({
                content: await LanguageManager.getTranslation(guild?.id, 'modalhandler.invalid_volume'),
                ephemeral: true
            });
        }

        // Set volume
        const success = player.setVolume(volume);

        if (success) {
            const embed = new EmbedBuilder()
                .setTitle(await LanguageManager.getTranslation(guild?.id, 'modalhandler.volume_changed_title'))
                .setDescription(await LanguageManager.getTranslation(guild?.id, 'modalhandler.volume_changed_desc', { volume }))
                .setColor(config.bot.embedColor)
                .setTimestamp()
                .addFields({
                    name: await LanguageManager.getTranslation(guild?.id, 'modalhandler.set_by'),
                    value: `${member}`,
                    inline: true
                });

            // Visual volume bar
            const volumeBar = this.createVolumeBar(volume);
            embed.addFields({
                name: await LanguageManager.getTranslation(guild?.id, 'modalhandler.level'),
                value: volumeBar,
                inline: false
            });

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else {
            await interaction.reply({
                content: await LanguageManager.getTranslation(guild?.id, 'modalhandler.volume_error'),
                ephemeral: true
            });
        }
    },

    createVolumeBar(volume) {
        const barLength = 20;
        const filledBars = Math.floor((volume / 100) * barLength);
        const emptyBars = barLength - filledBars;

        const bar = '▓'.repeat(filledBars) + '░'.repeat(emptyBars);
        return `\`${bar}\` ${volume}%`;
    }
};