module.exports = {
    name: 'ping',
    aliases: [],
    utilisation: '{prefix}ping',

    execute(client, message) {
        message.channel.send(`**${client.ws.ping}ms** 🛰️`);
    },
};