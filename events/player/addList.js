const db = require("../../mongoDB");
module.exports = async (client, queue, playlist) => {
    let lang = await db?.musicbot?.findOne({guildID: queue?.textChannel?.guild?.id})
    lang = lang?.language || client.language
    lang = require(`../../languages/${lang}.js`);
    let msg = `<@${playlist.user.id}>, \`${playlist.name} (${playlist.songs.length + " " + lang.msg116})\` ${lang.msg62}`
    queue?.textChannel?.send(msg).then((msg) => {
        setTimeout(function () {
            msg.delete();
        }, 5_000)
    }).catch(() => {
    })
}
