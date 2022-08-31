module.exports = async (client, queue, error) => {
if (queue) {
queue?.destroy();
if (queue?.metadata) {
queue?.metadata?.send({ content: `${error} ❌ ` }).catch(e => { })
}
}
}
