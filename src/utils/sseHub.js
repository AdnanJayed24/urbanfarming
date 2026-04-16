const clients = new Set();

function registerClient(res) {
  clients.add(res);
}

function unregisterClient(res) {
  clients.delete(res);
}

function broadcast(event, payload) {
  const message = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;

  for (const client of clients) {
    client.write(message);
  }
}

module.exports = {
  registerClient,
  unregisterClient,
  broadcast
};
