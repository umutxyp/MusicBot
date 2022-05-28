module.exports = async (client, oldState, newState) => {
  if(client.user.id === newState.id){
    if(oldState.channelId && !newState.channelId){
   const queue = client.player?.getQueue(newState.guild.id)
   if(queue){
     if(queue.playing){
     if(queue.metadata){
    queue.metadata.send({ content: 'Someone from the audio channel Im connected to kicked me out, the whole playlist has been cleared! ❌' }).catch(e => {})
     }
    client.player?.deleteQueue(queue.metadata.guild.id)
}
}
    }
  }
  }
