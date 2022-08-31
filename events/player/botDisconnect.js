const db = require("../../mongoDB");
module.exports = async (client, queue) => {
let lang = await db?.musicbot?.findOne({ guildID: queue?.metadata?.guild?.id })
lang = lang?.language || client.language
lang = require(`../../languages/${lang}.js`);
if (queue) {
if (queue?.metadata) {
queue?.metadata?.send({ content: `${lang.msg16}` }).catch(e => { })
}
}
}
