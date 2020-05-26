const Eris = require('eris')
const { getSecret } = require('./aws-client.js')

const secret = await getSecret('lucretia-bott-token')
console.log('now thats what i call secret!', { secret })

class Bot {
  constructor() {
    this.prefix = '!'
    this.commandMap = {}
    this.token = null
  }

  async init() {
    this.token = await getSecret('lucretia-bott-token')
    this.botClient = new Eris.Client(this.token)

    this.commandMap['addpayment'] = {
      botOwnerOnly: true,
      execute: (msg, args) => {
        const mention = args[0]
        const amount = parseFloat(args[1])
        const guild = msg.channel.guild
        const userId = mention.replace(/<@(.*?)>/, (match, group1) => group1)
        const member = guild.members.find((member) => {
          return member.username === userId
        })

        const userIsInGuild = !!member
        if (!userIsInGuild) {
          return msg.channel.createMessage('User not found in this channel.')
        }

        const amountIsValid = amount && !Number.isNaN(amount)
        if (!amountIsValid) {
          return msg.channel.createMessage('Invalid donation amount')
        }

        return Promise.all([
          msg.channel.createMessage(`${mention} paid $${amount.toFixed(2)}`)
        ])
      }
    }

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
      const commandName = parts[0].substr(PREFIX.length)

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
