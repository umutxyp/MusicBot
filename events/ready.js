module.exports = async (client) => {
    console.log(`${client.user.username} Login!`);

    client.user.setActivity(client.config.playing);
};