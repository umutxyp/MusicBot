const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const { JsonDB } = require('node-json-db');
const fs = require('fs');
const path = require('path');
const LanguageManager = require('../src/LanguageManager');

// Initialize JSON database
const db = new JsonDB('database/languages', true, true, '/');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('language')
        .setDescription('Changes server language')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction, client) {
        try {
            // Check if user has MANAGE_GUILD permission
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
                const noPermissionTitle = await LanguageManager.getTranslation(interaction.guild.id, 'commands.language.errortitle');
                const noPermissionDesc = await LanguageManager.getTranslation(interaction.guild.id, 'commands.language.permission_required');
                
                const errorEmbed = new EmbedBuilder()
                    .setTitle(noPermissionTitle)
                    .setDescription(noPermissionDesc)
                    .setColor('#ff0000')
                    .setTimestamp();
                
                return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            const guildId = interaction.guild.id;

            // Get current language
            let currentLang = 'en'; // Default language
            try {
                currentLang = await db.getData(`/servers/${guildId}/language`);
            } catch (error) {
                // Language not set, use default
            }

            // Get available languages
            const languagesPath = path.join(__dirname, '..', 'languages');
            const languageFiles = fs.readdirSync(languagesPath).filter(file => file.endsWith('.json'));

            const languages = [];
            for (const file of languageFiles) {
                const langData = JSON.parse(fs.readFileSync(path.join(languagesPath, file), 'utf8'));
                languages.push({
                    code: langData.language.code,
                    name: langData.language.name,
                    flag: langData.language.flag
                });
            }

            // Get current language data
            const currentLangData = languages.find(lang => lang.code === currentLang);
            const currentLangFile = JSON.parse(fs.readFileSync(path.join(languagesPath, `${currentLang}.json`), 'utf8'));

            // Create embed
            const embed = new EmbedBuilder()
                .setTitle(currentLangFile.commands.language.title)
                .setDescription(currentLangFile.commands.language.select)
                .setColor('#0099ff')
                .setTimestamp()
                .addFields({
                    name: currentLangFile.commands.language.current,
                    value: `${currentLangData.flag} ${currentLangData.name}`,
                    inline: true
                });

            // Create buttons
            const buttons = [];
            const rows = [];

            for (let i = 0; i < languages.length; i++) {
                const lang = languages[i];
                const button = new ButtonBuilder()
                    .setCustomId(`language_${lang.code}`)
                    .setLabel(lang.name)
                    .setEmoji(lang.flag)
                    .setStyle(lang.code === currentLang ? ButtonStyle.Primary : ButtonStyle.Secondary);

                buttons.push(button);

                // Create rows (max 5 buttons per row)
                if (buttons.length === 5 || i === languages.length - 1) {
                    const row = new ActionRowBuilder().addComponents(...buttons);
                    rows.push(row);
                    buttons.length = 0; // Clear array
                }
            }

            await interaction.reply({
                embeds: [embed],
                components: rows
            });

        } catch (error) {

            let errorDes = await LanguageManager.getTranslation(interaction.guild.id, 'commands.language.error2');
            let errorTitle = await LanguageManager.getTranslation(interaction.guild.id, 'commands.language.errortitle');

            const errorEmbed = new EmbedBuilder()
                .setTitle(errorTitle)
                .setDescription(errorDes)
                .setColor('#ff0000')
                .setTimestamp();

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },

    // Handle button interactions
    async handleLanguageButton(interaction) {
        try {
            // Check if user has MANAGE_GUILD permission
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
                const noPermissionTitle = await LanguageManager.getTranslation(interaction.guild.id, 'commands.language.errortitle');
                const noPermissionDesc = '❌ Bu butonu kullanmak için **Sunucuyu Yönet** yetkisine sahip olmalısın!';
                
                const errorEmbed = new EmbedBuilder()
                    .setTitle(noPermissionTitle)
                    .setDescription(noPermissionDesc)
                    .setColor('#ff0000')
                    .setTimestamp();
                
                return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            const guildId = interaction.guild.id;
            const selectedLang = interaction.customId.replace('language_', '');

            // Save language preference using LanguageManager (this will update cache automatically)
            const success = await LanguageManager.setServerLanguage(guildId, selectedLang);

            if (!success) {
                throw new Error('Failed to save language preference');
            }

            // Get selected language data
            const selectedLangData = await LanguageManager.getLanguageData(selectedLang);

            if (!selectedLangData) {
                throw new Error('Invalid language selected');
            }

            // Create success embed using new language
            const successTitle = await LanguageManager.getTranslation(guildId, 'commands.language.changed');
            const successDescription = await LanguageManager.getTranslation(guildId, 'commands.language.changed_desc', {
                language: `${selectedLangData.language.flag} ${selectedLangData.language.name}`
            });

            const successEmbed = new EmbedBuilder()
                .setTitle(successTitle)
                .setDescription(successDescription)
                .setColor('#00ff00')
                .setTimestamp();

            await interaction.update({
                embeds: [successEmbed],
                components: []
            });

        } catch (error) {

            let errorDes = await LanguageManager.getTranslation(interaction.guild.id, 'commands.language.error');
            let errorTitle = await LanguageManager.getTranslation(interaction.guild.id, 'commands.language.errortitle');
            const errorEmbed = new EmbedBuilder()
                .setTitle(errorTitle)
                .setDescription(errorDes)
                .setColor('#ff0000')
                .setTimestamp();

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.update({ embeds: [errorEmbed], components: [] });
            }
        }
    }
};
