const Eris = require('eris')
const { commandMap } = require('./command-map.js')
const prefix = '!'
const { getParameterStore } = require('./aws-client.js')
let token = ''
let client = null

function resolveClient() {
  getParameterStore('lucretia-bott-token')
    .then((result) => {
      console.log(result)
      token = result
      client = new Eris.Client(token)
      botSetup(client)
    })
    .catch((err) => console.log(err))
}
function botSetup(client) {
  client.on('messageCreate', async (msg) => {
    const content = msg.content
    if (!content.startsWith(prefix)) {
      return
    }

    const parts = content
      .split(' ')
      .map((s) => s.trim())
      .filter((s) => s)
    const commandName = parts[0].substr(prefix.length)

    const command = commandMap[commandName]
    if (!command) {
      return
    }

    const args = parts.slice(1)

    try {
      await command.execute(msg, args)
    } catch (err) {
      console.warn('Error handling command')
      console.warn(err)
    }
  })

  client.on('error', (err) => {
    console.warn(err)
  })

  client.connect()
}

resolveClient()
