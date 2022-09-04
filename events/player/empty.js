const db = require("../../mongoDB");
module.exports = async (client, queue) => {
let lang = await db?.musicbot?.findOne({ guildID: channel?.guild?.id })
lang = lang?.language || client.language
lang = require(`../../languages/${lang}.js`);
if(client?.config?.opt?.voiceConfig?.leaveOnEmpty?.status === true){
return queue?.textChannel?.send({ content: `${lang.msg15}` }).catch(e => { })
}
}

