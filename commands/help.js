const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config');
const LanguageManager = require('../src/LanguageManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows all bot commands and features'),

    async execute(interaction, client) {
        try {
            const guildId = interaction.guild.id;

            // Get translations
            const t = {
                title: await LanguageManager.getTranslation(guildId, 'commands.help.title'),
                description: await LanguageManager.getTranslation(guildId, 'commands.help.main_description'),
                commandsTitle: await LanguageManager.getTranslation(guildId, 'commands.help.commands_title'),
                commandsList: await LanguageManager.getTranslation(guildId, 'commands.help.commands_list'),
                buttonControlsTitle: await LanguageManager.getTranslation(guildId, 'commands.help.button_controls_title'),
                buttonControlsList: await LanguageManager.getTranslation(guildId, 'commands.help.button_controls_list'),
                platformsTitle: await LanguageManager.getTranslation(guildId, 'commands.help.platforms_title'),
                platformsList: await LanguageManager.getTranslation(guildId, 'commands.help.platforms_list'),
                featuresTitle: await LanguageManager.getTranslation(guildId, 'commands.help.features_title'),
                featuresList: await LanguageManager.getTranslation(guildId, 'commands.help.features_list'),
                howtoTitle: await LanguageManager.getTranslation(guildId, 'commands.help.howto_title'),
                howtoList: await LanguageManager.getTranslation(guildId, 'commands.help.howto_list'),
                statisticsTitle: await LanguageManager.getTranslation(guildId, 'commands.help.statistics_title'),
                linksTitle: await LanguageManager.getTranslation(guildId, 'commands.help.links_title'),
                footerText: await LanguageManager.getTranslation(guildId, 'commands.help.footer_text'),
                buttonWebsite: await LanguageManager.getTranslation(guildId, 'commands.help.button_website'),
                buttonSupport: await LanguageManager.getTranslation(guildId, 'commands.help.button_support'),
                buttonRefresh: await LanguageManager.getTranslation(guildId, 'commands.help.button_refresh')
            };

            const embed = new EmbedBuilder()
                .setTitle(t.title)
                .setDescription(t.description)
                .setColor(config.bot.embedColor)
                .setThumbnail(client.user.displayAvatarURL())
                .setTimestamp();

            // Commands
            embed.addFields({
                name: t.commandsTitle,
                value: Array.isArray(t.commandsList) ? t.commandsList.join('\n') : t.commandsList,
                inline: false
            });

            // Button Controls
            embed.addFields({
                name: t.buttonControlsTitle,
                value: Array.isArray(t.buttonControlsList) ? t.buttonControlsList.join('\n') : t.buttonControlsList,
                inline: false
            });

            // Supported Platforms
            embed.addFields({
                name: t.platformsTitle,
                value: Array.isArray(t.platformsList) ? t.platformsList.join('\n') : t.platformsList,
                inline: false
            });

            // Features
            embed.addFields({
                name: t.featuresTitle,
                value: Array.isArray(t.featuresList) ? t.featuresList.join('\n') : t.featuresList,
                inline: false
            });

            // How to Use
            embed.addFields({
                name: t.howtoTitle,
                value: Array.isArray(t.howtoList) ? t.howtoList.join('\n') : t.howtoList,
                inline: false
            });

            // Statistics - Fetch from all shards if sharding is enabled
            let guilds, users, activeServers;

            if (client.shard) {
                // Sharding is enabled - fetch from all shards
                try {
                    // Fetch guild counts from all shards
                    const guildCounts = await client.shard.fetchClientValues('guilds.cache.size');
                    guilds = guildCounts.reduce((acc, count) => acc + count, 0);

                    // Fetch member counts from all shards
                    const memberCounts = await client.shard.broadcastEval(c => 
                        c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)
                    );
                    users = memberCounts.reduce((acc, count) => acc + count, 0);

                    // Fetch active players from all shards
                    const activePlayers = await client.shard.broadcastEval(c => c.players.size);
                    activeServers = activePlayers.reduce((acc, count) => acc + count, 0);
                } catch (error) {
                    console.error('Error fetching shard statistics:', error);
                    // Fallback to local shard data
                    guilds = client.guilds.cache.size;
                    users = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
                    activeServers = client.players.size;
                }
            } else {
                // No sharding - use local data
                guilds = client.guilds.cache.size;
                users = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
                activeServers = client.players.size;
            }

            const statsServers = await LanguageManager.getTranslation(guildId, 'commands.help.stats_servers', { count: guilds });
            const statsUsers = await LanguageManager.getTranslation(guildId, 'commands.help.stats_users', { count: users.toLocaleString() });
            const statsActive = await LanguageManager.getTranslation(guildId, 'commands.help.stats_active', { count: activeServers });
            const statsUptime = await LanguageManager.getTranslation(guildId, 'commands.help.stats_uptime', { time: this.formatUptime(process.uptime()) });

            embed.addFields({
                name: t.statisticsTitle,
                value: [
                    statsServers,
                    statsUsers,
                    statsActive,
                    statsUptime
                ].join('\n'),
                inline: true
            });

            // Links
            embed.addFields({
                name: t.linksTitle,
                value: [
                    `[🌐 Website](${config.bot.website})`,
                    `[💬 Support Server](${config.bot.supportServer})`,
                    `[📄 Invite Bot](${config.bot.invite})`
                ].join('\n'),
                inline: true
            });

            embed.setFooter({
                text: `${client.user.username} • ${t.footerText}`,
                iconURL: client.user.displayAvatarURL()
            });

            // Buttons
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel(t.buttonWebsite)
                        .setURL(config.bot.website)
                        .setStyle(ButtonStyle.Link),
                    new ButtonBuilder()
                        .setLabel(t.buttonSupport)
                        .setURL(config.bot.supportServer)
                        .setStyle(ButtonStyle.Link),
                    new ButtonBuilder()
                        .setCustomId('help_refresh')
                        .setLabel(t.buttonRefresh)
                        .setEmoji('🔄')
                        .setStyle(ButtonStyle.Secondary)
                );

            await interaction.reply({
                embeds: [embed],
                components: [row]
            });

        } catch (error) {

            const guildId = interaction.guild.id;
            const errorTitle = await LanguageManager.getTranslation(guildId, 'commands.help.error_title');
            const errorDescription = await LanguageManager.getTranslation(guildId, 'commands.help.error_description');

            const errorEmbed = new EmbedBuilder()
                .setTitle(errorTitle)
                .setDescription(errorDescription)
                .setColor('#FF0000')
                .setTimestamp();

            try {
                if (interaction.deferred && !interaction.replied) {
                    await interaction.editReply({ embeds: [errorEmbed] });
                } else if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ embeds: [errorEmbed], flags: [1 << 6] });
                }
            } catch (responseError) {
                console.error('❌ Error sending help error response:', responseError);
            }
        }
    },

    formatUptime(seconds) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (days > 0) {
            return `${days}d ${hours}h ${minutes}m`;
        } else if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    }
};