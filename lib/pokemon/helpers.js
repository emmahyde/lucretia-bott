const fetch = require('node-fetch')
const { propOr, map, objOf, mergeAll, compose, includes, all, uniq, flatten, join } = require('ramda')
const baseurl = `https://pokeapi.co/api/v2`

const fallbackimg = 'https://i0.wp.com/www.alphr.com/wp-content/uploads/2016/07/whos_that_pokemon.png'

// _parsePokemon:
// given a pokemon object,
// convert the height and weight to imperial
// map over the types array to return a simple list of strings ie ["GRASS", "POISON"]
// grab the front_default sprite image
// return the formatted object
const _parsePokemon = ({ name, height, weight, sprites, types }) => {
  const adjustedHeight = (height / 3.048).toFixed(1) // decimeter / 3.048 = length in feet
  const adjustedWeight = (weight / 4.536).toFixed(1) // hectogram / 4.536 = weight in pounds
  const adjustedTypes = map(({ type }) => type.name, types)
  const image = propOr(fallbackimg, 'front_default')(sprites)
  return ({ name, image, height: adjustedHeight, weight: adjustedWeight, types: adjustedTypes })
}

const _createPokemonMessage = (p) => {
  return `\n
      **DETAILS**:
      
      **Type(s)**: ${join(', ', p.types)}
      **Height**: ${p.height} feet
      **Weight**: ${p.weight} lbs
      ---\n
      `
}

// getPokemon:
// given a pokemon name
// fetch the pokemon from the api
// format it with _parsePokemon
// if res is not 200 OK, throw an error
const getPokemon = async (name) => {
  const res = await fetch(`${baseurl}/pokemon/${name}`)
  if (res.status === 200) {
    const data = await res.json()
    const pokemon = _parsePokemon(data)
    const pokemonMessage = _createPokemonMessage(pokemon)
    return { pokemon, pokemonMessage }
  } else {
    throw new Error('Pokemon not found')
  }
}

// _parseType:
// given a type object,
// map over the damage_relations array to create formatted advice
// return the advice and type name
const _parseType = ({ name, damage_relations }) => {
  const damages = ['double_damage_from', 'half_damage_from', 'no_damage_from', 'double_damage_to', 'half_damage_to', 'no_damage_to']

  const advice = compose(
    mergeAll,
    map(d => {
      const damageArray = map(d => d.name.toUpperCase(), damage_relations[d])
      return objOf(d)(damageArray)
    })
  )(damages)

  const formattedAdvice = map(a => {
    if (a.length === 0) {
      return '_NONE_'
    } else {
      return join(', ', a)
    }
  }, advice)

  const goodAgainst = [advice['double_damage_to'], advice['half_damage_from'], advice['no_damage_from']]
  const formattedGoodAgainst = compose(join(', '), uniq, flatten)(goodAgainst)

  const badAgainst = [advice['double_damage_from'], advice['half_damage_to'], advice['no_damage_to']]
  const formattedBadAgainst = compose(join(', '), uniq, flatten)(badAgainst)
  
  return ({
    type: name,
    advice: { ...formattedAdvice, goodAgainst: formattedGoodAgainst, badAgainst: formattedBadAgainst }
  })
}

const _createTypeMessage = ({ type, advice }) => {
  return `\n
        **${type.toUpperCase()} TYPE**
        
        **GOOD AGAINST**:
        ${advice['goodAgainst']}
        
        **BAD AGAINST**:
        ${advice['badAgainst']}
        
        **OFFENSE**:
        - Deals double damage to: ${advice['double_damage_to']}
        - Deals half damage to: ${advice['half_damage_to']}
        - Deals no damage to: ${advice['no_damage_to']}
        
        **DEFENSE**:
        - Takes double damage from: ${advice['double_damage_from']}
        - Takes half damage from: ${advice['half_damage_from']}
        - Takes no damage from: ${advice['no_damage_from']}
        ---\n
        `
}

// getType:
// given a type, fetches the type from the API
// transforms the data with _parseType
// returns the transformed data
// if response is not 200 ok, throw an error
const getType = async (type) => {
  const res = await fetch(`${baseurl}/type/${type}`)
  if (res.status === 200) {
    const data = await res.json()
    const type = _parseType(data)
    const typeMessage = _createTypeMessage(type)
    return { type, typeMessage }
  } else {
    throw new Error('Type not found')
  }
}

// getTypes:
// fetches a list of types from the api
// formats the list to return an array of types as strings, ie ['GRASS', 'NORMAL', ...]
const getTypes = async () => {
  const res = await fetch(`${baseurl}/type`)
  const types = await res.json()
  const typeArray = types.results.map(type => type.name)
  return typeArray
}

// checkTypesValidity:
// given an array of types to check, and a typeArray to check against,
// returns true of all types in the types array are present in typeArray
// returns false if at least one of type is not present in typeArray
const checkTypesValidity = ({ types, typeArray }) => all(t => includes(t, typeArray))(types)

module.exports = { getPokemon, getType, getTypes, checkTypesValidity }