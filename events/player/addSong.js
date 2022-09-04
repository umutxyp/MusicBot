const db = require("../../mongoDB");
module.exports = async (client, queue, song) => {
let lang = await db?.musicbot?.findOne({ guildID: queue?.textChannel?.guild?.id })
lang = lang?.language || client.language
lang = require(`../../languages/${lang}.js`);
queue?.textChannel?.send({ content: `<@${song.user.id}>, **${song.name}** ${lang.msg79}` }).catch(e => { })
}
