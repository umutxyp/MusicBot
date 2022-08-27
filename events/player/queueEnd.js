module.exports = async (client, queue) => {
    if (client.config.opt.voiceConfig.leaveOnTimer.status === true) {
      if (queue) {
        setTimeout(async() => {
          if (queue?.connection) {
            if (!queue?.playing) { //additional check in case something new was added before time was up
              await queue?.connection?.disconnect()
            }
          };
        }, client.config.opt.voiceConfig.leaveOnTimer.cooldown);
      }
      if (queue?.metadata) {
        queue?.metadata?.send({ content: `${client.language.msg14}` }).catch(e => { })
      }
    }
  }