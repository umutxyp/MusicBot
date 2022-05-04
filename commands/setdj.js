const { MessageEmbed } = require('discord.js');

module.exports = {
    description: "It allows you to get information about the DJ role.",
    name: 'setdj',
    options: [],

    run: async (client, interaction) => {
        const embed = new MessageEmbed()
        .setColor('BLUE')
        .setTitle(client.user.username)
        .setThumbnail(client.user.displayAvatarURL())
        .setDescription("To use some of the music commands in this bot, you must create and own a role named **DJ** on your server. Users without this role cannot use the "+client.config.opt.DJ.commands.map(astra => '`/'+astra+'`').join(", "))
        .addField("Invite Bot", `**[Add Me](https://bit.ly/3kbzi7b)**` ,true)
        .setTimestamp()
        .setFooter({ text: 'Music Bot - by Umut Bayraktar ❤️', iconURL:interaction.user.displayAvatarURL({ dynamic: true }) });
        interaction.reply({ embeds: [embed] }).catch(e => { })
    },
};
