const Discord = require('discord.js');
module.exports = {
    description: "It sends and saves the played music to you via dm box.",
    name: 'save',
    options: [],
    voiceChannel: true,

    run: async (client, interaction) => {
        const queue = client.player.getQueue(interaction.guild.id);

  if (!queue || !queue.playing) return interaction.reply({ content: `There is no music currently playing!. ❌`, ephemeral: true }).catch(e => { })

  const embed = new Discord.MessageEmbed()
  .setColor('BLUE')
  .setTitle(client.user.username + " - Save Track")
  .setThumbnail(client.user.displayAvatarURL())
  .addField(`Track`, `\`${queue.current.title}\``)
  .addField(`Duration`, `\`${queue.current.duration}\``)
  .addField(`URL`, `${queue.current.url}`)
  .addField(`Saved Server`, `\`${interaction.guild.name}\``)
  .addField(`Requested By`, `${queue.current.requestedBy}`)
  .setTimestamp()
  .setFooter({ text: 'Music Bot Commands - by Umut Bayraktar ❤️', iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });
  interaction.user.send({ embeds: [embed] }).then(() => {
    interaction.reply({ content: `I sent the name of the music via private message. ✅`, ephemeral: true }).catch(e => { })
        }).catch(error => {
            interaction.reply({ content: `Unable to send you private message. ❌`, ephemeral: true }).catch(e => { })
        });
    },
};
