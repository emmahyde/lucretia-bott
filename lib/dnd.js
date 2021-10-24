const Moment = require('moment')
const LengthOfWeek = 7
const JawsOfTheLionId = 891867172396208158
const Reactions = {
  'Sunday':    'sunday:901771051158081546',
  'Monday':    'monday:901771051053223948',
  'Tuesday':   'tuesday:901771051208437810',
  'Wednesday': 'wednesday:901771051183263804',
  'Thursday':  'thursday:901771050940002377',
  'Friday':    'friday:901771051179061308',
  'Saturday':  'saturday:901771050898059325'
}
const Divider = "----------------------------------------------------------------------------\n"

const offsetDays = offset => Moment().add(offset, 'days').format('dddd, MMMM [the] Do')
const weekpoll = async (msg, _args) => {
  let pollMsg = Divider
  pollMsg += "𝕊 ℂ ℍ 𝔼 𝔻 𝕌 𝕃 𝔼   ℕ 𝔼 𝕏 𝕋   𝕁 𝔸 𝕎 𝕊   𝕆 𝔽   𝕋 ℍ 𝔼   𝕃 𝕀 𝕆 ℕ   𝕊 𝔼 𝕊 𝕊 𝕀 𝕆 ℕ   𝔹 𝔼 𝕃 𝕆 𝕎\n(𝙢𝙖𝙧𝙠 𝙚𝙫𝙚𝙧𝙮 𝙙𝙖𝙮 𝙩𝙝𝙖𝙩 𝙬𝙤𝙧𝙠𝙨)\n"
  pollMsg += Divider
  for(let i=0; i<LengthOfWeek; i++) {
    if(i < 7 && i > 1) {
      pollMsg += `- From \`6PM\` to \`midnight\`, on ${offsetDays(i)} \n`
    } else {
      pollMsg += `- From \`noon\` to \`6PM\`, on ${offsetDays(i)} \n`
    }
  }

  let discordMsg = await msg.channel.createMessage(pollMsg)
  if(msg.guildID === JawsOfTheLionId) {
    await discordMsg.addReaction(Reactions['Sunday'])
    await discordMsg.addReaction(Reactions['Monday'])
    await discordMsg.addReaction(Reactions['Tuesday'])
    await discordMsg.addReaction(Reactions['Wednesday'])
    await discordMsg.addReaction(Reactions['Thursday'])
    await discordMsg.addReaction(Reactions['Friday'])
    await discordMsg.addReaction(Reactions['Saturday'])
  }
}

module.exports = { weekpoll }
