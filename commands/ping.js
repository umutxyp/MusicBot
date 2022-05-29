const Discord = require('discord.js');
module.exports = {
    description: "It helps you to get information about the speed of the bot.",
    name: 'ping',
    options: [],

    run: async (client, interaction) => {
        const start = Date.now();
        interaction.reply('Pong!').then(async() => {
        let last = Date.now();
            const embed = new Discord.MessageEmbed()
                .setColor('BLUE')
                .setTitle(client.user.username + " - Pong!")
                .setThumbnail(client.user.displayAvatarURL())
                .addField(`Message Ping`, `\`${Date.now() - start}ms\` 🛰️`)
                .addField(`Message Latency`, `\`${last - start}ms\` 🛰️`)
                .addField(`API Latency`, `\`${Math.round(client.ws.ping)}ms\` 🛰️`)
                .addField("Invite Bot", `**[Add Me](https://bit.ly/3PHDjyC) | [Vote](https://bit.ly/3LYzaDe) | [Support](https://discord.gg/ST89uArTdh) | [Website](https://astramusic.vercel.app) | [Source Code](https://github.com/1umutda/MusicBot)**` ,true)
                .setTimestamp()
                .setFooter({ text: 'Music Bot Commands - by Umut Bayraktar ❤️', iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });
            interaction.editReply({ embeds: [embed] }).catch(e => { });
        })
    },
};
