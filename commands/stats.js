const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
module.exports = {
    description: "Provides information about the bot's statistics.",
    name: 'stats',
    options: [],
    run: async (client, interaction) => {
        let button = new MessageActionRow().addComponents(
            new MessageButton()
            .setStyle("SUCCESS")
            .setLabel("Update")
            .setCustomId("rel"),
            new MessageButton()
            .setStyle("DANGER")
            .setLabel("Delete")
            .setCustomId("del"))
            
                let embed = new MessageEmbed()
                .setColor("BLUE")
                .setTimestamp()
                .setThumbnail(client.user.displayAvatarURL())
                .setTitle(client.user.username)
                .setFooter({ text: 'Music Bot Commands - by Umut Bayraktar ❤️', iconURL:interaction.user.displayAvatarURL({ dynamic: true }) })
                .setDescription(`> **Guilds: \`${client.guilds.cache.size}\`**
> **Users: \`${Math.ceil(client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString("tr-TR"))}.000\`**
> **Channels: \`${client.channels.cache.size}\`**`)
.addField("Invite Bot", `**[Add Me](https://bit.ly/3PHDjyC) | [Vote](https://bit.ly/3LYzaDe) | [Support](https://discord.gg/ST89uArTdh) | [Website](https://astrabot.vercel.app/) | [Source Code](https://github.com/1umutda/MusicBot)**` ,true)
                      interaction.reply({embeds:[embed], components:[button]}).then(async Message => {
                    
                    const filter = i =>  i.user.id === interaction.user.id
                    let col = await interaction.channel.createMessageComponentCollector({filter, time: 180000 });
            
                    col.on('collect', async(button) => {
                    if(button.user.id !== interaction.user.id) return
                    
                      switch (button.customId) {
                        case 'rel':
                              const embedd = new MessageEmbed()
                        .setColor("BLUE")
                        .setTimestamp()
                        .setThumbnail(client.user.displayAvatarURL())
                        .setTitle(client.user.username)
                        .setFooter({ text: 'Music Bot Commands - by Umut Bayraktar ❤️', iconURL:interaction.user.displayAvatarURL({ dynamic: true }) })
                        .setDescription(`> **Guilds: \`${client.guilds.cache.size}\`**
> **Users: \`${Math.ceil(client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString("tr-TR"))}.000\`**
> **Channels: \`${client.channels.cache.size}\`**`)
.addField("Invite Bot", `**[Add Me](https://bit.ly/3PHDjyC) | [Vote](https://bit.ly/3LYzaDe) | [Support](https://discord.gg/ST89uArTdh) | [Website](https://astrabot.vercel.app/) | [Source Code](https://github.com/1umutda/MusicBot)**` ,true)
                      await interaction.editReply({embeds: [embedd]}).catch(e => { });
                        button.reply({content: "> **✅ Success:** Bot statistics updated!", ephemeral: true}).catch(e => { });
            
                        break
                        case 'del':
                        col.stop(true)
                        await interaction.deleteReply().catch(e => { });
                        button.reply({content: "> **✅ Success** Bot statistic deleted!", ephemeral: true}).catch(e => { });
                        break
            
                      }
                    })
                    col.on('end', async(button) => {

                         button = new MessageActionRow().addComponents(
                            new MessageButton()
                            .setStyle("SUCCESS")
                            .setLabel("Update")
                            .setCustomId("rel")
                            .setDisabled(true),
                            new MessageButton()
                            .setStyle("DANGER")
                            .setLabel("Delete")
                            .setCustomId("del")
                            .setDisabled(true))

                        const embedd = new MessageEmbed()
                        .setColor("BLUE")
                        .setTimestamp()
                        .setThumbnail(client.user.displayAvatarURL())
                        .setTitle(client.user.username + " Command Time Ended")
                        .setFooter({ text: 'Music Bot Commands - by Umut Bayraktar ❤️', iconURL:interaction.user.displayAvatarURL({ dynamic: true }) })
                        .setDescription(`> **Guilds: \`${client.guilds.cache.size}\`**
> **Users: \`${Math.ceil(client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString("tr-TR"))}.000\`**
> **Channels: \`${client.channels.cache.size}\`**`)
.addField("Invite Bot", `**[Add Me](https://bit.ly/3PHDjyC) | [Vote](https://bit.ly/3LYzaDe) | [Support](https://discord.gg/ST89uArTdh) | [Website](https://astrabot.vercel.app/) | [Source Code](https://github.com/1umutda/MusicBot)**` ,true)
                      await interaction.editReply({embeds: [embedd], components:[button]}).catch(e => { });
                    })
                }).catch(e => { });
    },
};
