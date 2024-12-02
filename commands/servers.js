const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const config = require("../config.js")
module.exports = {
    name: "servers",
    description: "Admin command.",
    options: [{
        name: "server",
        description: "The server you want to get information about.",
        type: 3,
        required: false
    }],
    permissions: "0x0000000000000800",
    run: async (client, interaction) => {

        if(!client.config.ownerID.includes(interaction?.user?.id)) return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true }).catch(e => { });


        const server = interaction.options.getString('server');
        if (server) {
            let guild
if(config.shardManager.shardStatus == true){
            const getServer = async (guildID) => {
                const req = await client.shard.broadcastEval((c, id) => c.guilds.cache.get(id), { 
                    context: guildID
                });
                return req.find(res => !!res) || null;
            }
             guild = await getServer(server);
             if (!guild) return interaction.reply({ content: "I'm not in that server.", ephemeral: true }).catch(e => { });

             const embed = new EmbedBuilder()
                 .setTitle(`Server Info: ${guild.name}`)
                 .setDescription(`> **ID:** \`${guild.id}\`\n> **Members:** \`${guild.memberCount}\`\n> **Channels:** \`${guild.channels.length}\`\n> **Roles:** \`${guild.roles.length}\`\n> **Emojis:** \`${guild.emojis.length}\`\n> **Boosts:** \`${guild.premiumSubscriptionCount}\`\n> **Boost Level:** \`${guild.premiumTier}\``)
                 .setColor(client.config.embedColor)
                 .setThumbnail(guild.iconURL)
                 //fetch a guild invite url
                 .addFields([
                     { name: "Invite", value: guild?.vanityURLCode ? `https://discord.gg/${guild?.vanityURLCode}` : "Not found invite." },
                 ])
                 .setTimestamp()
             return interaction.reply({ embeds: [embed], ephemeral: true }).catch(e => { })
} else {
    guild = client.guilds.cache.get(server)
    if (!guild) return interaction.reply({ content: "I'm not in that server.", ephemeral: true }).catch(e => { });

    const embed = new EmbedBuilder()
        .setTitle(`Server Info: ${guild.name}`)
        .setDescription(`> **ID:** \`${guild.id}\`\n> **Members:** \`${guild.memberCount}\`\n> **Channels:** \`${guild.channels.cache.size}\`\n> **Roles:** \`${guild.roles.cache.size}\`\n> **Emojis:** \`${guild.emojis.cache.size}\`\n> **Boosts:** \`${guild.premiumSubscriptionCount}\`\n> **Boost Level:** \`${guild.premiumTier}\``)
        .setColor(client.config.embedColor)
        .setThumbnail(guild.iconURL())
        //fetch a guild invite url
        .addFields([
            { name: "Invite", value: guild?.vanityURLCode ? `https://discord.gg/${guild?.vanityURLCode}` : "Not found invite." },
        ])
        .setTimestamp()
    return interaction.reply({ embeds: [embed], ephemeral: true }).catch(e => { })
}
          
        } else {
            let guilds
            if(config.shardManager.shardStatus == true){
            //fetch all guilds
             guilds = await client.shard.broadcastEval(c => c.guilds.cache.map(g => {
                return {
                    name: g.name,
                    id: g.id,
                    memberCount: g.memberCount
                }
            }));
            //sort from largest to smallest
            guilds = guilds.flat().sort((a, b) => b.memberCount - a.memberCount);
            } else {
                guilds = client.guilds.cache.map(g => {
                return {
                    name: g.name,
                    id: g.id,
                    memberCount: g.memberCount
                }
            })
            //sort from largest to smallest
            guilds = guilds.flat().sort((a, b) => b.memberCount - a.memberCount);
            }
            
            //page system
            let page = 0;
            const maxPage = Math.ceil(guilds.length / 10) - 1;
            const embed = new EmbedBuilder()
                .setTitle(`Servers (${guilds.length})`)
                .setDescription(guilds.slice(page * 10, page * 10 + 10).map(g => `> **${g.name}** \`(${g.id})\` - \`${g.memberCount}\` members`).join("\n"))
                .setColor(client.config.embedColor)
                .setTimestamp()
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("prev")
                        .setLabel("Previous")
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === 0 ? true : false),
                    new ButtonBuilder()
                        .setCustomId("next")
                        .setLabel("Next")
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === maxPage ? true : false)
                )
            const msg = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true }).catch(e => { });
            const filter = (i) => i.user.id === interaction.user.id;
            const collector = msg.createMessageComponentCollector({ filter, time: 600000 });
            collector.on("collect", async (i) => {
                if (i.customId === "prev") {
                    page--;
                    embed.setDescription(guilds.slice(page * 10, page * 10 + 10).map(g => `> **${g.name}** \`(${g.id})\` - \`${g.memberCount}\` members`).join("\n"));
                    row.components[0].setDisabled(page === 0 ? true : false);
                    row.components[1].setDisabled(page === maxPage ? true : false);
                    await i.update({ embeds: [embed], components: [row] }).catch(e => { });
                } else if (i.customId === "next") {
                    page++;
                    embed.setDescription(guilds.slice(page * 10, page * 10 + 10).map(g => `> **${g.name}** \`(${g.id})\` - \`${g.memberCount}\` members`).join("\n"));
                    row.components[0].setDisabled(page === 0 ? true : false);
                    row.components[1].setDisabled(page === maxPage ? true : false);
                    await i.update({ embeds: [embed], components: [row] }).catch(e => { });
                }
            });

            collector.on("end", async () => {
                row.components[0].setDisabled(true);
                row.components[1].setDisabled(true);
                await msg.edit({ embeds: [embed], components: [row] }).catch(e => { });
            });
        }

    }}