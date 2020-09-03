const Eris = require('eris')

const { getParameterStore } = require('./lib/aws-client.js')
const { messageCreate } = require('./lib/message-create.js')

async function resolveClient() {
  const token = await getParameterStore('lucretia-bott-token')
  const client = new Eris.Client(token)
  client.on('messageCreate', messageCreate)
  client.on('error', console.warn)

  client.connect()
  // await client.connect()
  // return client
}

resolveClient()
// const ErisClient = resolveClient()
// module.exports = ErisClient
