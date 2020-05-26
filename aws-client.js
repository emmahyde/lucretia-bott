const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });
const ssm = new AWS.SSM();

const getSecret = async (secretName) => {
  console.log(`Getting secret for ${secretName}`);
  const params = {
    Name: secretName,
  };
  try {
    const result = await ssm.getParameter(params).promise();
    console.log("before resolved:", { result }); // i would expect this to initially log as "undefined" because itll log before the promise resolves

    if (result) {
      console.log("after resolved:", { result }); // i would expect this to have what you want
      return result.Parameter.Value;
    }
  } catch (e) {
    console.log("error from inside getSecret", { e });
    throw new Error(e);
  }
};

module.exports = { getSecret };
