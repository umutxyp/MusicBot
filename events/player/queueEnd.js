const db = require("../../mongoDB");
module.exports = async (client, queue) => {
let lang = await db?.musicbot?.findOne({ guildID: queue?.metadata?.guild?.id })
lang = lang?.language || client.language
lang = require(`../../languages/${lang}.js`);
if (client.config.opt.voiceConfig.leaveOnTimer.status === true) {
if (queue) {
setTimeout(async() => {
if (queue?.connection) {
if (!queue?.playing) { //additional check in case something new was added before time was up
await queue?.connection?.disconnect()
}
};
}, client.config.opt.voiceConfig.leaveOnTimer.cooldown);
}
}
if (queue?.metadata) {
queue?.metadata?.send({ content: `${lang.msg14}` }).catch(e => { })
}
}
