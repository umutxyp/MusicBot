const db = require("../../mongoDB");
module.exports = async (client, queue, song) => {
let lang = await db?.musicbot?.findOne({ guildID: queue?.textChannel?.guild?.id })
lang = lang?.language || client.language
lang = require(`../../languages/${lang}.js`);
if (queue) {
if (!client.config.opt.loopMessage && queue?.repeatMode !== 0) return;
if (queue?.textChannel) {
queue?.textChannel?.send({ content: lang.msg13.replace("{track?.title}", song?.name).replace("{queue?.connection.channel.name}", `<#${queue.voice.connection.joinConfig.channelId}>`) }).catch(e => { });
}
}
}