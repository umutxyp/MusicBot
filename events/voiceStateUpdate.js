const db = require("../mongoDB");
module.exports = async (client, oldState, newState) => {
const queue = client.player.getQueue(oldState.guild.id);
if(queue || queue?.playing || queue?.tracks[0]){
if(newState.id === client.user.id){
let lang = await db?.musicbot?.findOne({ guildID: queue?.metadata?.guild?.id })
lang = lang?.language || client.language
lang = require(`../languages/${lang}.js`);
if(oldState.serverMute === false && newState.serverMute === true){
if(queue?.metadata){
await queue.setPaused(true)
await queue?.metadata?.send({ content: `${lang.msg128}` }).catch(e => { })
}
}
if(oldState.serverMute === true && newState.serverMute === false){
if(queue?.metadata){
await queue.setPaused(false);
}
}
}
}
}
