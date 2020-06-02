const AWS = require('aws-sdk')
AWS.config.update({ region: 'us-east-1' })
const ssm = new AWS.SSM()

async function getParameterStore(name) {
  try {
    let data = await ssm.getParameter({ Name: name }).promise()
    return data.Parameter.Value
  }
  catch (err) {
    console.log(err)
  }
}

module.exports = { getParameterStore }