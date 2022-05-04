module.exports = async (client, oldState, newState) => {
  if(client.user.id === newState.id){
    if(oldState.channelId && !newState.channelId){
   const queue = client.player?.getQueue(newState.guild.id)
   if(queue){
    queue.metadata.send({ content: 'Someone from the audio channel Im connected to kicked me out, the whole playlist has been cleared! ❌' });
    client.player?.deleteQueue(queue.metadata.guild.id)
}
    }
  }
  }