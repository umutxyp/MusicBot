module.exports = async (client) => {
    console.log(`${client.user.username} Login!`);
    client.user.setActivity(client.config.playing, {
        type: "LISTENING"
      })
      setInterval(() => {
        client.user.setActivity(client.config.playing, {
            type: "LISTENING"
          })
      }, 600000)
};
