const lyricsFinder = require("geniuslyricfinder");
const {MessageActionRow, MessageButton, MessageEmbed} = require("discord.js")

module.exports = {
    description: "Learn the lyrics of now playing or other music.",
    name: 'lyrics',
    options: [{
      name: 'song-name',
      description: 'Write a song name.',
      type: 'STRING',
      required: true
  }],

run: async (client, interaction) => {

const musicn = interaction.options.getString('song-name')
if(!musicn) return interaction.reply("Please type a music name.").catch(e => { });

lyricsFinder.getLyrics(musicn).then(async (g) => {
    
let gg = g.lyrics.split("\n").map(x => x.trim());

const backButton = new MessageButton({
style: 'SECONDARY',
label: '',
emoji: '⬅️',
customId: "back"
})
const forwardButton = new MessageButton({
style: 'SECONDARY',
label: '',
emoji: '➡️',
customId: "forward"
})

const deleteButton = new MessageButton({
style: 'SECONDARY',
label: '',
emoji: '❌',
customId: "close"
})

const lyricss = [...gg.values()]

let page = 1
const generateEmbed = async start => {
const current = lyricss.slice(start, start + 30)

return new MessageEmbed({
  title: `${g.artist} - ${g.song}`,
  color: "BLUE",
  thumbnail: { url: `${g.thumbnail}` },
  description:  current.map(x => x).join("\n"),
  footer: { text: `Page ${page}` },
})
}

const canFitOnOnePage = lyricss.length <= 10
await interaction.reply({
embeds: [await generateEmbed(0)],
components: canFitOnOnePage
? []
: [new MessageActionRow({components: [forwardButton, deleteButton]})]
}).then(msg => {
setTimeout(async() => {
const button = new MessageButton({
  style: 'SECONDARY',
  label: '',
  emoji: '❌',
  customId: "close",
  disabled: true
})

let embed =  new MessageEmbed({
 title: `⚠️ TIME OUT - ${g.song}`,
 thumbnail: { url: `${g.thumbnail}` },
 color: "BLUE",
 description:  "THIS COMMAND IS OUT OF TIME!\nYOU CAN USE IT AGAIN!",
 footer: { text: `Astra Lyrics` },
})

await interaction.editReply({
 embeds: [embed],
 components: [
   new MessageActionRow({
     components: [button]
   })
 ]
}).catch(e => { })
}, 120000)
})

if (canFitOnOnePage) return
const filter = i =>  i.user.id === interaction.user.id
let collector = await interaction.channel.createMessageComponentCollector({filter});


let currentIndex = 0
collector.on('collect', async (int) => {

int.customId === "back" ? (currentIndex -= 10) : (currentIndex += 10)

if(int.customId === "back") {
page--
}
if(int.customId === "forward") {
page++
}
try {
await int.deferUpdate()
} catch(e) { }

await int.editReply({
embeds: [await generateEmbed(currentIndex)],
components: [
  new MessageActionRow({
    components: [
      ...(currentIndex ? [backButton] : []),
      ...(currentIndex + 10 < lyricss.length ? [forwardButton] : []),
      deleteButton
    ]
  })
]
}).catch(e => { })


if (int.customId === 'close') {
  await interaction.deleteReply().catch(e => { });
}
})


}).catch(e => {
  return interaction.reply({ content: `\`404 Please Try Again!\``, ephemeral: true }).catch(e => {});
})

},
};
