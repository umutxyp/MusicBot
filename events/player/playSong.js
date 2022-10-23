const db = require("../../mongoDB");
const {EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder} = require("discord.js");
module.exports = async (client, queue, song) => {
    let lang = await db?.musicbot?.findOne({guildID: queue?.textChannel?.guild?.id})
    lang = lang?.language || client.language
    lang = require(`../../languages/${lang}.js`);
    if (queue) {
        if (!client.config.opt.loopMessage && queue?.repeatMode !== 0) return;
        const embed = new EmbedBuilder();
        embed.setColor(client.config.embedColor);
        embed.setThumbnail(song.thumbnail);
        embed.setTitle("Now playing - " + song.name)
        embed.setDescription(`> Audio \`%${queue.volume}\`
> Duration \`${song.formattedDuration}\`
> URL: **${song.url}**
> Loop Mode \`${queue.repeatMode ? (queue.repeatMode === 2 ? 'All Queue' : 'This Song') : 'Off'}\`
> Filter: \`${queue.filters.names.join(', ') || 'Off'}\`
> By: <@${song.user.id}>`);
        embed.setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel(lang.msg47)
                .setCustomId('saveTrack')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setLabel(lang.msg134)
                .setCustomId('skip')
                .setStyle(ButtonStyle.Secondary)
        );

        if (queue?.textChannel) {
            queue?.textChannel?.send({embeds: [embed], components: [row]}).catch(() => {
            });
        }
    }
}