const {getPokemon, getType} = require('./helpers')

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

  const pkmnName = args[0]

  try {
    const { pokemon, pokemonMessage } = await getPokemon(pkmnName)

    // first message, provide  name & image
    await msg.channel.createMessage({
      content: `PokéDex entry for **${pokemon.name.toUpperCase()}**:`,
      embed: { image: { url: pokemon.image } }
    })

    // pokemon info
    await msg.channel.createMessage(pokemonMessage)

    // this calls an array of promises and returns a nice little array of results
    const typeData = await Promise.all(pokemon.types.map(t => getType(t)))

    // For each typeData object, do this:
    typeData.forEach(async ({ typeMessage }) => await msg.channel.createMessage(typeMessage))

  } catch (err) {

    if (err.message && err.message === 'Pokemon not found') {
      return msg.channel.createMessage({
        content: `We have no records for a Pokémon called "**${pkmnName.toUpperCase()}**". Must be new, call the professor!`,
        embed: { image: { url: fallbackimg } }
      })
    } else {
      return msg.channel.createMessage({
        content: 'Unexpected PokéDex malfunction. Hopefully you got Apple Care on that.',
        embed: { image: { url: 'https://static2.cbrimages.com/wordpress/wp-content/uploads/2019/10/Brock.jpg' } }
      })
    }
  }
}



module.exports = pokedex