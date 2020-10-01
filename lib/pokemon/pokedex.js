const fetch = require('node-fetch')
const R = require('ramda')
const fallbackimg = 'https://i0.wp.com/www.alphr.com/wp-content/uploads/2016/07/whos_that_pokemon.png'

const pokedex = async (msg, args) => {
  // at least one pokeman!
  if (args.length<1) {
    return msg.channel.createMessage(`Did you forget to put a Pokémon name? (Hint: yes)`)
  }

  // only one pokeman!
  if (args.length>1) {
    return msg.channel.createMessage(`One Pokéman at a time, please.`)
  }

  try {
    const pkmnName = args[0]

    // fetches the pokemon data
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pkmnName}`)

    // if things aren't 200 OK, send back this message
    if (res.status>200) {
      return msg.channel.createMessage({
        content: `We have no records for a Pokémon called "**${pkmnName.toUpperCase()}**". Must be new, call the professor!`,
        embed: { image: { url: fallbackimg } }
      })
    }

    // parse the incoming json
    const pokemon = await res.json()

    // a fn that takes in a pokemon json object and returns a string that can be sent as a message
    const transformPokemonData = p => {
      return `PokéDex entry for **${pkmnName.toUpperCase()}**:
        > **Name**: ${p.name}
        > **ID**: ${p.id}
        > **Type(s)**: ${R.join(', ', p.types.map(({ type }) => type.name))}
        > **Height (decimetres)**: ${p.height}
        > **Weight (hectograms)**: ${p.weight}
        > **Image**:
        `
    }

    // uses the above fn on the current pokemon
    const readablePokemon = transformPokemonData(pokemon)

    return msg.channel.createMessage({
      content: readablePokemon,
      embed: { image: { url: R.pathOr(fallbackimg, ['sprites', 'front_default'], pokemon) } }
    })
  } catch (err) {
    return msg.channel.createMessage({
      content: 'Unexpected PokéDex malfunction. Hopefully you got Apple Care on that.',
      embed: { image: { url: 'https://static2.cbrimages.com/wordpress/wp-content/uploads/2019/10/Brock.jpg' } }
    })
  }
}

module.exports = pokedex