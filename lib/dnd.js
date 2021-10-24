import moment from 'moment'
const reactions = {
  'Sunday': 'sunday:901771051158081546',
  'Monday': 'monday:901771051053223948',
  'Tuesday': 'tuesday:901771051208437810',
  'Wednesday': 'wednesday:901771051183263804',
  'Thursday': 'thursday:901771050940002377',
  'Friday': 'friday:901771051179061308',
  'Saturday': 'saturday:901771050898059325',
}

const weekpoll = async (msg, args) => {
  let dateArr = []
  let msg = ''

  const fromDate = moment().day(0).format('MM-DD-YYYY')
  const toDate = moment().day(6).format('MM-DD-YYYY')
  
  const pointer = new Date(fromDate)
  const limit = new Date(toDate)

  while(pointer < limit) { 
    dateArr.push(moment(pointer).format('dddd, MMMM DD'))
    let newDate = moment(pointer).add('1', 'd')
    pointer = new Date(newDate)
  }

  dateArr.forEach(date => {
    let formattedDate = moment(date).format(`dddd [the] Do`)
    if(moment(date).isoWeekday() < 7)
      `From 6PM to midnight, on ${formattedDate}`
    else if(moment(date).isoWeekday() === 7)
      `From noon to 6PM, on ${formattedDate}`
    }
  )
  
  let discordMsg = await msg.channel.createMessage(msg)
  discordMsg.addReaction(reactions['Sunday'])
  discordMsg.addReaction(reactions['Monday'])
  discordMsg.addReaction(reactions['Tuesday'])
  discordMsg.addReaction(reactions['Wednesday'])
  discordMsg.addReaction(reactions['Thursday'])
  discordMsg.addReaction(reactions['Friday'])
  discordMsg.addReaction(reactions['Saturday'])
}

module.exports = weekpoll