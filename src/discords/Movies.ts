import { Discord, Command, Client, CommandMessage } from '@typeit/discord'
import { MessageEmbed } from 'discord.js'
import { Movies } from '../db'
import * as config from '../../config.json'
import { newMessage } from '../main'

@Discord(config.prefix)
export class MoviesApp {
    @Command('add-film')
    async roll(command: CommandMessage, client: Client) {
        const splitted: string[] = command.commandContent.split(' ')
        splitted.shift()
        const movieName: string = splitted.join(' ')
        const embed = newMessage(command)
        try {
            // equivalent to: INSERT INTO tags (name, description, username) values (?, ?, ?);
            const movie: any = await Movies.create({
                name: movieName,
                username: command.author.username,
                watched: false
            })

            embed.setTitle(`Le film ${movie.name} a bien été ajouté.`)
            command.reply(embed)
        }
        catch (e) {
            if (e.name === 'SequelizeUniqueConstraintError') {
                embed.setTitle(`Le film existe déjà.`)
                command.reply(embed)
            } else {
                embed.setTitle(`Une erreur est survenue.`)
                command.reply(embed)
            }
        }
    }

    private getRandomInt = (max: number) => Math.floor(Math.random() * Math.floor(max))
}
