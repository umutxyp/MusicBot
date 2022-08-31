const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { Player } = require('discord-player');
const config = require("./config")
const fs = require('fs');
const client = new Client({
partials: [
Partials.Channel, // for text channel
Partials.GuildMember, // for guild member
Partials.User, // for discord user
],
intents: [
GatewayIntentBits.Guilds, // for guild related things
GatewayIntentBits.GuildMembers, // for guild members related things
GatewayIntentBits.GuildIntegrations, // for discord Integrations
GatewayIntentBits.GuildVoiceStates, // for voice related things
]
})

client.config = config;
client.player = new Player(client, client.config.opt.discordPlayer);
const player = client.player
player.setMaxListeners(200);
client.language = config.language || "en"
let lang = require(`./languages/${config.language || "en"}.js`)

fs.readdir("./events", (_err, files) => {
files.forEach((file) => {
if (!file.endsWith(".js")) return;
const event = require(`./events/${file}`);
let eventName = file.split(".")[0];
console.log(`${lang.loadclientevent}: ${eventName}`);
client.on(eventName, event.bind(null, client));
delete require.cache[require.resolve(`./events/${file}`)];
});
});


fs.readdir("./events/player", (_err, files) => {
files.forEach((file) => {
if (!file.endsWith(".js")) return;
const player_events = require(`./events/player/${file}`)
let playerName = file.split(".")[0]
console.log(`${lang.loadevent}: ${playerName}`)
player.on(playerName, player_events.bind(null, client))
delete require.cache[require.resolve(`./events/player/${file}`)]
})
})


client.commands = [];
fs.readdir(config.commandsDir, (err, files) => {
if (err) throw err;
files.forEach(async (f) => {
try {
let props = require(`${config.commandsDir}/${f}`);
client.commands.push({
name: props.name,
description: props.description,
options: props.options
});
console.log(`${lang.loadcmd}: ${props.name}`);
} catch (err) {
console.log(err);
}
});
});


if (config.TOKEN || process.env.TOKEN) {
client.login(config.TOKEN || process.env.TOKEN).catch(e => {
console.log(lang.error1)
})
} else {
setTimeout(() => {
console.log(lang.error2)
}, 2000)
}

const express = require("express");
const app = express();
app.get("/", (request, response) => {
response.sendStatus(200);
});
app.listen(process.env.PORT);
