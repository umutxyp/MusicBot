module.exports = (client, int) => {
    if (!int.isButton()) return;

    const queue = client.player.getQueue(int.guildId);

    switch (int.customId) {
        case 'saveTrack': {
          if (!queue || !queue.playing) return int.reply({ content: `No music currently playing. ❌`, ephemeral: true, components: [] });

            int.member.send(`**Track Saved: \`${queue.current.title}\` | Posted by \`${queue.current.author}\`, Saved Server: \`${int.member.guild.name}\` ✅**`).then(() => {
                return int.reply({ content: `I sent you the name of the music in a private message ✅`, ephemeral: true, components: [] });
            }).catch(error => {
                return int.reply({ content: `I can't send you a private message. ❌`, ephemeral: true, components: [] });
            });
        }
    }
};