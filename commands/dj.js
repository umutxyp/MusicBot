const { ApplicationCommandOptionType } = require('discord.js');
const db = require('croxydb');
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

        let stp = interaction.options.getSubcommand()
        if (stp === "set") {
            const role = interaction.options.getRole('role')
            if (!role) return interaction.reply("If you don't specify a DJ role, you won't be able to use the command!").catch(e => { });

            await db.set(`dj-${interaction.guild.id}`, role.id)
            return await interaction.reply({ content: "The DJ role is successfully set to <@&" + role + ">.", ephemeral: true }).catch(e => { });

        }
        if (stp === "reset") {
            const data = db.get(`dj-${interaction.guild.id}`)

            if (data) {
                await db.delete(`dj-${interaction.guild.id}`)
                return await interaction.reply({ content: "The DJ role is successfully deleted.", ephemeral: true }).catch(e => { });
            } else {
                return await interaction.reply({ content: "The DJ role is not already set.", ephemeral: true }).catch(e => { });
            }

        }
    },
};
