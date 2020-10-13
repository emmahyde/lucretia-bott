const { not } = require('ramda')
const {getTypes, getType, checkTypesValidity} = require("./helpers")

const poketype = async (msg, args) => {

  try {
    const typeArray = await getTypes()

    // If no args, just return a list of types
    if (args.length<1) {
      const modifiedTypes = R.join('\n', typeArray)
      return msg.channel.createMessage(modifiedTypes)
    }

    // If more than 2 args, call them a Greedy Grimble
    if (args.length>2) {
      return msg.channel.createMessage(`You can only put a max of 2 types, you Greedy Grimble!`)
    }

    // Checks to see if the provided type(s) are legit
    const allTypesValid = checkTypesValidity({typeArray, types: args})

    // If at least one of the arguments is NOT valid, help em out a bit
    if (not(allTypesValid)) {
      return msg.channel.createMessage(`One of the types you provided is not valid. Run !poketype to see a list of valid types.`)
    }

    // this calls an array of promises and returns a nice little array of results
    const typeData = await Promise.all(args.map(arg => getType(arg)))

    // For each typeData object, do this:
    typeData.forEach(async ({ typeMessage }) => await msg.channel.createMessage(typeMessage))

  } catch (err) {
    return msg.channel.createMessage(`Uhhhhh........... something went wrong.`)
  }
}


module.exports = poketype