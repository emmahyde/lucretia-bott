const Moment = require('moment')
const LengthOfWeek = 7
const JawsOfTheLionId = 891867172396208160
const Reactions = {
  'Sunday':    'sunday:901771051158081546',
  'Monday':    'monday:901771051053223948',
  'Tuesday':   'tuesday:901771051208437810',
  'Wednesday': 'wednesday:901771051183263804',
  'Thursday':  'thursday:901771050940002377',
  'Friday':    'friday:901771051179061308',
  'Saturday':  'saturday:901771050898059325'
}


const offsetDays = offset => Moment().add(offset, 'days').format('dddd, MMMM [the] Do')
const weekpoll = async (msg, _args) => {
  let pollMsg = '!! **SCHEDULE NEXT JAWS OF THE LION SESSION BELOW** !!\n(_mark every day that works_)\n\n'

  for(let i=1; i<=LengthOfWeek; i++) {
    let currentDatePossibility = offsetDays(i-1)
    if(i < 7 && i > 1) {
      pollMsg += `- From \`6PM\` to \`midnight\`, on ${currentDatePossibility} \n`
    } else {
      pollMsg += `- From \`noon\` to \`6PM\`, on ${currentDatePossibility} \n`
    }
  }

  let discordMsg = await msg.channel.createMessage(pollMsg)
  if(msg.channel.id === JawsOfTheLionId) {
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
