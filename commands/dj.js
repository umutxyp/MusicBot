const { ApplicationCommandOptionType } = require('discord.js');
const db = require("../mongoDB");
module.exports = {
  name: "dj",
  description: "Allows you to set or reset the DJ role.",
  permissions: "0x0000000000000020",
  options: [{
    name: "set",
    description: "Allows you to select a DJ role.",
    type: ApplicationCommandOptionType.Subcommand,
    options: [
      {
        name: 'role',
        description: 'Mention a DJ role.',
        type: ApplicationCommandOptionType.Role,
        required: true
      }
    ]
  },
  {
    name: "reset",
    description: "Allows you to turn off the DJ role.",
    type: ApplicationCommandOptionType.Subcommand,
    options: []
  }
  ],
  run: async (client, interaction) => {
    let lang = await db?.musicbot?.findOne({ guildID: interaction.guild.id })
    lang = lang?.language || client.language
    lang = require(`../languages/${lang}.js`);
    try {

      let stp = interaction.options.getSubcommand()
      if (stp === "set") {
        const role = interaction.options.getRole('role')
        if (!role) return interaction.reply(lang.msg26).catch(e => { });

        await db.musicbot.updateOne({ guildID: interaction.guild.id }, {
          $set: {
            role: role.id
          }
        }, { upsert: true }).catch(e => { });
        return await interaction.reply({ content: lang.msg25.replace("{role}", role.id), ephemeral: true }).catch(e => { });

      }
      if (stp === "reset") {
        const data = await db.musicbot.findOne({ guildID: interaction.guild.id }).catch(e => { });

        if (data?.role) {
          await db.musicbot.updateOne({ guildID: interaction.guild.id }, {
            $set: {
              role: ""
            }
          }, { upsert: true }).catch(e => { })
          return await interaction.reply({ content: lang.msg27, ephemeral: true }).catch(e => { });
        } else {
          return await interaction.reply({ content: lang.msg28, ephemeral: true }).catch(e => { });
        }
      }

    } catch (e) {
      const errorNotifer = require("../functions.js")
     errorNotifer(client, interaction, e, lang)
      }
  },
};