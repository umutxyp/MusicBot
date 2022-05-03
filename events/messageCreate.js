const { MessageEmbed } = require("discord.js")
module.exports = (client, message) => {

if(message.author.bot) return;
if(!message.guild) return

const prefix = client.config.px;

if(message.content.indexOf(prefix) !== 0) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    const cmd = client.commands.get(command) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(command));

    const DJ = client.config.opt.DJ;

    if (cmd && DJ.enabled && DJ.commands.includes(cmd.name)) {
        const roleDJ = message.guild.roles.cache.find(x => x.name === DJ.roleName)
        if(!message.member.permissions.has("MANAGE_GUILD")){
            if(!message.member.roles.cache.has(roleDJ?.id)){

            const embed = new MessageEmbed()
            .setColor('BLUE')
            .setTitle(client.user.username)
            .setThumbnail(client.user.displayAvatarURL())
            .setDescription("To use some of the music commands in this bot, you must create and own a role named **DJ** on your server. Users without this role cannot use the "+client.config.opt.DJ.commands.map(astra => '`'+astra+'`').join(", "))
            .addField("Invite Bot", `**[Add Me](https://bit.ly/3kbzi7b)**` ,true)
            .setTimestamp()
            .setFooter({ text: 'Music Bot - by Umut Bayraktar ❤️', iconURL:message.author.avatarURL({ dynamic: true }) });
            return message.channel.send({ content: `${message.author}`, embeds: [embed]}).catch(e => { })
        }
    }
    }

    if (cmd && cmd.voiceChannel) {
        if (!message.member.voice.channel) return message.channel.send({ content: `${message.author}, You are not connected to an audio channel. ❌` });
        if (message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id) return message.channel.send({ content: `${message.author}, You are not on the same audio channel as me. ❌` });
    }

    if (cmd) cmd.execute(client, message, args);
};
