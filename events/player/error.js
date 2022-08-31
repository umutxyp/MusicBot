module.exports = async (client, queue, error) => {
if (queue) {
if (queue?.metadata) {
queue?.metadata?.send({ content: `${error} ❌ ` }).catch(e => { })
}
}
}
