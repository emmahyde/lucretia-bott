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
        console.log(err)
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
      let serverId = await RedisClient.hset(channelId, 'server')
      return msg.channel.createMessage(`**Server ID:** ${serverId}`)
    }
  },

  point: {
    execute: async (msg, args) => {
      let mentionedUserId = args[0].replace(/<@!(.*?)>/, (match, id) => id)
      let currentPoints = await RedisClient.hget(mentionedUserId, 'points')
      let totalPoints
      if(!currentPoints) {
        totalPoints = 1
        RedisClient.hset(mentionedUserId, 'points', totalPoints)

      } else {
        totalPoints = currentPoints + 1
        RedisClient.hset(mentionedUserId, 'points', currentPoints + 1)
      }

      let pointUpUserMention = msg.guild.members.find(m => m.id === mentionedUserId)
      return msg.channel.createMessage(
        `${msg.author.mention} has given ${pointUpUserMention} a point, bringing them to a total of ${totalPoints}.`
      )
    }
  }
}

module.exports = { commandMap }
