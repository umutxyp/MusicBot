const { MessageEmbed } = require('discord.js');

module.exports = {
    description: "Allows you to set or reset the DJ role.",
    name: 'dj',
    options: [
    {
        name: "set",
        description: "Allows you to select a DJ role.",
        type: 1, 
        options: [
            {
                name: 'role',
                description: 'Mention a DJ role.',
                type: 8,
                required: true
            }
        ]
    },
    {
        name: "reset",
        description: "Allows you to turn off the DJ role.",
        type: 1,
        options: []
    }
],

run: async (client, interaction) => {

const db = client.mdb
if(!interaction.member.permissions.has("MANAGE_GUILD")) return interaction.reply({ content: "You must have **MANAGE GUILD** permission to use this command.", ephemeral: true }).catch(e => { });
let stp = interaction.options.getSubcommand()

if(stp === "set"){
const role = interaction.options.getRole('role')
if(!role) return interaction.reply("If you don't specify a DJ role, you won't be able to use the command!").catch(e => { });

const data = db.findOne({ guildID: interaction.guild.id }).catch(e => { });
if(data){
await db.updateOne({ guildID: interaction.guild.id}, {
        $set: {
            djRole: role.id    
        }}, { upsert: true }).catch(e => { });
        return await interaction.reply({ content: "The DJ role is successfully set to <@&"+role+">.", ephemeral: true }).catch(e => { });
    } else {
        await db.findOneAndUpdate({ guildID: interaction.guild.id}, {
            $set: {
                djRole: role.id
            }}, { upsert: true }).catch(e => { });
            return awaitinteraction.reply({ content: "The DJ role is successfully set to <@&"+role+">.", ephemeral: true }).catch(e => { });
        }
    } 
    if(stp === "reset"){
        const data = db.findOne({ guildID: interaction.guild.id }).catch(e => { });
if(data){
await db.deleteOne({ guildID: interaction.guild.id }).catch(e => { })
return await interaction.reply({ content: "The DJ role is successfully deleted.", ephemeral: true }).catch(e => { });
} else {
return await interaction.reply({ content: "The DJ role is not already set.", ephemeral: true }).catch(e => { });
}
    }
    },
};
