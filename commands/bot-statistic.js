const { EmbedBuilder, version } = require("discord.js")
const config = require("../config.js");
const db = require("../mongoDB");
module.exports = {
name: "statistic",
description: "View your bot statistics.",
options: [],
permissions: "0x0000000000000800",
run: async (client, interaction) => {
let lang = await db?.musicbot?.findOne({ guildID: interaction.guild.id })
lang = lang?.language || client.language
lang = require(`../languages/${lang}.js`);
const embed = new EmbedBuilder()
.setTitle(client.user.username + lang.msg19)
.setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 1024 }))
.setDescription(`**
• Owner: \`${client.users.cache.get(config.ownerID)?.tag || "Undefined"}\`
• Developer: \`Umut#6070\`

• User Count: \`${client.users.cache.size}\`
• Server Count: \`${client.guilds.cache.size}\`
• Channel Count: \`${client.channels.cache.size}\`
• Connected Voice: \`${client?.voice?.adapters?.size || 0}\`
• Command Count: \`${client.commands.map(c => c.name).length}\`
• Discord.js Version: \`V${version}\`
• Node.js Version: \`${process.version}\`
• Operation Time: <t:${Math.floor(Number(Date.now() - client.uptime) / 1000)}:R>
• Ping: \`${client.ws.ping} MS\`
• Memory Usage: \`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\`
• OS: \`${process.platform}\`
• Invite Bot: [Click](${config.botInvite})
**`)
.setColor(client.config.embedColor)
.setTimestamp()
return interaction.reply({ embeds: [embed] }).catch(err => { })
},
};
