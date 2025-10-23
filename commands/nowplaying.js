const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config');
const LanguageManager = require('../src/LanguageManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Shows information about currently playing song'),

    async execute(interaction, client) {
        try {
            const guild = interaction.guild;
            const guildId = guild.id;

            // Get music player
            const player = client.players.get(guild.id);
            if (!player) {
                const noPlayerMsg = await LanguageManager.getTranslation(guildId, 'commands.nowplaying.no_player');
                return await interaction.reply({
                    embeds: [await this.createErrorEmbed(noPlayerMsg, guildId)],
                    ephemeral: true
                });
            }

            if (!player.currentTrack) {
                const noTrackMsg = await LanguageManager.getTranslation(guildId, 'commands.nowplaying.no_track');
                return await interaction.reply({
                    embeds: [await this.createErrorEmbed(noTrackMsg, guildId)],
                    ephemeral: true
                });
            }

            const track = player.currentTrack;
            const currentTime = player.getCurrentTime();
            const status = player.getStatus();

            // Get translations
            const title = await LanguageManager.getTranslation(guildId, 'commands.nowplaying.title');
            const artistLabel = await LanguageManager.getTranslation(guildId, 'commands.nowplaying.artist');
            const albumLabel = await LanguageManager.getTranslation(guildId, 'commands.nowplaying.album');
            const platformLabel = await LanguageManager.getTranslation(guildId, 'commands.nowplaying.platform');
            const platformCode = (track.platform || 'unknown').toString().toLowerCase();
            const platformNameKey = `commands.nowplaying.platform_name_${platformCode}`;
            let platformName = await LanguageManager.getTranslation(guildId, platformNameKey);

            if (platformName === platformNameKey) {
                if (track.platform) {
                    platformName = track.platform.charAt(0).toUpperCase() + track.platform.slice(1);
                } else {
                    const unknownKey = 'commands.nowplaying.platform_name_unknown';
                    const unknownTranslation = await LanguageManager.getTranslation(guildId, unknownKey);
                    platformName = unknownTranslation === unknownKey ? 'Unknown' : unknownTranslation;
                }
            }

            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(`**[${track.title}](${track.url})**`)
                .setColor(config.bot.embedColor)
                .setTimestamp();

            // Add track info fields
            if (track.artist) {
                embed.addFields({
                    name: artistLabel,
                    value: track.artist,
                    inline: true
                });
            }

            if (track.album) {
                embed.addFields({
                    name: albumLabel,
                    value: track.album,
                    inline: true
                });
            }

            embed.addFields({
                name: platformLabel,
                value: `${this.getPlatformEmoji(platformCode)} ${platformName}`,
                inline: true
            });

            // Duration and progress
            if (track.duration && track.duration > 0) {
                const progressLabel = await LanguageManager.getTranslation(guildId, 'commands.nowplaying.progress');
                const progressBar = this.createProgressBar(currentTime, track.duration * 1000);
                const currentTimeFormatted = this.formatTime(currentTime);
                const totalTimeFormatted = this.formatDuration(track.duration);

                embed.addFields({
                    name: progressLabel,
                    value: `${currentTimeFormatted} / ${totalTimeFormatted}\n${progressBar}`,
                    inline: false
                });
            }

            // Requester info
            if (track.requestedBy) {
                const requestedByLabel = await LanguageManager.getTranslation(guildId, 'commands.nowplaying.requested_by');
                embed.addFields({
                    name: requestedByLabel,
                    value: `<@${track.requestedBy.id}>`,
                    inline: true
                });
            }

            // Player status
            const statusLabel = await LanguageManager.getTranslation(guildId, 'commands.nowplaying.status');
            const statusPlaying = await LanguageManager.getTranslation(guildId, 'commands.nowplaying.status_playing');
            const statusPaused = await LanguageManager.getTranslation(guildId, 'commands.nowplaying.status_paused');
            const statusStopped = await LanguageManager.getTranslation(guildId, 'commands.nowplaying.status_stopped');
            const repeatTrack = await LanguageManager.getTranslation(guildId, 'commands.nowplaying.repeat_track');
            const repeatQueue = await LanguageManager.getTranslation(guildId, 'commands.nowplaying.repeat_queue');
            const shuffleText = await LanguageManager.getTranslation(guildId, 'commands.nowplaying.shuffle');

            let statusText = '';
            if (status.playing) {
                statusText += statusPlaying;
            } else if (status.paused) {
                statusText += statusPaused;
            } else {
                statusText += statusStopped;
            }

            const volumeKey = 'commands.nowplaying.volume';
            let volumeText = await LanguageManager.getTranslation(guildId, volumeKey, { volume: status.volume });
            if (volumeText === volumeKey) {
                volumeText = `🔊 %${status.volume}`;
            }

            statusText += ` • ${volumeText}`;

            if (status.loop === 'track') {
                statusText += ` • ${repeatTrack}`;
            } else if (status.loop === 'queue') {
                statusText += ` • ${repeatQueue}`;
            }

            if (status.shuffle) {
                statusText += ` • ${shuffleText}`;
            }

            embed.addFields({
                name: statusLabel,
                value: statusText,
                inline: false
            });

            // Queue info
            if (player.queue.length > 0) {
                const nextSongLabel = await LanguageManager.getTranslation(guildId, 'commands.nowplaying.next_song');
                const footerMoreSongs = await LanguageManager.getTranslation(guildId, 'commands.nowplaying.footer_more_songs', { count: player.queue.length });

                embed.addFields({
                    name: nextSongLabel,
                    value: `[${player.queue[0].title}](${player.queue[0].url})`,
                    inline: false
                });

                embed.setFooter({
                    text: footerMoreSongs
                });
            } else {
                const footerNoSongs = await LanguageManager.getTranslation(guildId, 'commands.nowplaying.footer_no_songs');
                embed.setFooter({
                    text: footerNoSongs
                });
            }

            // Add thumbnail
            if (track.thumbnail) {
                embed.setThumbnail(track.thumbnail);
            }

          

            await interaction.reply({
                embeds: [embed]
            });

        } catch (error) {
            const guildId = interaction.guild.id;
            const errorMsg = await LanguageManager.getTranslation(guildId, 'commands.nowplaying.error_getting_info');
            await interaction.reply({
                embeds: [await this.createErrorEmbed(errorMsg, guildId)],
                ephemeral: true
            });
        }
    },

    async createErrorEmbed(message, guildId) {
        const errorTitle = await LanguageManager.getTranslation(guildId, 'commands.nowplaying.error_title');
        return new EmbedBuilder()
            .setTitle(errorTitle)
            .setDescription(message)
            .setColor('#FF0000')
            .setTimestamp();
    },

    formatDuration(seconds) {
        if (!seconds || seconds === 0) return '0:00';

        // Ensure we work with integers to avoid floating point errors
        const totalSeconds = Math.floor(Number(seconds) || 0);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const remainingSeconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
    },

    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        return this.formatDuration(seconds);
    },

    createProgressBar(current, total, length = 15) {
        if (!total || total === 0) return '▬'.repeat(length);

        const currentMs = typeof current === 'number' ? current : 0;
        const totalMs = total;
        const progress = Math.min(currentMs / totalMs, 1);
        const filledLength = Math.round(progress * length);

        const filled = '▬'.repeat(filledLength);
        const empty = '▬'.repeat(length - filledLength);
        const indicator = '🔘';

        if (filledLength === 0) {
            return indicator + empty;
        } else if (filledLength === length) {
            return filled + indicator;
        } else {
            return filled + indicator + empty.substring(1);
        }
    },

    getPlatformEmoji(platform) {
        const emojis = {
            youtube: '🔴',
            spotify: '🟢',
            soundcloud: '🟠',
            direct: '🔗'
        };
        return emojis[platform] || '🎵';
    }
};