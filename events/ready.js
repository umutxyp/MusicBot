const config = require("../config.js");
const db = require("../mongoDB");
module.exports = async (client) => {
    let lang = client.language
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const rest = new REST({ version: "10" }).setToken(config.TOKEN || process.env.TOKEN);
(async () => {
try {
await rest.put(Routes.applicationCommands(client.user.id), {
body: await client.commands,
});
console.log(lang.loadslash)
} catch (err) {
console.log(lang.error3 + err);
}
})();

if(config.mongodbURL || process.env.MONGO){
const mongoose = require("mongoose")
mongoose.connect(config.mongodbURL || process.env.MONGO, {
useNewUrlParser: true,
useUnifiedTopology: true,
}).then(async () => {
console.log(`Connected MongoDB`)
await db.loop.deleteOne()
await db.queue.deleteOne()
await db.playlist_timer.deleteOne()
await db.playlist_timer2.deleteOne()
}).catch((err) => {
console.log("MongoDB Error: " + err)
})
} else {
console.log(lang.error4)
}

console.log(client.user.username + lang.ready);
console.log(`${lang.error5}`)

client.user.setStatus('ONLINE');
client.user.setActivity(config.status)

}
