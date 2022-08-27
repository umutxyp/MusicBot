module.exports = async (client, queue) => {
    if (queue) {
      if (queue?.metadata) {
        queue?.metadata?.send({ content: `${client.language.msg15}` }).catch(e => { })
      }
    }
  }
  