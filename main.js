const { Player } = require('discord-player');
const { Client, Intents, Collection } = require('discord.js');
const fs = require('fs');

let client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES
    ]
})

client.db = require("croxydb")
client.config = require('./config');
client.player = new Player(client, client.config.opt.discordPlayer);
const player = client.player

const mongoose = require("mongoose");
var database = require("./DATABASE/mongodb.js");
mongoose.connect(client.config.mongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
    }).then(() => {
        console.log(`Connected MongoDB`);
    }).catch((err) => {
        return console.log("MongoDB Error: " + err);
    })

client.mdb = database

const synchronizeSlashCommands = require('discord-sync-commands-v14');
client.commands = new Collection();
fs.readdir("./commands/", (_err, files) => {
    files.forEach((file) => {
        if (!file.endsWith(".js")) return;
        let props = require(`./commands/${file}`);
        let commandName = file.split(".")[0];
        client.commands.set(commandName, {
            name: commandName,
            ...props
        });
        console.log(`👌 Loadded Slash Command: ${commandName}`);
    });
    synchronizeSlashCommands(client, client.commands.map((c) => ({
        name: c.name,
        description: c.description,
        options: c.options,
        type: 'CHAT_INPUT'
    })), {
        debug: false
    });
});

fs.readdir("./events", (_err, files) => {
  files.forEach((file) => {
      if (!file.endsWith(".js")) return;
      const event = require(`./events/${file}`);
      let eventName = file.split(".")[0];
      console.log(`👌 Loadded Event: ${eventName}`);
      client.on(eventName, event.bind(null, client));
      delete require.cache[require.resolve(`./events/${file}`)];
  });
});


player.on('trackStart', (queue, track) => {
    if(queue){
    if (!client.config.opt.loopMessage && queue.repeatMode !== 0) return;
        if(queue.metadata){
    queue.metadata.send({ content: `🎵 Music started playing: **${track.title}** -> Channel: **${queue.connection.channel.name}** 🎧` }).catch(e => { })
        }}
});

player.on('trackAdd', (queue, track) => {
    if(queue){
        if(queue.metadata){
    queue.metadata.send({ content: `**${track.title}** added to playlist. ✅` }).catch(e => { })
        }}
});

player.on('channelEmpty', (queue) => {
    if(queue){
        if(queue.metadata){
    queue.metadata.send({ content: 'I left the audio channel because there is no one on my audio channel. ❌' }).catch(e => { })
        }}
});

player.on('queueEnd', (queue) => {
    if(client.config.opt.voiceConfig.leaveOnTimer.status === true) {
        if(queue){
        setTimeout(() => {
            if(queue.connection) queue.connection.disconnect();
        }, client.config.opt.voiceConfig.leaveOnTimer.time);
    }
        if(queue.metadata){
    queue.metadata.send({ content: 'All play queue finished, I think you can listen to some more music. ✅' }).catch(e => { })
        }}
});

player.on("error",  (queue, error) => {
    if(queue){
        if(queue.metadata){
            queue.metadata.send({ content: 'Im having trouble trying to connect to the voice channel. ❌ | `'+error+"`" }).catch(e => { })
        }}
})

if(client.config.TOKEN){
client.login(client.config.TOKEN).catch(e => {
console.log("The Bot Token You Entered Into Your Project Is Incorrect Or Your Bot's INTENTS Are OFF!")
})
} else {
console.log("Please Write Your Bot Token Opposite The Token In The config.js File In Your Project!")
}

setTimeout(() => {
if(client.db.all()){
    client.db.deleteAll()
    }
}, 5000)
