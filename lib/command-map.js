const AsyncRedis = require('async-redis')
const RedisClient = AsyncRedis.createClient()
const R = require('ramda')
const Scheduler = require('node-schedule')
const { stripIndent } = require('common-tags')
const {pokedex, poketype} = require("./pokemon")

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
  if (str.includes('day')) {
    let numDays = str.split('-')[0]
    date.setHours(date.getDate() + numDays)
  } else if (str.includes('hour')) {
    let numHours = str.split('-')[0]
    date.setHours(date.getHours() + numHours)
  } else if (str.includes('min')) {
    let numMin = str.split('-')[0]
    date.setMinutes(date.getMinutes() + numMin)
  } else if (str.includes('tomorrow')) {
    date.setTime(date.getDate() + 1)
  } else if (str.includes('nextweek')) {
    date.setTime(date.getDate() + 7)
  } else if (!isDate(str)) {
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
      let mentionedTerm = args[0].replace(/<@!(.*?)>/, (match, id) => id)
      let channelId = msg.channel.id
      let returnMessage = ''
      try {
        let incrementUser = await msg.channel.guild.members.find(m => m.id === mentionedTerm)
        if (mentionedTerm === msg.author.id) {
          return msg.channel.createMessage('Nice try.')
        }
        else if (!incrementUser) {
          mentionedTerm = args.join(' ')
          returnMessage = `${msg.author.mention} has given ${mentionedTerm} a point`
        } else {
          returnMessage = `${msg.author.mention} has given ${incrementUser.mention} a point`
        }

        let currentPoints = await RedisClient.hget(channelId, `${mentionedTerm.toLowerCase()}-points`)
        let totalPoints = !currentPoints ? 1 : (parseInt(currentPoints) + 1)
        RedisClient.hset(channelId, `${mentionedTerm.toLowerCase()}-points`, totalPoints)

        return msg.channel.createMessage(
          `${returnMessage}. Total points: ${totalPoints}.`
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
        let clearedUser = msg.channel.guild.members.find(m => m.id === mentionedUserId)
        return msg.channel.createMessage(`points reset for ${clearedUser.mention}.`)
      } catch (err) {
        throw new Error(err)
      }
    }
  },

  setready: {
    execute: async (msg, args) => {
      if (!args[0]) {
        return msg.channel.createMessage(stripIndent`
          No number of players found.
          Use \`!sr [num]\` to start a ready count for [num] players.
          Use \`!sr [num] [subj]\` to start a ready count for [num] players for a particular pausable subject.
          _Syntax: [num] out of [num] ready to unpause [subj]._
        `)
      } else {
        let channelId = msg.channel.id
        let totalPlayers = args[0]
        RedisClient.hset(channelId, 'total_players', totalPlayers)
        RedisClient.hset(channelId, 'ready_players', 0)
        RedisClient.hset(channelId, 'game_started', true)
        if (args[1]) {
          let eventSubject = Array.prototype.slice.call(args, 1).join(' ')
          RedisClient.hset(channelId, 'event_subject', eventSubject)
          return msg.channel.createMessage(
            `0 out of ${totalPlayers} Ready.\n\n**Send message \`!ready\` when you are ready to unpause ${eventSubject}.**`
          )
        } else {
          return msg.channel.createMessage(
            `0 out of ${totalPlayers} Ready.\n\n**Send message \`!ready\` when you are ready to unpause.**`
          )
        }

      }
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
        if (gameStarted !== 'true') {
          return msg.channel.createMessage(stripIndent`
            No game in session.
            Use \`!startready [int]\` to start a ready count for [int] players.
          `)
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
          return msg.channel.createMessage(stripIndent`
            No game in session.
            Use \`!sr [num]\` to start a ready count for [num] players.
            Use \`!sr [num] [subj]\` to start a ready count for a particular pausable subject.
            _Syntax: [num] out of [num] ready to unpause [subj]._
          `)
        } else {
          let currentReady = await RedisClient.hget(channelId, 'ready_players')
          let total = await RedisClient.hget(channelId, 'total_players')
          let newCurrentReady = parseInt(currentReady) + 1
          let eventSubject = await RedisClient.hget(channelId, 'event_subject')
          let final = false
          RedisClient.hset(channelId, 'ready_players', newCurrentReady)

          if (newCurrentReady >= parseInt(total)) {
            final = true
            RedisClient.hdel(channelId, 'game_started')
            RedisClient.hdel(channelId, 'event_subject')
            RedisClient.hdel(channelId, 'ready_players')
            RedisClient.hdel(channelId, 'total_players')
          }

          if (eventSubject) {
            if (final) {
              let title = R.split(' ', eventSubject)[0]
              return msg.channel.createMessage(`@everyone is ready. ${title}time!`)
            } else {
              return msg.channel.createMessage(`${newCurrentReady} out of ${total} players ready to unpause ${eventSubject}.`)
            }
          } else {
            if (final) {
              return msg.channel.createMessage(stripIndent`
                Most Beloved Bretheren:

                My hand forced by necessity, I, Pope Urban II, by the Blessing of God, urge my Christian citizens to look upon the great disorder in the world.
                In the East, vile races, which worship demons, have taken land from our friends; from Romania to the shores of the Mediterannean.
                We must not allow them to continue spreading their impurity lest we live in fear of being despoiled by force or fraud any time we pass the thresholds of our homes.
                All who die by this Holy Crusade, whether by land or by sea, shall have immediate remission of sins and be cleansed for Heaven.
                I say this to those who are present, and for those who are absent.
                This I grant them through the power of God with which I am invested. Moreover, Christ commands it.

                We are on the precipice of Greatness, we must ride at once, from the dusk of darkness to dawn of light.
                To our Brothers in the East: We will make this Holy Pilgrimage and ride alongisde you. God wills that we do not allow this Heathen race to poison our lands, we are ready for War.
                All things must End, but as our Holy War reigns in the eyes of God, we will be blessed with his light to conquer and cleanse the grounds they robbed of us.

                Let those who have been fighting against their brothers and relatives now fight against the barbarians, and they can be strong, will be strong.
                Let those who have been wearing themselves out in both body and soul now work for a double honor, and they can be brave, will be brave.
                We will find every pilgrim, and lost soul, and the Good Christians inside them, and hold them close to the Cradle of Catholicism.
                Let those who for a long time, have been robbers, now become knights, and they will be **strong**.

                Pope Urban II

                _**A M E N   A N D   D E U S   V U L T**_
              `)
            } else {
              return msg.channel.createMessage(`${newCurrentReady} out of ${total} players ready to unpause.`)
            }
          }
        }
      } catch (err) {
        throw new Error(err)
      }
    }
  },

  pause: {
    execute: async (msg, args) => {
       msg.channel.createMessage('https://media1.giphy.com/media/zsp6JrZQf3rPy/giphy.gif')
    }
  },

  countdown: {
    execute: async (msg, args) => {
      try {
        let countdown_number = args[0] || 3
        if (countdown_number > 60) {
          return msg.channel.createMessage(`Try not to be an absolute penis. Pick a number of seconds fewer than 60.`)
        }
        msg.channel.createMessage(`Prepare for COUNTDOWN from ${countdown_number}. Start your engines on GO.`)

        for(let i = args[0]; i >= 0; i--) {
          setTimeout(() => {
            if(i === 0) {
              setTimeout(() => {
                return msg.channel.createMessage(`**GO!!!!!!!!!!!!**`)
              }, args[0] * 1000)
            } else {
              setTimeout(() => {
                return msg.channel.createMessage(`**${i}.............**`)
                }, ((args[0] * 1000) - (i * 1000))
              )
            }}, 1000)
        }
      } catch (err) {
        throw new Error(err)
      }
    }
  },

  emmyfor: {
    execute: async (msg, args) => {
      msg.channel.createMessage(`
      As of ${new Date().toDateString()}, ${args.join(' ')} won a massive Emmy. Please applaud.
      `)
    }
  },

  oscarfor: {
    execute: async (msg, args) => {
      msg.channel.createMessage(`
      As of ${new Date().toDateString()}, ${args.join(' ')} won a huge Oscar. Please applaud.
      `)
    }
  },

  grammyfor: {
    execute: async (msg, args) => {
      msg.channel.createMessage(`
      As of ${new Date().toDateString()}, ${args.join(' ')} won a big Grammy. Please applaud.
      `)
    }
  },

  tonyfor: {
    execute: async (msg, args) => {
      msg.channel.createMessage(`
      As of ${new Date().toDateString()}, ${args.join(
        ' '
      )} won a regular-sized Tony. Please applaud.
      `)
    }
  },

  titlecard: {
    execute: (msg) => {
      return msg.channel.createMessage('*DA NA NA NA NA*')
      .then(setTimeout(() => {
        return msg.channel.createMessage(`***𝘄𝗔𝗵𝗵 𝗮𝗵𝗵𝗵***`)
      }, 1200))
    }
  },

  needthatfic: {
    execute: (msg, args) => {
      const people = args.join('+')

      if (args.length > 7) {
      return msg.channel.createMessage(`Calm down, Caligula.`)
    } else if (args.includes('patty')) {
      return msg.channel.createMessage(`cmon now` )
    } else if (args.length === 1) {
      return msg.channel.createMessage(`Here's some for all the ` + `${people}` + `-heads in the house!` + `\n` + `https://archiveofourown.org/works/search?utf8=%E2%9C%93&commit=&work_search%5Bcharacter_names%5D=`+`${people}` )
    } else if (!people) {
      return msg.channel.createMessage('I sure bet you do!')
    } else {
      return msg.channel.createMessage(`Here's the filth you requested!` + `\n` + `https://archiveofourown.org/works/search?utf8=%E2%9C%93&commit=&work_search%5Bcharacter_names%5D=`+`${people}`)
    } }
  },

  pokedex: {
    execute: (msg, args) => pokedex(msg, args)
  },

  poketype: {
    execute: (msg, args) => poketype(msg, args)
  },

  help: {
    execute: async (msg, args) => {
      return msg.channel.createMessage(stripIndent`
        \`!petkitty\` : You will pet the **kitty**.
        \`!twitchlink\` : You will get a really famous stream on Twitch! Please like and subscribe! Xoxo gossip girl
        \`!grab @user\` : I will save the last message **user** sent.
        \`!lastgrab @user\` : I will retrieve the last message that was saved for **user**.
        \`!remindme [time] [title]\` : will schedule a reminder of **title** for **time** o'clock.
        \`!point [any], !p [any]\` : Will give a user a +1, which are saved and totaled.
        \`!help\`: You're there right now. Idiot.
        \`!emmyfor\`: Give a massive emmy to someone.
        \`!oscarfor\`: Give a huge oscar to someone.
        \`!grammyfor\`: Give a big grammy to someone.
        \`!tonyfor\`: Give a regular-sized tony to someone.
        \`!titlecard\`: ONLY autorized for use during Lucifer.
        \`!needthatfic\`: Participate in the tradition of erotic literature on anyone you please.
        
        **Pokemon Features:**      
        \`!pokedex [name]\`: Get some info about a pokemon!
        \`!poketype [types]\`: Provide up to 2 pokemon types, get back the strengths and weaknesses for that type or types. If no types provided, it returns a list of types.
        
        **Happy King Town Features:**
        \`!setserver [id]\` : will set serverID to **id**.
        \`!getserver\` : will get serverID if set.
        \`!setready [num], !sr [num]\` : Begin a ready count with **num** of people.
        \`!stopready\` : End the ready count, regardless of current state.
        \`!numready\`: Check # of people currently ready in the ready count.
        \`!ready, !r\`: Mark yourself as ready.
        \`!countdown [num], !ct [num]\`: Countdown from **num**.

    `)}
  }
}

module.exports = { commandMap }
