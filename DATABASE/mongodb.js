const { Schema, model } = require("mongoose");

const db = Schema({
  djRole: String,
  guildID: String
});

module.exports = model("astramusic", db);
