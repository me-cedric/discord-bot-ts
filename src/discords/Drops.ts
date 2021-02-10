import { Discord, Command, Client, CommandMessage } from '@typeit/discord'
import { MessageEmbed } from 'discord.js'
import { Movie, Movies } from '../db'
import * as config from '../../config.json'
import { newMessage } from '../main'

@Discord(config.prefix)
export class DropsApp {
  @Command('drop-add')
  async dropAdd(command: CommandMessage, client: Client) {
    const embed = newMessage(command)
    const splitted: string[] = command.commandContent.split(' ')
    splitted.shift()
    if (splitted.length == 0) {
      embed
        .setTitle('How to add a game to the Drops watch-list:')
        .addField('head on ', `Lister les infos du serveur actuel.`)
        .addField('`!server-info`', `Lister les infos du serveur actuel.`)
        .addField('`!user-info`', `Lister vos infos.`)
      command.reply(embed)
    } else {
      try {
        embed.setTitle(`Le film ${''} a bien été ajouté.`)
        command.reply(embed)
      } catch (e) {
        if (e.name === 'SequelizeUniqueConstraintError') {
          embed.setTitle(`Le film existe déjà.`)
          command.reply(embed)
        } else {
          embed.setTitle(`Une erreur est survenue.`)
          command.reply(embed)
        }
      }
    }
  }

  @Command('drop-watch')
  async startWatch(command: CommandMessage, client: Client) {
    const embed = newMessage(command)
    try {
      embed.setTitle(`Le film ${''} a bien été ajouté.`)
      command.reply(embed)
    } catch (e) {
      if (e.name === 'SequelizeUniqueConstraintError') {
        embed.setTitle(`Le film existe déjà.`)
        command.reply(embed)
      } else {
        embed.setTitle(`Une erreur est survenue.`)
        command.reply(embed)
      }
    }
  }

  @Command('drop-next')
  async dropNext(command: CommandMessage, client: Client) {
    // const splitted: string[] = command.commandContent.split(' ')
    // splitted.shift()
    // const movieName: string = splitted.join(' ')
    // const embed = newMessage(command)
    // try {
    //   const movie: any = await Movies.create({
    //     name: movieName,
    //     username: command.author.username,
    //     watched: false
    //   })
    //   embed.setTitle(`Le film ${(movie as Movie).name} a bien été ajouté.`)
    //   command.reply(embed)
    // } catch (e) {
    //   if (e.name === 'SequelizeUniqueConstraintError') {
    //     embed.setTitle(`Le film existe déjà.`)
    //     command.reply(embed)
    //   } else {
    //     embed.setTitle(`Une erreur est survenue.`)
    //     command.reply(embed)
    //   }
    // }
  }
}
