const AsyncRedis = require('async-redis')
const RedisClient = AsyncRedis.createClient()
const Scheduler = require('node-schedule')

RedisClient.on('connect', () => {
  console.log('connected to redis.')
})

RedisClient.on('error', (err) => {
  console.error(err)
})

function isDate(str) {
  return (new Date(str) !== 'Invalid Date') && !isNaN(new Date(str))
}

function getDate(str) {
  let date = new Date()
  if(str.includes('day')) {
    let numDays = str.split('-')[0]
    date.setHours(date.getDate() + numDays)
  }
  else if(str.includes('hour')) {
    let numHours = str.split('-')[0]
    date.setHours(date.getHours() + numHours)
  }
  else if(str.includes('min')) {
    let numMin = str.split('-')[0]
    date.setMinutes(date.getMinutes() + numMin)
  }
  else if(str.includes('tomorrow')) {
    date.setTime(date.getDate() + 1)
  }
  else if(str.includes('nextweek')) {
    date.setTime(date.getDate() + 7)
  }
  else if (!isDate(str)) {
    throw 'no valid date provided.'
  }
  return date
}

function formatTime(preFormatTime) {
  try {
    getDate(preFormatTime)
  } catch (err) {
    console.log(err)
  }
}

const commandMap = {
  petkitty: {
    execute: (msg) => {
      return msg.channel.createMessage(`You pet the kitty :3 Nice job!`)
    }
  },

  twitchlink: {
    execute: (msg) => {
      return msg.channel.createMessage('https://twitch.tv/dearverse')
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
        throw new Error(err)
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
        throw new Error(err)
      }
    }
  },

  remindme: {
    execute: async (msg, args) => {
      let author = msg.author
      let preFormatTime = args[0]
      let body = args.slice(1, args.length - 1).join(' ')
      let dateTime

      try {
        dateTime = formatTime(preFormatTime)
        Scheduler.scheduleJob(dateTime, async () => {
          let reminderResponse = `Reminder from ${author.mention}: ${body}`
          console.log(reminderResponse)
          await msg.channel.createMessage(reminderResponse)
        })
        return msg.channel.createMessage(`Scheduling reminder "${body}" for ${dateTime} now.`)
      } catch (err) {
        throw new Error(err)
      }
    }
  },

  setserver: {
    execute: async (msg, args) => {
      let serverId = args[0]
      let channelId = msg.channel.id
      RedisClient.hset(channelId, 'server', serverId)

      return msg.channel.createMessage(`Server ID set.`)
    }
  },

  getserver: {
    execute: async (msg, _args) => {
      let channelId = msg.channel.id
      try {
        let serverId = await RedisClient.hget(channelId, 'server')
        return msg.channel.createMessage(`**Server ID:**\n${serverId}`)
      } catch (err) {
        throw new Error(err)
      }
    }
  },

  point: {
    execute: async (msg, args) => {
      let mentionedUserId = args[0].replace(/<@!(.*?)>/, (match, id) => id)
      try {
        let incrementedUser = await msg.channel.guild.members.find(m => m.id === mentionedUserId)
        if (!incrementedUser) {
          return msg.channel.createMessage('That... is nothing, not a person at all.')
        }
        let currentPoints = await RedisClient.hget(mentionedUserId, 'points')
        let totalPoints = !currentPoints ? 1 : (parseInt(currentPoints) + 1)
        RedisClient.hset(mentionedUserId, 'points', totalPoints)

        return msg.channel.createMessage(
          `${msg.author.mention} has given ${incrementedUser} a point, bringing them to a total of ${totalPoints}.`
        )
      } catch (err) {
        throw new Error(err)
      }
    }
  },

  pleaseresetpointsandthankyouforallthatyoudo: {
    execute: async (msg, args) => {
      let mentionedUserId = args[0].replace(/<@!(.*?)>/, (match, id) => id)
      try {
        RedisClient.hset(mentionedUserId, 'points', 0)
        return msg.channel.createMessage(`points reset for ${msg.author.mention}.`)
      } catch (err) {
        throw new Error(err)
      }
    }
  },

  startready: {
    execute: async (msg, args) => {
      if(!args[0]) {
        return msg.channel.createMessage(`No number of players found. ` +
          `Use \`!startready [int]\` to start a ready count for [int] players.`)
      }
      let channelId = msg.channel.id
      let totalPlayers = args[0]
      RedisClient.hset(channelId, 'total_players', totalPlayers)
      RedisClient.hset(channelId, 'ready_players', 0)
      RedisClient.hset(channelId, 'game_started', true)
      return msg.channel.createMessage(`Game has begun! Use command \`!ready\` when prepared.\n\n` +
        `0 out of ${totalPlayers} players ready.`)
    }
  },

  stopready: {
    execute: async (msg, _args) => {
      let channelId = msg.channel.id
      try {
        RedisClient.hset(channelId, 'game_started', false)
        return msg.channel.createMessage(`If there was a game, it's over now, hope you're happy.`)
      } catch (err) {
        throw new Error(err)
      }
    }
  },

  numready: {
    execute: async (msg, _args) => {
      let channelId = msg.channel.id
      try {
        let gameStarted = await RedisClient.hget(channelId, 'game_started')
        if(gameStarted !== 'true') {
          return msg.channel.createMessage('No game in session. ' +
            'Use \`!startready [int]\` to start a ready count for [int] players.'
          )
        } else {
          let readyPlayers = await RedisClient.hget(channelId, 'ready_players')
          let totalPlayers = await RedisClient.hget(channelId, 'total_players')
          return msg.channel.createMessage(`${readyPlayers} out of ${totalPlayers} players ready.`)
        }
      } catch (err) {
        throw new Error(err)
      }
    }
  },

  ready: {
    execute: async (msg, _args) => {
      let channelId = msg.channel.id
      try {
        let gameStarted = await RedisClient.hget(channelId, 'game_started')
        if (gameStarted !== 'true') {
          return msg.channel.createMessage('No game in session.' +
            'Use \`!startready [int]\` to start a ready count for [int] players.'
          )
        } else {
          let currentReady = await RedisClient.hget(channelId, 'ready_players')
          let total = await RedisClient.hget(channelId, 'total_players')
          let newCurrentReady = parseInt(currentReady) + 1
          RedisClient.hset(channelId, 'ready_players', newCurrentReady)
          if(newCurrentReady >= parseInt(total)) {
            RedisClient.hset(channelId, 'game_started', false)
            return msg.channel.createMessage('@everyone is ready. Deus Vult!')
          } else {
            return msg.channel.createMessage(`${newCurrentReady} out of ${total} players ready.`)
          }
        }
      } catch (err) {
        throw new Error(err)
      }
    }
  }
}

module.exports = { commandMap }
