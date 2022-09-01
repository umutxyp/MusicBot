module.exports = async (client, queue, error) => {
if (queue) {
queue?.clear();
if (queue?.metadata) {
queue?.metadata?.send({ content: `**Connection Error:** ${error} ❌ ` }).catch(e => { })
}
}
}
