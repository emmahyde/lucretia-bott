const { commandMap } = require('./command-map.js')
const { head, compose, map, trim, split, replace, tail } = require('ramda')
const prefix = '!'

async function messageCreate(msg) {
  const { content } = msg
  if (head(content) !== prefix) {
    return
  }

  const parts = compose(map(trim), split(' '))(content)
  let commandName = replace(prefix, '', head(parts))

  switch(commandName) {
    case 'sr':
      commandName = 'setready'
      break
    case 'r':
      commandName = 'ready'
      break
    case 'ct':
      commandName = 'countdown'
      break
    case 'p':
      commandName = 'point'
      break
    case 'ex':
      commandName = 'excommunicate'
      break
    case 'ff':
      commandName = 'freakyfriday'
      break
    case 'fic':
      commandName = 'needthatfic'
      break
    case 'tc':
      commandName = 'titlecard'
      break
    case 'td':
      commandName = 'titledrop'
      break
  }
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
