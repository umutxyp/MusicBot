const {EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');
const db = require("../mongoDB");
module.exports = {
    name: "loop",
    description: "Turns the music loop mode on or off.",
    permissions: "0x0000000000000800",
    options: [],
    voiceChannel: true,
    run: async (client, interaction) => {
        let lang = await db?.musicbot?.findOne({guildID: interaction.guild.id})
        lang = lang?.language || client.language
        lang = require(`../languages/${lang}.js`);
        try {

            const queue = client.player.getQueue(interaction.guild.id);
            if (!queue || !queue.playing) return interaction.reply({content: lang.msg5, ephemeral: true}).catch(e => {
            })
            let cmds = await db.loop.findOne({
                userID: interaction.user.id,
                guildID: interaction.guild.id,
                channelID: interaction.channel.id
            }).catch(() => {
            });
            if (cmds) return interaction.reply({
                content: `${lang.msg34}\nhttps://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}/${cmds.messageID}`,
                ephemeral: true
            }).catch(() => {
            })

            let button = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel(lang.msg35)
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId("queue"),
                new ButtonBuilder()
                    .setLabel(lang.msg36)
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId("now-playing"),
                new ButtonBuilder()
                    .setLabel(lang.msg37)
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId("close")
            )
            const embed = new EmbedBuilder()
                .setColor(client.config.embedColor)
                .setTitle(lang.msg38)
                .setDescription(lang.msg39)
                .setTimestamp()
            interaction.reply({embeds: [embed], components: [button], fetchReply: true}).then(async Message => {
                await db.loop.updateOne({
                    userID: interaction.user.id,
                    guildID: interaction.guild.id,
                    channelID: interaction.channel.id
                }, {
                    $set: {
                        messageID: Message.id
                    }
                }, {upsert: true}).catch(() => {
                })
                const filter = i => i.user.id === interaction.user.id
                let col = await interaction.channel.createMessageComponentCollector({filter, time: 60 * 1000});

                col.on('collect', async (button) => {
                    if (button.user.id !== interaction.user.id) return
                    const queue1 = client.player.getQueue(interaction.guild.id);
                    if (!queue1 || !queue1.playing) {
                        await interaction.editReply({content: lang.msg5, ephemeral: true}).catch(() => {
                        })
                        await button.deferUpdate().catch(() => {
                        })
                    }
                    switch (button.customId) {
                        case 'queue':
                            queue.setRepeatMode(2);
                            interaction.editReply({content: `${lang.msg40} ✅`}).catch(() => {
                            })
                            await button.deferUpdate().catch(() => {
                            })
                            break
                        case 'now-playing':
                            queue.setRepeatMode(1);
                            interaction.editReply({content: `${lang.msg42} ✅`}).catch(() => {
                            })
                            await button.deferUpdate().catch(() => {
                            })
                            break
                        case 'close':
                            if (queue.repeatMode === 0) {
                                await button.deferUpdate().catch(() => {
                                })
                                return interaction.editReply({content: lang.msg43, ephemeral: true}).catch(() => {
                                })
                            }
                            queue.setRepeatMode(0);
                            interaction.editReply({content: lang.msg44}).catch(() => {
                            })
                            await button.deferUpdate().catch(() => {
                            })
                            break
                    }
                })
                col.on('end', async (button) => {
                    await db.loop.deleteOne({
                        userID: interaction.user.id,
                        guildID: interaction.guild.id,
                        channelID: interaction.channel.id
                    }).catch(() => {
                    })
                    await interaction.deleteReply().catch(() => {
                    });
                })
            }).catch(() => {
            })

        } catch (e) {
            if (client.errorLog) {
                let embed = new EmbedBuilder()
                    .setColor(client.config.embedColor)
                    .setTimestamp()
                    .addFields([
                        {name: "Command", value: `${interaction?.commandName}`},
                        {name: "Error", value: `${e.stack}`},
                        {name: "User", value: `${interaction?.user?.tag} \`(${interaction?.user?.id})\``, inline: true},
                        {
                            name: "Guild",
                            value: `${interaction?.guild?.name} \`(${interaction?.guild?.id})\``,
                            inline: true
                        },
                        {name: "Time", value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true},
                        {
                            name: "Command Usage Channel",
                            value: `${interaction?.channel?.name} \`(${interaction?.channel?.id})\``,
                            inline: true
                        },
                        {
                            name: "User Voice Channel",
                            value: `${interaction?.member?.voice?.channel?.name} \`(${interaction?.member?.voice?.channel?.id})\``,
                            inline: true
                        },
                    ])
                await client.errorLog.send({embeds: [embed]}).catch(() => {
                })
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
            return interaction.reply({content: `${lang.error7}\n\`${e}\``, ephemeral: true}).catch(() => {
            })
        }
    }
}
