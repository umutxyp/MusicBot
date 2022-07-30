const { ApplicationCommandOptionType } = require('discord.js');
module.exports = {
  name: "filter",
  description: "Adds audio filter to ongoing music.",
  permissions: "0x0000000000000800",
  options: [{
    name: 'filtre',
    description: 'Type the filter you want to apply. (bassboost, 8D, nightcore, mono, karaoke)',
    type: ApplicationCommandOptionType.String,
    required: true
  }],
  run: async (client, interaction) => {

    const queue = client.player.getQueue(interaction.guild.id);

    if (!queue || !queue.playing) return interaction.reply({ content: `There is no music currently playing!. ❌`, ephemeral: true }).catch(e => { })
    const filtre = interaction.options.getString('filtre')

    if (!filtre) return interaction.reply({ content: `Please enter a valid filter name. ❌\n\`bassboost, 8D, nightcore\``, ephemeral: true }).catch(e => { })


    const filters = ["bassboost", "8D", "nightcore", "mono", "karaoke"];
    //other filters: https://discord-player.js.org/docs/main/master/typedef/AudioFilters 

    const filter = filters.find((x) => x.toLowerCase() === filtre.toLowerCase());

    if (!filter) return interaction.reply({ content: `I couldn't find a filter with your name. ❌\n\`bassboost, 8D, nightcore\``, ephemeral: true }).catch(e => { })
    const filtersUpdated = {};
    filtersUpdated[filter] = queue["_activeFilters"].includes(filter) ? false : true;
    await queue.setFilters(filtersUpdated);

    interaction.reply({ content: `Applied: **${filter}**, Filter Status: **${queue["_activeFilters"].includes(filter) ? 'Active' : 'Inactive'}** ✅\n **Remember, if the music is long, the filter application time may be longer accordingly.**` }).catch(e => { })
  },
};
