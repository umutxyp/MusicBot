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
let lang = client.language
const queue = client.player.getQueue(interaction.guild.id);

if (!queue || !queue.playing) return interaction.reply({ content: `${lang.msg5}`, ephemeral: true }).catch(e => { })
const filtre = interaction.options.getString('filtre')

if (!filtre) return interaction.reply({ content: lang.msg29, ephemeral: true }).catch(e => { })


const filters = ["bassboost", "8D", "nightcore", "mono", "karaoke"];
//other filters: https://discord-player.js.org/docs/main/master/typedef/AudioFilters 

const filter = filters.find((x) => x.toLowerCase() === filtre.toLowerCase());

if (!filter) return interaction.reply({ content: lang.msg30, ephemeral: true }).catch(e => { })
const filtersUpdated = {};
filtersUpdated[filter] = queue["_activeFilters"].includes(filter) ? false : true;
await queue.setFilters(filtersUpdated);

interaction.reply({ content: lang.msg31.replace("{filter}", filter).replace("{status", queue["_activeFilters"].includes(filter) ? '✅' : '❌') }).catch(e => { })
},
};
