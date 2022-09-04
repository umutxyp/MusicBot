const db = require("../../mongoDB");
module.exports = async (client, queue) => {
let lang = await db?.musicbot?.findOne({ guildID: queue?.textChannel?.guild?.id })
lang = lang?.language || client.language
lang = require(`../../languages/${lang}.js`);
if (queue?.textChannel) {
queue?.textChannel?.send({ content: `${lang.msg14}` }).catch(e => { })
}
}
