const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const MusicPlayer = require('../src/MusicPlayer');
const MusicEmbedManager = require('../src/MusicEmbedManager');
const LanguageManager = require('../src/LanguageManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays music - Supports YouTube, Spotify, SoundCloud or direct links')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Song name, artist, YouTube/Spotify/SoundCloud URL or direct link')
                .setRequired(true)
        ),

    async execute(interaction, client) {
        try {
            // Defer reply
            if (!interaction.deferred && !interaction.replied) {
                await interaction.deferReply();
            }

            const query = interaction.options.getString('query');
            const member = interaction.member;
            const guild = interaction.guild;
            const channel = interaction.channel;

            // Temel kontroller
            const validationResult = await this.validateRequest(interaction, member, guild);
            if (!validationResult.success) {
                return await interaction.editReply({
                    content: validationResult.message
                });
            }

            // Music player al veya oluştur
            let player = client.players.get(guild.id);
            if (!player) {
                player = new MusicPlayer(guild, channel, member.voice.channel);
                client.players.set(guild.id, player);
            }

            // Player kanallarını güncelle
            player.voiceChannel = member.voice.channel;
            player.textChannel = channel;

            // Arama mesajı gönder
            const searchingMsg = await LanguageManager.getTranslation(guild.id, 'commands.play.searching_desc', { query });
            await interaction.editReply({ content: searchingMsg });

            // Sadece müzik verilerini al (player'a ekleme yapma)
            const trackData = await this.getTrackData(query, guild.id);

            if (!trackData.success) {
                return await interaction.editReply({
                    content: trackData.message
                });
            }



            // Embed Manager'a gönder
            if (!client.musicEmbedManager) {
                client.musicEmbedManager = new MusicEmbedManager(client);
            }

            const embedResult = await client.musicEmbedManager.handleMusicData(
                guild.id,
                trackData,
                member,
                interaction
            );

            if (!embedResult.success) {
                return await interaction.editReply({
                    content: embedResult.message
                });
            }

        } catch (error) {
            const errorMsg = await LanguageManager.getTranslation(interaction.guild.id, 'commands.play.error_playing');

            try {
                if (interaction.deferred && !interaction.replied) {
                    await interaction.editReply({ content: errorMsg });
                } else if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ content: errorMsg, ephemeral: true });
                }
            } catch (responseError) {
                console.error('Error sending error response:', responseError);
            }
        }
    },

    async validateRequest(interaction, member, guild) {
        // Ses kanalı kontrolü
        if (!member.voice.channel) {
            const errorMsg = await LanguageManager.getTranslation(guild.id, 'commands.play.voice_channel_required');
            return { success: false, message: errorMsg };
        }

        // İzin kontrolü
        const permissions = member.voice.channel.permissionsFor(guild.members.me);
        if (!permissions.has(PermissionFlagsBits.Connect) || !permissions.has(PermissionFlagsBits.Speak)) {
            const errorMsg = await LanguageManager.getTranslation(guild.id, 'commands.play.no_permissions');
            return { success: false, message: errorMsg };
        }

        // Bot farklı kanalda mı kontrolü
        const botVoiceChannel = guild.members.me.voice.channel;
        if (botVoiceChannel && botVoiceChannel.id !== member.voice.channel.id) {
            const errorMsg = await LanguageManager.getTranslation(guild.id, 'commands.play.same_channel_required');
            return { success: false, message: errorMsg };
        }

        return { success: true };
    },

    async getTrackData(query, guildId) {
        const YouTube = require('../src/YouTube');
        const Spotify = require('../src/Spotify');
        const SoundCloud = require('../src/SoundCloud');
        const DirectLink = require('../src/DirectLink');

        try {
            let tracks = [];
            let isPlaylist = false;

            // Platform tespiti
            const platform = this.detectPlatform(query);

            switch (platform) {
                case 'youtube':
                    // YouTube playlist/video kontrolü
                    if (YouTube.isPlaylist && YouTube.isPlaylist(query)) {
                        const playlistData = await YouTube.getPlaylist(query, guildId);
                        if (playlistData && playlistData.tracks && playlistData.tracks.length > 0) {
                            tracks = playlistData.tracks;
                            isPlaylist = true;
                        } else {
                            // Playlist yüklenemezse normal arama yap
                            tracks = await YouTube.search(query, 1, guildId);
                        }
                    } else {
                        tracks = await YouTube.search(query, 1, guildId);
                    }
                    break;

                case 'spotify':
                    // Check if it's a Spotify URL (playlist, album, track, or artist)
                    if (Spotify.isSpotifyURL(query)) {
                        const spotifyData = await Spotify.getFromURL(query, guildId);
                        tracks = spotifyData || [];
                        // Check if it's a playlist/album/artist (multiple tracks)
                        const { type } = Spotify.parseSpotifyURL(query);
                        isPlaylist = type === 'playlist' || type === 'album' || type === 'artist';
                    } else {
                        // Regular search
                        const spotifyData = await Spotify.search(query, 1, 'track', guildId);
                        tracks = spotifyData || [];
                    }
                    break;

                case 'soundcloud':
                    const soundcloudData = await SoundCloud.search(query, 1, guildId);
                    tracks = soundcloudData || [];
                    break;

                case 'direct':
                    const directData = await DirectLink.getInfo(query);
                    tracks = directData || [];
                    break;

                default:
                    // Varsayılan YouTube arama
                    tracks = await YouTube.search(query, 1, guildId);
            }

            if (!tracks || tracks.length === 0) {
                const errorMsg = await LanguageManager.getTranslation(guildId, 'musicplayer.no_results_found');
                return { success: false, message: errorMsg };
            }

            return {
                success: true,
                isPlaylist: isPlaylist,
                tracks: tracks
            };

        } catch (error) {
            const errorMsg = await LanguageManager.getTranslation(guildId, 'commands.play.error_searching');
            return { success: false, message: errorMsg };
        }
    },

    detectPlatform(query) {
        if (query.includes('youtube.com') || query.includes('youtu.be')) {
            return 'youtube';
        } else if (query.includes('spotify.com')) {
            return 'spotify';
        } else if (query.includes('soundcloud.com')) {
            return 'soundcloud';
        } else if (query.startsWith('http') && (query.includes('.mp3') || query.includes('.wav') || query.includes('.ogg'))) {
            return 'direct';
        } else {
            return 'youtube'; // Default to YouTube search
        }
    }
};