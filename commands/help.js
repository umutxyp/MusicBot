const { MessageEmbed } = require('discord.js');

module.exports = {
    showHelp: false,
    description: "It helps you to get information about bot and commands.",
    name: 'help',
    options: [],

    run: async (client, interaction) => {
        const commands = client.commands.filter(x => x.showHelp !== false);

        const embed = new MessageEmbed()
        .setColor('BLUE')
        .setTitle(client.user.username)
        .setThumbnail(client.user.displayAvatarURL())
        .setDescription("It's time to listen to music on your discord server with a completely free and advanced interface. Music bot Astra that supports playing music on many platforms that will make your server feel special")
        .addField(`Available - ${commands.size} Commands`, commands.map(x => `\`/${x.name}\``).join(' | '))
        .addField("Invite Bot", `**[Add Me](https://bit.ly/3PHDjyC) | [Vote](https://bit.ly/3LYzaDe) | [Support](https://discord.gg/ST89uArTdh) | [Website](https://astrabot.vercel.app/) | [Source Code](https://github.com/1umutda/MusicBot)**` ,true)
        .setTimestamp()
        .setFooter({ text: 'Music Bot Commands - by Umut Bayraktar ❤️', iconURL:interaction.user.displayAvatarURL({ dynamic: true }) })
        interaction.reply({ embeds: [embed] }).catch(e => { })
    },
};
