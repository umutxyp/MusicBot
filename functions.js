function errorNotifer(client, interaction, e, lang) {
const { EmbedBuilder } = require("discord.js")
if(client.errorLog){

    if(client.shard){
        let embed = new EmbedBuilder()
        .setColor(client.config.embedColor)
        .setTimestamp()
        .addFields([
            { name: "Command", value: `${interaction?.commandName}` },
            { name: "Error", value: `${e.stack}` },
            { name: "User", value: `${interaction?.user?.tag} \`(${interaction?.user?.id})\``, inline: true },
            { name: "Guild", value: `${interaction?.guild?.name} \`(${interaction?.guild?.id})\` - \`${interaction?.guild?.memberCount} members\``, inline: true },
            { name: "Time", value: `<t:${Math.floor(Date.now()/1000)}:R>`, inline: true },
            { name: "Command Usage Channel", value: `${interaction?.channel?.name} \`(${interaction?.channel?.id})\``, inline: true },
            { name: "User Voice Channel", value: `${interaction?.member?.voice?.channel?.name} \`(${interaction?.member?.voice?.channel?.id})\``, inline: true },
        ])
     client.shard.broadcastEval(async (c, { channelId, embed}) => {
           let channel = c.channels.cache.get(channelId);
           channel?.send({ embeds: [embed] }).catch(e => { })
      }, { context: { channelId: client?.errorLog, embed: embed } })

    } else {
        let embed = new EmbedBuilder()
.setColor(client.config.embedColor)
.setTimestamp()
.addFields([
    { name: "Command", value: `${interaction?.commandName}` },
    { name: "Error", value: `${e.stack}` },
    { name: "User", value: `${interaction?.user?.tag} \`(${interaction?.user?.id})\``, inline: true },
    { name: "Guild", value: `${interaction?.guild?.name} \`(${interaction?.guild?.id})\``, inline: true },
    { name: "Time", value: `<t:${Math.floor(Date.now()/1000)}:R>`, inline: true },
    { name: "Command Usage Channel", value: `${interaction?.channel?.name} \`(${interaction?.channel?.id})\``, inline: true },
    { name: "User Voice Channel", value: `${interaction?.member?.voice?.channel?.name} \`(${interaction?.member?.voice?.channel?.id})\``, inline: true },
])
client.channels.cache.get(client?.errorLog)?.send({ embeds: [embed] }).catch(e => { })
    }

    } else {
    console.log(`
    Command: ${interaction?.commandName}
    Error: ${e}
    User: ${interaction?.user?.tag} (${interaction?.user?.id})
    Guild: ${interaction?.guild?.name} (${interaction?.guild?.id})
    Command Usage Channel: ${interaction?.channel?.name} (${interaction?.channel?.id})
    User Voice Channel: ${interaction?.member?.voice?.channel?.name} (${interaction?.member?.voice?.channel?.id})
    `)
    }
    return interaction.reply({ content: `${lang.error7}\n\`${e}\``, ephemeral: true }).catch(e => { })

}

module.exports = errorNotifer;