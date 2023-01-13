module.exports = {
TOKEN: "",
ownerID: ["1059099611471564820"], 
botInvite: "", 
supportServer: "",
mongodbURL: "mongodb://Markus:8911@ac-an9wjux-shard-00-00.rgbt0yp.mongodb.net:27017,ac-an9wjux-shard-00-01.rgbt0yp.mongodb.net:27017,ac-an9wjux-shard-00-02.rgbt0yp.mongodb.net:27017/?ssl=true&replicaSet=atlas-es6llo-shard-0&authSource=admin&retryWrites=true&w=majority", 
status: "FINNOLANO BOT",
commandsDir: './commands', 
language: "ru", //en, tr, nl, pt, fr, ar, zh_TW, it, ru
embedColor: "296D98", 
errorLog: "", 


sponsor: {
status: true, 
url: "https://finovskoy.tk", 
},

voteManager: { 
status: false, 
api_key: "", 
vote_commands: ["back","channel","clear","dj","filter","loop","nowplaying","pause","play","playlist","queue","resume","save","search","skip","stop","time","volume"], 
vote_url: "", 
},

shardManager:{
shardStatus: false 
},

playlistSettings:{
maxPlaylist: 10, 
maxMusic: 75, 
},

opt: {
DJ: {
commands: ['back', 'clear', 'filter', 'loop', 'pause', 'resume', 'skip', 'stop', 'volume', 'shuffle'] 
},

voiceConfig: {
leaveOnFinish: false,
leaveOnStop: false, 
  
leaveOnEmpty: { 
status: true, 
cooldown: 10000000, 
},

},

maxVol: 200, 

}
}
