const { head, compose, map, trim, split, replace, tail } = require('ramda')
let { commandMap } = require('./command-map.js')
const prefix = '!'

async function messageCreate(msg) {
  const { content } = msg
  if (head(content) !== prefix) {
    return
  }

  commandMap['sr'] = commandMap['setready']
  commandMap['r'] = commandMap['ready']
  commandMap['p'] = commandMap['point']
  commandMap['ct'] = commandMap['countdown']

  const parts = compose(map(trim), split(' '))(content)
  const commandName = replace(prefix, '', head(parts))
  const command = commandMap[commandName]

  if (!command) {
    throw new Error('IM NOT A MINDREADER, TELL ME WHAT YOU NEED')
  }

  const args = tail(parts)

  try {
    await command.execute(msg, args)
  } catch (err) {
    console.warn('Error handling command')
    console.warn(err)
  }
}

module.exports = { messageCreate }
