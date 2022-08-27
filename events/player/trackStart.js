module.exports = async (client, queue, track) => {
    if (queue) {
      if (!client.config.opt.loopMessage && queue?.repeatMode !== 0) return;
      if (queue?.metadata) {
        queue?.metadata?.send({ content: client.language.msg13.replace("{track?.title}", track?.title).replace("{queue?.connection.channel.name}", queue?.connection.channel.name)}).catch(e => { });
      }
    }
  }