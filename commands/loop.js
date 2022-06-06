const { QueueRepeatMode } = require('discord-player');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
module.exports = {
    description: "Turns the music loop mode on or off.",
    name: 'loop',
    options: [],
    voiceChannel: true,

    run: async (client, interaction) => {
        const queue = client.player.getQueue(interaction.guild.id);
let cmds = client.db.get("loop."+interaction.user.id+interaction.guild.id+interaction.channel.id)
if (!queue || !queue.playing) return interaction.reply({ content: `There is no music currently playing!. ❌`, ephemeral: true }).catch(e => { })
if(cmds) return interaction.reply({ content: `You already have an active command here. ❌\nhttps://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}`, ephemeral: true }).catch(e => { })

await client.db.set("loop."+interaction.user.id+interaction.guild.id+interaction.channel.id, "active")

let button = new MessageActionRow().addComponents(
    new MessageButton()
    .setLabel("Loop")
    .setStyle("SUCCESS")
    .setCustomId("loop"))

        const embed = new MessageEmbed()
            .setColor("BLUE")
            .setTitle('Loop System')
            .setDescription(`**${queue.current.title}** is now looping.`)
            .setTimestamp()
            .setFooter({ text: 'Astra Bot - by Umut Bayraktar ❤️', iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        interaction.reply({ embeds: [embed], components:[button]}).then(async Message => {

            const filter = i =>  i.user.id === interaction.user.id
            let col = await interaction.channel.createMessageComponentCollector({filter, time: 120000 });
    
            col.on('collect', async(button) => {
            if(button.user.id !== interaction.user.id) return
            
              switch (button.customId) {
                case 'loop':
                    if (queue.repeatMode === 1) return interaction.reply({ content: `You should disable loop mode of existing music first **(/loop)** ❌`, ephemeral: true }).catch(e => { })
                    const success = queue.setRepeatMode(queue.repeatMode === 0 ? QueueRepeatMode.QUEUE : QueueRepeatMode.OFF);
                     interaction.editReply({ content: success ? `Loop Mode: **${queue.repeatMode === 0 ? 'Inactive' : 'Active'}**, The whole sequence will repeat non-stop 🔁` : `Something went wrong. ❌`}).catch(e => { })
                    await button.deferUpdate();
                break
            }
            })
            col.on('end', async(button) => {
                await client.db.delete("loop."+interaction.user.id+interaction.guild.id+interaction.channel.id)
                 button = new MessageActionRow().addComponents(
                    new MessageButton()
                    .setStyle("SUCCESS")
                    .setLabel("Loop It")
                    .setCustomId("loop")
                    .setDisabled(true))

                    const embed = new MessageEmbed()
                    .setColor("BLUE")
                    .setTitle('Loop System - Ended')
                    .setDescription(`Your time is up to choose.`)
                    .setTimestamp()
                    .setFooter({ text: 'Astra Bot - by Umut Bayraktar ❤️', iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                      
                await interaction.editReply({embeds: [embed], components:[button]}).catch(e => { });
            })
        }).catch(e => { })
}
}
