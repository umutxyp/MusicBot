module.exports = async (client, queue) => {
    if (queue) {
      if (queue?.metadata) {
        if(client?.config?.opt?.voiceConfig?.leaveOnEmpty?.status === true){
        queue?.metadata?.send({ content: `${client.language.msg15}` }).catch(e => { })
        }
      }
    }
  }
  
