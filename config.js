module.exports = {
TOKEN: "",
ownerID: "", //write your discord user id.
botInvite: "", //write your discord bot invite.
mongodbURL: "", //write your mongodb url.
status: '❤️ codeshare.me',
commandsDir: './commands', //Please don't touch
language: "en", //en, tr
embedColor: "ffa954", //hex color code

opt: {
DJ: {
commands: ['back', 'clear', 'filter', 'loop', 'pause', 'resume', 'skip', 'stop', 'volume'] //Please don't touch
},

voiceConfig: {
leaveOnEnd: false, //If this variable is "true", the bot will leave the channel the music ends.
autoSelfDeaf: false, //IF YOU WANT TO DEAF THE BOT, set false to true.

leaveOnEmpty: { //The leaveOnEnd variable must be "false" to use this system.
status: false, //If this variable is "true", the bot will leave the channel when the bot is offline.
cooldown: 1000000, //1000 = 1 second
},

leaveOnTimer: { //The leaveOnEnd variable must be "false" to use this system.
status: true, //If this variable is "true", the bot will leave the channel when the bot is offline.
cooldown: 1000000, //1000 = 1 second
}
},

maxVol: 150, //You can specify the maximum volume level.
loopMessage: false,

discordPlayer: {
ytdlOptions: {
quality: 'highestaudio', //Please don't touch
highWaterMark: 1 << 25 //Please don't touch
}
}
}
}

