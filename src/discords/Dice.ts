import { Discord, Command, Client, CommandMessage } from '@typeit/discord'
import { MessageEmbed } from 'discord.js'
import * as config from '../../config.json'
import { newMessage } from '../main'

@Discord(config.prefix)
export class Dice {
  @Command('d')
  roll(command: CommandMessage, client: Client) {
    const splitted: string[] = command.commandContent.split(' ')
    const diceCount: number = parseInt(splitted[1], 0)
    const diceSize: number = parseInt(splitted[2], 0)
    
    const embed = newMessage(command)

    if (isNaN(diceCount) || isNaN(diceSize)) {
      embed.setTitle('Un des nombres n\'a pas été entré.')
      embed.addField('Un nombre de dés et son nombre de face sont à entrer', 'Exemple `!3d6` ou `!1d20`')
    } else {
      Array.from(Array(diceCount).keys()).forEach(count => {
        embed.addField(`Roll ${++count} :` , this.getRandomInt(diceSize))
      })
    }

    command.reply(embed)
  }

  private getRandomInt = (max: number) => Math.floor(Math.random() * Math.floor(max))
}
