module.exports = {
    TOKEN: "MTAzMzAxMDM3ODEyNjQwMTY2Nw.GpMp5C.Jz-ZgCUWdc_SmBp46rEPZ6hNXlO654J5o2xNXo",
    ownerID: "", //write your discord user id.
    botInvite: "https://discord.com/api/oauth2/authorize?client_id=1033010378126401667&permissions=274881170432&scope=bot%20applications.commands", //write your discord bot invite.
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
            commands: ["back", "channel", "clear", "dj", "filter", "help", "language", "loop", "now-playing", "pause", "ping", "play", "playlist", "queue", "resume", "save", "shuffle", "skip", "stop", "time", "volume"] //Please don't touch
        },

        voiceConfig: {
            leaveOnFinish: false, //If this variable is "true", the bot will leave the channel the music ends.
            leaveOnStop: false, //If this variable is "true", the bot will leave the channel when the music is stopped.
            leaveOnEmpty: { //The leaveOnEnd variable must be "false" to use this system.
                status: true, //If this variable is "true", the bot will leave the channel when the bot is offline.
                cooldown: 1000000, //1000 = 1 second
            },

        },

        maxVol: 100, //You can specify the maximum volume level.

    }
}
