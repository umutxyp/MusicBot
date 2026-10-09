'use strict';

const { PermissionFlagsBits } = require('discord.js');
const { command } = require('./_shared');
const i18n = require('../core/i18n');
const views = require('../ui/views');

module.exports = {
    category: 'settings',
    data: command('language', 'Change the bot language for this server')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction, { t }) {
        return interaction.reply(views.languageView(t, { languages: i18n.list(), current: i18n.guildLanguage(interaction.guildId, interaction.guild?.preferredLocale) }));
    },
};
