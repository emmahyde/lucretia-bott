const { head, compose, map, trim, split, replace, tail } = require('ramda')
const prefix = '!'

async function messageCreate(msg) {
  const { content } = msg
  if (head(content) !== prefix) {
    throw new Error('GIVE ME THE PREFIX')
  }

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
