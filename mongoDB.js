const { Schema, model } = require("mongoose");

const musicbot = Schema({
  guildID: String,
  role: String,
  language: String,
  channels: Array,
});

const loop = Schema({
  userID: String,
  guildID: String,
  channelID: String,
  messageID: String,
});

const queue = Schema({
  userID: String,
  guildID: String,
  channelID: String,
  messageID: String,
});

const playlist = Schema({
  userID: String,
  playlist: Array,
  musics: Array,
});

const playlist_timer = Schema({
  userID: String,
  guildID: String,
  channelID: String,
  messageID: String,
});

const playlist_timer2 = Schema({
  userID: String,
  guildID: String,
  channelID: String,
  messageID: String,
});

module.exports = {
  musicbot: model("musicbot", musicbot),
  loop: model("loop", loop),
  queue: model("queue", queue),
  playlist: model("playlist", playlist),
  playlist_timer: model("playlist_timer", playlist_timer),
  playlist_timer2: model("playlist_timer2", playlist_timer2),
};
