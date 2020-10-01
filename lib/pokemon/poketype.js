const fetch = require('node-fetch')
const R = require('ramda')

const poketype = async (msg, args) => {
  const baseurl = `https://pokeapi.co/api/v2/type`

  try {
    const res = await fetch(baseurl)
    const types = await res.json()
    const typeArray = types.results.map(type => type.name)

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
    const isValidType = type => R.includes(type, typeArray)
    const allTypesValid = R.all(isValidType)(args)

    // If at least one of the arguments is NOT valid, help em out a bit
    if (R.not(allTypesValid)) {
      return msg.channel.createMessage(`One of the types you provided is not valid. Run !poketype to see a list of valid types.`)
    }

    // this is an array of promises that are ready to be called
    const getTypes = args.map(arg => fetch(`${baseurl}/${arg}`).then(r => r.json().then(({ name, damage_relations }) => ({
      name,
      damage_relations
    }))))

    // this calls the array of promises and returns a nice little array of results
    const typeData = await Promise.all(getTypes)

    // For each typeData object, do this:
    typeData.forEach(({ name, damage_relations }) => {

      // getDmgTypes - a fn that takes in a damage type, i.e. 'double_damage_to',
      // and returns a string of type names correlated to that damage type, i.e. "NORMAL, GHOST"
      // or "NONE", if there are none
      const getDmgTypes = dmg => {
        const dmgTypes = damage_relations[dmg].map(({ name }) => name.toUpperCase())
        if (dmgTypes.length<1) {
          return ['NONE']
        } else {
          return dmgTypes
        }
      }

      const goodAgainst = [getDmgTypes('double_damage_to'), getDmgTypes('half_damage_from'), getDmgTypes('no_damage_from')]
      const formattedGoodAgainst = R.compose(R.uniq, R.reject(t => t === 'NONE'), R.flatten)(goodAgainst)

      const badAgainst = [getDmgTypes('double_damage_from'), getDmgTypes('half_damage_to'), getDmgTypes('no_damage_to')]
      const formattedBadAgainst = R.compose(R.uniq, R.reject(t => t === 'NONE'), R.flatten)(badAgainst)

      msg.channel.createMessage(`
        **${name.toUpperCase()} TYPE**
        
        **OFFENSE**:
        **Deals double damage to**: ${R.join(", ", getDmgTypes('double_damage_to'))}
        **Deals half damage to**: ${R.join(", ", getDmgTypes('half_damage_to'))}
        **Deals no damage to**: ${R.join(", ", getDmgTypes('no_damage_to'))}
        
        **DEFENSE**:
        **Takes double damage from**: ${R.join(", ", getDmgTypes('double_damage_from'))}
        **Takes half damage from**: ${R.join(", ", getDmgTypes('half_damage_from'))}
        **Takes no damage from**: ${R.join(", ", getDmgTypes('no_damage_from'))}
        
        **GOOD AGAINST**:
        ${R.join(", ", formattedGoodAgainst)}
        
        **BAD AGAINST**:
        ${R.join(", ", formattedBadAgainst)}
        
        `)
    })

  } catch (err) {
    console.log({err})
    return msg.channel.createMessage(`Uhhhhh........... something went wrong.`)
  }
}


module.exports = poketype