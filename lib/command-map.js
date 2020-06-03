const commandMap = {
  // addpayment: {
  //   botOwnerOnly: true,
  //
  //   execute: (msg, args) => {
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
  petkitty: {
    execute: (msg) => {
      return msg.channel.createMessage(`You pet the kitty :3 Nice job!`)
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
