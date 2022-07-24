const { EmbedBuilder, ApplicationCommandOptionType } = require('discord.js');
const { QueryType } = require('discord-player');
module.exports = {
  name: "search",
  description: "Used for your music search",
  permissions: "0x0000000000000800",
  options: [{
    name: 'name',
    description: 'Type the name of the music you want to play.',
    type: ApplicationCommandOptionType.String,
    required: true
  }],
  run: async (client, interaction) => {

    const name = interaction.options.getString('name')
    if (!name) return interaction.reply({ content: `Please enter a valid song name. ❌`, ephemeral: true }).catch(e => { })

    const res = await client.player.search(name, {
      requestedBy: interaction.member,
      searchEngine: QueryType.AUTO
    });
    if (!res || !res.tracks.length) return interaction.reply({ content: `No search results found. ❌`, ephemeral: true }).catch(e => { })

    const queue = await client.player.createQueue(interaction.guild, {
      leaveOnEnd: client.config.opt.voiceConfig.leaveOnEnd,
      autoSelfDeaf: client.config.opt.voiceConfig.autoSelfDeaf,
      metadata: interaction.channel
    });

    const embed = new EmbedBuilder();

    embed.setColor('007fff');
    embed.setTitle(`Searched Music: ${name}`);

    const maxTracks = res.tracks.slice(0, 10);

    embed.setDescription(`${maxTracks.map((track, i) => `**${i + 1}**. ${track.title} | \`${track.author}\``).join('\n')}\n\nChoose a song from **1** to **${maxTracks.length}** write send or write **cancel** and cancel selection.⬇️`)

    embed.setTimestamp();
    embed.setFooter({ text: `Code Share - by Umut Bayraktar ❤️` })

    interaction.reply({ embeds: [embed] }).catch(e => { })

    const collector = interaction.channel.createMessageCollector({
      time: 30000,
      errors: ['time'],
      filter: m => m.author.id === interaction.user.id
    });

    collector.on('collect', async (query) => {
      if (["cancel"].includes(query.content)) {
        embed.setDescription(`Music search cancelled. ✅`)
        await interaction.editReply({ embeds: [embed], ephemeral: true }).catch(e => { })
        return collector.stop();
      }
      const value = parseInt(query.content);

      if (!value || value <= 0 || value > maxTracks.length) return interaction.reply({ content: `Error: select a song **1** to **${maxTracks.length}** and write send or type **cancel** and cancel selection. ❌`, ephemeral: true }).catch(e => { })

      collector.stop();

      try {
        if (!queue.connection) await queue.connect(interaction.member.voice.channelId);
      } catch {
        await client.player.deleteQueue(interaction.guild.id);
        return interaction.reply({ content: `I can't join audio channel. ❌`, ephemeral: true }).catch(e => { })
      }

      await interaction.reply({ content: `Loading your music call. 🎧` }).catch(e => { })

      queue.addTrack(res.tracks[Number(query.content) - 1]);
      if (!queue.playing) await queue.play();

    });

    collector.on('end', (msg, reason) => {
      if (reason === 'time') return interaction.reply({ content: `Song search time expired ❌`, ephemeral: true }).catch(e => { })
    });
  },
};
