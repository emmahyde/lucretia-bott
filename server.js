const Eris = require('eris')
const { getSecret } = require('./aws-client.js')
const { commandMap } = require('./command-map.js')

const secret = await getSecret('lucretia-bott-token')
console.log('now thats what i call secret!', { secret })

class Bot {
  constructor() {
    this.prefix = '!'
    this.commandMap = commandMap
    this.token = null
  }

  async init() {
    this.token = await getSecret('lucretia-bott-token')
    this.botClient = new Eris.Client(this.token)

// command handler, handles 'no matching command' case
    this.botClient.on('messageCreate', async (msg) => {
      const content = msg.content
      if (!content.startsWith(this.prefix)) {
        return
      }

      const parts = content
        .split(' ')
        .map((s) => s.trim())
        .filter((s) => s)
      const commandName = parts[0].substr(this.prefix.length)

      const command = this.commandMap[commandName]
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

    this.botClient.on('error', (err) => {
      console.warn(err)
    })

    this.botClient.connect()
  }
}

new Bot().init()
