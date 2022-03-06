const Discord = require('discord.js');
module.exports = {
    name: 'save',
    aliases: [],
    utilisation: '{prefix}save',
    voiceChannel: true,

    async execute(client, message) {
        const queue = client.player.getQueue(message.guild.id);

  if (!queue || !queue.playing) return message.channel.send({ content: `${message.author}, There is no music currently playing!. ❌` });

  const embed = new Discord.MessageEmbed()
  .setColor('BLUE')
  .setTitle(client.user.username + " - Save Track")
  .setThumbnail(client.user.displayAvatarURL())
  .addField(`Track`, `\`${queue.current.title}\``)
  .addField(`Duration`, `\`${queue.current.duration}\``)
  .addField(`URL`, `${queue.current.url}`)
  .addField(`Saved Server`, `\`${message.guild.name}\``)
  .addField(`Requested By`, `${queue.current.requestedBy}`)
  .setTimestamp()
  .setFooter({ text: 'Music Bot Commands - by Umut Bayraktar ❤️', iconURL: message.author.avatarURL({ dynamic: true }) });
  message.author.send({ embeds: [embed] }).then(() => {
            message.channel.send({ content: `I sent the name of the music via private message. ✅` });
        }).catch(error => {
            message.channel.send({ content: `${message.author}, Unable to send you private message. ❌` });
        });
    },
};
