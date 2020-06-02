const commandMap = {}
commandMap['addpayment'] = {
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

module.exports = { commandMap }