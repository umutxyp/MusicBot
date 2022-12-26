const db = require("../../mongoDB");
module.exports = async (client, queue, song) => {
    let lang = await db?.musicbot?.findOne({guildID: queue?.textChannel?.guild?.id})
    lang = lang?.language || client.language
    lang = require(`../../languages/${lang}.js`);
    let msg = `<@${song.user.id}>, **${song.name}** ${lang.msg79}`
    queue?.textChannel?.send(msg).then((msg) => {
        setTimeout(function () {
            msg.delete();
        }, 5_000)
    }).catch(() => {
    })
}