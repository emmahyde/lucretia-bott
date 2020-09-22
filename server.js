const Eris = require('eris')
require('dotenv').config()
const { getParameterStore } = require('./lib/aws-client.js')
const { messageCreate } = require('./lib/message-create.js')
const { LOCAL, DISCORD_TOKEN } = process.env

async function resolveClient() {
  const token = LOCAL ? DISCORD_TOKEN : await getParameterStore('lucretia-bott-token')
  const client = new Eris.Client(token)
  client.on('messageCreate', messageCreate)
  client.on('error', console.warn)

  client.connect()
}

resolveClient()
