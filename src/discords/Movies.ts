import { Discord, Command, Client, CommandMessage } from '@typeit/discord'
import { Movie, Movies } from '../db'
import * as config from '../../config.json'
import { newMessage } from '../main'

@Discord(config.prefix)
export class MoviesApp {
  @Command('add-film')
  async add(command: CommandMessage, client: Client) {
    const splitted: string[] = command.commandContent.split(' ')
    splitted.shift()
    const movieName: string = splitted.join(' ')
    const embed = newMessage(command)
    try {
      const movie: any = await Movies.create({
        name: movieName,
        username: command.author.username,
        watched: false
      })

      embed.setTitle(`The movie ${(movie as Movie).name} was added.`)
      command.reply(embed)
    } catch (e) {
      if (e.name === 'SequelizeUniqueConstraintError') {
        embed.setTitle(`The movie already exists.`)
        command.reply(embed)
      } else {
        embed.setTitle(`Something happened.`)
        command.reply(embed)
      }
    }
  }

  @Command('list-film')
  async list(command: CommandMessage, client: Client) {
    const embed = newMessage(command)
    try {
      // equivalent to: INSERT INTO tags (name, description, username) values (?, ?, ?);
      const movie: any[] = await Movies.findAll()

      embed.setTitle(
        `The saved movies are ${JSON.stringify(
          (movie as Movie[]).map((elem) => elem.name).join(', ')
        )}.`
      )
      command.reply(embed)
    } catch (e) {
      embed.setTitle(`Something happened.`)
      command.reply(embed)
    }
  }
}
