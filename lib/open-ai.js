const OpenAI = require('openai-api')
const { getParameterStore } = require('./lib/aws-client.js')

const client = async () => {
  const OPENAI_API_KEY = await getParameterStore('lucretia-bott-token')
  const openai = new OpenAI(OPENAI_API_KEY)
  return openai
}

const prompt = async (msg, args) => {
  const prompt = args.join(' ') + '\n1. '
  const promptClient = await client()
  const gptResponse = await promptClient.complete({
    engine: 'davinci',
    prompt: prompt,
    maxTokens: 10,
    temperature: 0.75,
    topP: 1,
    presencePenalty: 0,
    frequencyPenalty: 0,
    bestOf: 1,
    n: 1,
    stream: false,
    stop: ['\n']
  });

  msg.channel.createMessage(await gptResponse)
}

module.exports = {
  client, 
  prompt
}