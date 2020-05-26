const AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});
const ssm = new AWS.SSM();

const getSecret = async (secretName) => {
  console.log(`Getting secret for ${secretName}`);
  const params = {
    Name: secretName
  }
  const result = await ssm.getParameter(params).promise();
  return result.Parameter.Value;
}

module.exports = { getSecret }
