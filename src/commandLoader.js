const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../config');

// Load all command files
const commands = [];
const commandsPath = path.join(__dirname, '..', 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
        console.log(`✅ Loaded command: ${command.data.name}`);
    } else {
        console.log(`⚠️  Warning: ${file} is missing required "data" or "execute" property.`);
    }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(config.discord.token);

// Deploy commands
(async () => {
    try {
        console.log(`\n🚀 Started refreshing ${commands.length} application (/) commands.`);

        let data;

        if (config.discord.guildId) {
            // Deploy to specific guild (faster for testing)
            data = await rest.put(
                Routes.applicationGuildCommands(config.discord.clientId, config.discord.guildId),
                { body: commands }
            );
            console.log(`✅ Successfully reloaded ${data.length} guild application (/) commands for guild ${config.discord.guildId}.`);
        } else {
            // Deploy globally (takes up to 1 hour to propagate)
            data = await rest.put(
                Routes.applicationCommands(config.discord.clientId),
                { body: commands }
            );
            console.log(`✅ Successfully reloaded ${data.length} global application (/) commands.`);
        }

        console.log('\n📝 Deployed commands:');
        data.forEach(command => {
            console.log(`   • /${command.name} - ${command.description}`);
        });

    } catch (error) {
        if (error.code === 50001) {
            console.error('❌ Command deployment failed: Bot has no access to the target guild.');
            console.error('   → Make sure the bot is in the server and was invited with the "applications.commands" scope.');
            console.error('   → Use this invite URL format: https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands');
            console.error('   → Or remove GUILD_ID from .env to deploy commands globally instead.');
        } else {
            console.error('❌ Error deploying commands:', error);
        }
        // Don't call process.exit() here — let the bot client continue starting up
    }
})();

module.exports = { commands };