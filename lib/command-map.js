const AsyncRedis = require("async-redis");
const RedisClient = AsyncRedis.createClient()

RedisClient.on('connect', () => {
  console.log('connected to redis.')
})

RedisClient.on("error", (err) => {
  console.error(err);
});

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
        let messages = await msg.channel.getMessages(100)
        let latestMessage = messages.find(message => message.member.id === mentionedUserId)
        RedisClient.hset(mentionedUserId, 'grab', latestMessage.content)
        console.log(`saved ${latestMessage.content} to grab for user-id ${mentionedUserId}`)
        return msg.channel.createMessage(`Grabbed ${latestMessage.author.username} while they were screaming: "${latestMessage.content}".`)
      } catch (err) {
        console.log(err)
      }
    }
  },
  lastgrab: {
    execute: async (msg, args) => {
      let mentionedUserId = args[0].replace(/<@!(.*?)>/, (match, id) => id)
      try {
        let lastGrab = await RedisClient.hget(mentionedUserId, 'grab')
        return msg.channel.createMessage(`> ${lastGrab}\n- ${args[0]}`)
      } catch (err) {
        console.log(err)
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
