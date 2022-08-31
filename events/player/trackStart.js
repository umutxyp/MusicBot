const db = require("../../mongoDB");
module.exports = async (client, queue, track) => {
let lang = await db?.musicbot?.findOne({ guildID: queue?.metadata?.guild?.id })
lang = lang?.language || client.language
lang = require(`../../languages/${lang}.js`);
if (queue) {
if (!client.config.opt.loopMessage && queue?.repeatMode !== 0) return;
if (queue?.metadata) {
queue?.metadata?.send({ content: lang.msg13.replace("{track?.title}", track?.title).replace("{queue?.connection.channel.name}", queue?.connection.channel.name)}).catch(e => { });
}
}
}
