const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
module.exports = {
    name: 'static',
    aliases: ["statistics","i","istatistik"],
    utilisation: '{prefix}static',

    execute(client, message) {
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
                .setFooter({ text: 'Music Bot Commands - by Umut Bayraktar ❤️', iconURL:message.author.avatarURL({ dynamic: true }) })
                .setDescription(`**
            > Guilds: \`${client.guilds.cache.size}\`
            > Users: \`${Math.ceil(client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString("tr-TR"))}.000\`
            > Channels: \`${client.channels.cache.size}\`**`)
                .addField("Invite Bot", `**[Add Me](https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=1084516334400)**` ,true)
                message.channel.send({embeds:[embed], components:[button]}).then(async Message => {
                    
                    const filter = i =>  i.user.id === message.author.id
                    let col = await Message.createMessageComponentCollector({filter, time: 1200000 });
            
                    col.on('collect', async(button) => {
                    if(button.user.id !== message.author.id) return
                    
                      switch (button.customId) {
                        case 'rel':
                              const embedd = new MessageEmbed()
                        .setColor("BLUE")
                        .setTimestamp()
                        .setThumbnail(client.user.displayAvatarURL())
                        .setTitle(client.user.username)
                        .setFooter({ text: 'Music Bot Commands - by Umut Bayraktar ❤️', iconURL:message.author.avatarURL({ dynamic: true }) })
                        .setDescription(`**
            > Guilds: \`${client.guilds.cache.size}\`
            > Users: \`${Math.ceil(client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString("tr-TR"))}.000\`
            > Channels: \`${client.channels.cache.size}\`**`)
                        .addField("Invite Bot", `**[Add Me](https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=1084516334400)**` ,true)
                              
                        await Message.edit({embeds: [embedd]})
                        button.reply({content: "> **✅ Success:** Bot statistics updated!", ephemeral: true}).catch(e => { });
            
                        break
                        case 'del':
                        col.stop(true)
                        await message.delete().catch(e => { });
                        await Message.delete().catch(e => { });
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
                        .setFooter({ text: 'Music Bot Commands - by Umut Bayraktar ❤️', iconURL:message.author.avatarURL({ dynamic: true }) })
                        .setDescription(`**
            > Guilds: \`${client.guilds.cache.size}\`
            > Users: \`${Math.ceil(client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString("tr-TR"))}.000\`
            > Channels: \`${client.channels.cache.size}\`**`)
                        .addField("Invite Bot", `**[Add Me](https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=1084516334400)**` ,true)
                              
                        await Message.edit({embeds: [embedd], components:[button]})
                    })
                }).catch(e => { });
    },
};
