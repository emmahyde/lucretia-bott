const Redis = require('redis')
const RedisClient = Redis.createClient()

RedisClient.on('connect', () => {
  console.log('connected to redis.')
})

const commandMap = {

  petkitty: {
    execute: (msg) => {
      return msg.channel.createMessage(`You pet the kitty :3 Nice job!`)
    }
  },
  twitchlink: {
    execute: (msg) => {
      return msg.channel.createMessage("https://twitch.tv/dearverse")
    }
  },
  grab: {
    execute: async (msg, args) => {
      let mentionedUserId = args[0].replace(/<@!(.*?)>/, (match, id) => id)
      try {
        let message = await msg.channel.getMessages(1)
        if(message[0].member.id === mentionedUserId) {
          RedisClient.set([mentionedUserId, 'grab', message[0].content])
          return msg.channel.createMessage(`Grabbed ${message[0].author.username} saying: "${message[0].content}".`)
        } else {
          return msg.channel.createMessage('Not fast enough...')
        }
      } catch (err) {
        return msg.channel.createMessage(err)
      }

    }
  }
}

module.exports = { commandMap }

// addpayment: {
//   botOwnerOnly: true,
//
//     execute: (msg, args) => {
//     const mention = args[0]
//     const amount = parseFloat(args[1])
//     const guild = msg.channel.guild
//     const userId = mention.replace(/<@(.*?)>/, (match, group1) => group1)
//     const member = guild.members.find((member) => {
//       return member.username === userId
//     })
//
//     const userIsInGuild = !!member
//     if (!userIsInGuild) {
//       return msg.channel.createMessage('User not found in this channel.')
//     }
//
//     const amountIsValid = amount && !Number.isNaN(amount)
//     if (!amountIsValid) {
//       return msg.channel.createMessage('Invalid donation amount')
//     }
//
//     return Promise.all([
//       msg.channel.createMessage(`${mention} paid $${amount.toFixed(2)}`)
//     ])
//   }
// },
