const cron = require('node-cron')

async function addReminder(msg) {
  let author = msg.author
  let body = msg.content
  cron.schedule(time, () => {
    console.log(`Running ${name} at ${time} at America/NYC timezone`);
    msg.channel.createMessage(`Reminder from ${author.mention}: ${body}`)
  }, {
    scheduled: true,
    timezone: "America/New York City"
  });
}

module.exports = [addReminder]
