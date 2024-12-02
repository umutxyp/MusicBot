
# MusicBot v15.5 🎵

A professional and completely free music bot for Discord, based on **DisTube** and powered by **discord.js v14.16**. The bot supports multiple languages, custom playlists, advanced filters, and more, designed for seamless audio enjoyment on your Discord server.

![GitHub Stars](https://img.shields.io/github/stars/umutxyp/musicbot?style=social)  
![GitHub Forks](https://img.shields.io/github/forks/umutxyp/musicbot?style=social)  
![GitHub Issues](https://img.shields.io/github/issues/umutxyp/musicbot)  
![GitHub License](https://img.shields.io/github/license/umutxyp/musicbot)

---

## Links 🔗

- [Invite MusicMaker](https://discord.com/oauth2/authorize?client_id=774043716797071371&permissions=277028620608&scope=applications.commands%20bot)  
- [Support Server](https://discord.gg/SnH6fVk8hJ)  
- [Code Share](https://codeshare.me)
- [MongoDB](https://mongodb.com)  
- [Discord Developers](https://discord.dev)  
- [Download Node.js](https://nodejs.org/)  

---

## Key Features 🌟

- **24/7 Playback**: Continuous music playback, even when idle.  
- **Custom Playlists**: Create and manage personal playlists.  
- **Advanced Filters**: Apply special audio filters like bass boost, nightcore, vaporwave, and more.  
- **Multi-Language Support**: Available in 13+ languages.  
- **Platform Compatibility**: Supports YouTube, Spotify, SoundCloud, and over 730+ platforms.  
- **Customizable Commands**: Tailor the bot to suit your server’s needs.  

---

## Supported Languages 🌍

**Arabic**, **German**, **English**, **Spanish**, **French**, **Indonesian**, **Italian**, **Japanese**, **Dutch**, **Portuguese**, **Russian**, **Turkish**, **Traditional Chinese**

---

## Configuration 🔧

Update the `config.js` file with your details:

```javascript
module.exports = {
  TOKEN: "", // Discord bot token
  ownerID: [""], // Discord user ID(s) of the owner(s)
  botInvite: "", // Bot invite link
  supportServer: "", // Support server invite link
  mongodbURL: "", // MongoDB connection string
  status: "❤️ codeshare.me", // Custom status
  commandsDir: "./commands", 
  language: "en", // Default bot language
  embedColor: "ffa954", // Embed color in hex
  errorLog: "", // Error log channel ID

  sponsor: {
    status: true,
    url: "https://codeshare.me", // Sponsor URL
  },

  voteManager: {
    status: false, 
    api_key: "", 
    vote_commands: ["back", "channel", "clear", "dj", "filter", "loop", "nowplaying", "pause", "play", "playlist", "queue", "resume", "save", "search", "skip", "stop", "time", "volume"],
    vote_url: "",
  },

  shardManager: {
    shardStatus: false, 
  },

  playlistSettings: {
    maxPlaylist: 10,
    maxMusic: 75,
  },

  opt: {
    DJ: {
      commands: ["back", "clear", "filter", "loop", "pause", "resume", "skip", "stop", "volume", "shuffle"],
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
```

---

## Installation & Setup 🚀

1. Install [Node.js v20.x](https://nodejs.org) and [npm](https://www.npmjs.com/).  
2. Clone this repository or download the zip.  
3. Install dependencies:  
   ```bash
   npm install
   ```  
4. Configure your bot:  
   - Replace placeholders in `config.js` with your bot credentials.  
   - Enable all **Privileged Intents** in the Discord Developer Portal.  
5. Start the bot:  
   ```bash
   npm start
   ```

---

## Dependencies 📦

This bot uses the following NPM packages:

- `discord.js` v14.16.3  
- `distube` v4.0.4  
- `mongoose` v8.8.3  
- `@discordjs/voice` v0.18.0  
- And more (see `package.json` for the full list).  

---

## Commands 📋

- **Music**: `play`, `pause`, `resume`, `skip`, `stop`, `queue`, `loop`, `shuffle`  
- **Playlist**: `playlist create`, `playlist add`, `playlist delete`  
- **Filters**: `bassboost`, `nightcore`, `vaporwave`, `karaoke`  
- **Utility**: `help`, `ping`, `stats`, `invite`  

---

## Contributing 🤝

Feel free to contribute to the project by submitting a pull request or reporting issues. Contributions are always welcome!

---

## License 📜

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

Happy music-making! 🎶
