import { EmbedBuilder, Message } from 'discord.js'
import ollama, { ChatResponse } from 'ollama'

/**
 * Method to send replies as normal text on discord like any other user
 * @param message message sent by the user
 * @param tokens tokens to run query
 * @param msgHist message history between user and model
 */
export async function embedMessage(
    message: Message, 
    tokens: {
        channel: string,
        model: string
    },
    msgHist: {
        role: string,
        content: string
    }[]
) {
    // bot response
    let response: ChatResponse

    // initial message to client
    const botMessage = new EmbedBuilder()
    .setTitle(`Responding to ${message.author.tag}`)
    .setDescription('Generating Response . . .')
    .setColor('#00FF00')

    // send the message
    const sentMessage = await message.channel.send({ embeds: [botMessage] })

    try {
        // Attempt to query model for message
        response = await ollama.chat({
            model: tokens.model,
            messages: msgHist,
            options: {
                num_thread: 8, // remove if optimization needed further
                mirostat: 1,
                mirostat_tau: 2.0,
                top_k: 70
            },
            stream: false
        })

        const newEmbed = new EmbedBuilder()
            .setTitle(`Responding to ${message.author.tag}`)
            .setDescription(response.message.content)
            .setColor('#00FF00')

        // edit the message
        sentMessage.edit({ embeds: [newEmbed] })
    } catch(error: any) {
        const errorEmbed = new EmbedBuilder()
            .setTitle(`Responding to ${message.author.tag}`)
            .setDescription(error.error)
            .setColor('#00FF00')
        
        // send back error
        sentMessage.edit({ embeds: [errorEmbed] })
    } 

    // Hope there is a response! undefined otherwie
    return response!!
}