const config = require("../config.js");
module.exports = async (client) => {
  let lang = client.language;
  lang = require(`../languages/${lang}.js`);

  if (config.mongodbURL || process.env.MONGO) {
    const mongoose = require("mongoose");
    mongoose
      .connect(config.mongodbURL || process.env.MONGO, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(async () => {
        console.log(`Connected MongoDB`);

        const { REST } = require("@discordjs/rest");
        const { Routes } = require("discord-api-types/v10");
        const rest = new REST({ version: "10" }).setToken(
          config.TOKEN || process.env.TOKEN
        );
        (async () => {
          try {
            await rest.put(Routes.applicationCommands(client.user.id), {
              body: await client.commands,
            });
            console.log(lang.loadslash);
          } catch (err) {
            console.log(lang.error3 + err);
          }
        })();

        console.log(client.user.username + lang.ready);

        client.user.setStatus("ONLINE");
        client.user.setActivity(config.status);
        client.errorLog = client.channels.cache.get(config.errorLog)
          ? client.channels.cache.get(config.errorLog)
          : undefined;

        setTimeout(async () => {
          const db = require("../mongoDB");
          await db.loop.deleteOne();
          await db.queue.deleteOne();
          await db.playlist_timer.deleteOne();
          await db.playlist_timer2.deleteOne();
        }, 5000);
      })
      .catch((err) => {
        console.log("\nMongoDB Error: " + err + "\n\n" + lang.error4);
      });
  } else {
    console.log(lang.error4);
  }

  try {
    function users_fetch() {
      client.guilds.cache.forEach(async (guild) => {
        await guild.members.fetch();
      });
    }
    setInterval(users_fetch, 10000000);
  } catch (err) {
    return;
  }

  if (
    client.config.voteManager.status === true &&
    client.config.voteManager.api_key
  ) {
    const { AutoPoster } = require("topgg-autoposter");
    const ap = AutoPoster(client.config.voteManager.api_key, client);
    ap.on("posted", () => {});
  }
};
