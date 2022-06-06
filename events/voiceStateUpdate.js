module.exports = async (client, oldState, newState) => {
  if(client.user.id === newState.id){
    if(oldState.channelId && !newState.channelId){
   const queue = client.player?.getQueue(newState.guild.id)
   if(queue){
    queue.metadata.send({ content: "Sorry I left the audio channel. I hope someone didn't kick me off the channel. 😔" });
    client.player?.deleteQueue(queue.metadata.guild.id)
}
    }
  }
  }
