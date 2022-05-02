module.exports = async (client, _, newState) {
  const player = client.player
  if(newState.channelId !== null) return;

  const queue = player.getQueue(newState.guild.id)
  queue.metadata.send({ content: 'Someone from the audio channel Im connected to kicked me out, the whole playlist has been cleared! ❌' });
  player.deleteQueue(queue.metadata.guild.id);
}
