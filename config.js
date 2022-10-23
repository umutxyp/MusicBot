module.exports = {
    TOKEN: "{your bot token}}",
    ownerID: "{your id}}", //write your discord user id.
    botInvite: "{your invite link}", //write your discord bot invite.
    supportServer: "", //write your discord bot support server invite.
    mongodbURL: "mongodb://localhost:27017", //write your mongodb url.
    status: "something, i don't know",
    commandsDir: './commands', //Please don't touch
    language: "en", //en, tr, nl
    embedColor: "ffa954", //hex color code
    errorLog: "871452872653537330", //write your discord error log channel id.

    voteManager: { //optional
        status: false, //true or false
        api_key: "", //write your top.gg api key. 
        vote_commands: [], //write your use by vote commands.
        vote_url: "", //write your top.gg vote url.
    },

    playlistSettings: {
        maxPlaylist: 20, //max playlist count
        maxMusic: 100, //max music count
    },

    opt: {
        DJ: {
            commands: ['back', 'clear', 'filter', 'loop', 'pause', 'resume', 'skip', 'stop', 'volume', 'shuffle', "back", "channel", "clear", "dj", "filter", "loop", "nowplaying", "pause", "play", "playlist", "queue", "resume", "save", "search", "skip", "stop", "time", "volume"] //Please don't touch
        },

        voiceConfig: {
            leaveOnFinish: false, //If this variable is "true", the bot will leave the channel the music ends.
            leaveOnStop: false, //If this variable is "true", the bot will leave the channel when the music is stopped.

            leaveOnEmpty: { //The leaveOnEnd variable must be "false" to use this system.
                status: true, //If this variable is "true", the bot will leave the channel when the bot is offline.
                cooldown: 10000000, //1000 = 1 second
            },

        },

        maxVol: 100, //You can specify the maximum volume level.

    }
}
