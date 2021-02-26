import { Discord, Command, Client, CommandMessage } from '@typeit/discord'
import { Drop, Drops, TwitchGame } from '../db'
import * as config from '../../config.json'
import { getGame, getStreams, newMessage, titleCase } from '../main'
import { scheduleJob } from 'node-schedule'

var job = null

@Discord(config.prefix)
export class DropsApp {
  @Command('drops-list')
  async dropsList(command: CommandMessage, client: Client) {
    const embed = newMessage(command)
    Drops.findAll()
      .then((drops: any[]) => {
        if (drops.length > 0) {
          embed.setTitle(
            'Here are the games you are currently watching for drops:'
          )
          embed.addField(
            'Games:',
            (drops as Drop[])
              .map((elem, i) => `${i + 1}. ${elem.gameName}`)
              .join('\n')
          )
        } else {
          embed.setTitle(`You are not watching any game for drops right now.`)
        }
        embed
          .addField(
            '`-drops-add **name of the game**`',
            `Will add the game to the watch list.`
          )
          .addField(
            '`-drops-remove **name of the game**`',
            `Will remove the game of the watch list.`
          )
      })
      .catch(() => {
        embed.setTitle(
          `An error happened while listing the games watched for drops.`
        )
      })
      .finally(() => command.reply(embed))
  }

  @Command('drops-add')
  async dropsAdd(command: CommandMessage, client: Client) {
    const embed = newMessage(command)
    const splitted: string[] = command.commandContent.split(' ')
    splitted.shift()
    if (splitted.length == 0) {
      embed
        .setTitle('How to add a game to the Drops watch-list:')
        .addField(
          'Head on to',
          `[Twitch](https://www.twitch.tv/directory/gaming) and get the exact name of a game`
        )
        .addField(
          '`-drops-add **name of the game**`',
          `Will add the game to the watch list.`
        )
        .addField(
          '`-drops-remove **name of the game**`',
          `Will remove the game of the watch list.`
        )
      command.reply(embed)
    } else {
      const name: string = splitted.join(' ')
      getGame({ name })
        .then((response) => {
          if (response.data.length == 0) throw Error('Game not found')
          return Drops.create({
            gameName: response.data[0].name,
            gameId: response.data[0].id
          })
        })
        .then((drop: any) => {
          embed.setTitle(
            `The game \`${titleCase(
              (drop as TwitchGame).gameName
            )}\` was added to the watchlist.`
          )
        })
        .catch((err) => {
          if (err.name === 'SequelizeUniqueConstraintError') {
            embed.setTitle(`The game is already watched.`)
          } else embed.setTitle(`The game \`${name}\` was not foud on Twitch.`)
        })
        .finally(() => command.reply(embed))
    }
  }

  @Command('drops-remove')
  async dropsRemove(command: CommandMessage, client: Client) {
    const embed = newMessage(command)
    const splitted: string[] = command.commandContent.split(' ')
    splitted.shift()
    if (splitted.length == 0) {
      embed
        .setTitle('How to remove a game to the Drops watch-list:')
        .addField(
          '`-drops-list`',
          `Will list the games you are watching for drops.`
        )
        .addField(
          '`-drops-remove **name of the game**`',
          `Will remove the game of the watch list.`
        )
      command.reply(embed)
    } else {
      const name: string = splitted.join(' ')
      Drops.findAll()
        .then(async (drops: any[]) => {
          if (drops.length > 0) {
            const dropToDelete = drops.find(
              (game: TwitchGame) =>
                game.gameName.toLowerCase() == name.toLowerCase()
            )
            if (dropToDelete != null) {
              await dropToDelete.destroy()
              embed.setTitle(
                `The game \`${name}\` was removed from your list of watched games.`
              )
            } else
              embed.setTitle(
                `The game \`${name}\` was not foud in your list of watched games.`
              )
          } else {
            embed.setTitle(`You are not watching any game for drops right now.`)
          }
        })
        .catch(() => {
          embed.setTitle(
            `An error happened while listing the games watched for drops.`
          )
        })
        .finally(() => command.reply(embed))
    }
  }

  @Command('drops')
  async drops(command: CommandMessage, client: Client) {
    const embed = newMessage(command)
    Drops.findAll()
      .then((drops: any[]) => {
        if (drops.length > 0) {
          return Promise.all(
            (drops as Drop[]).map((elem, i) => getStreams(elem.gameId))
          )
        } else throw Error('No drops')
      })
      .then((response) => {
        const gameStreams = response.map((r: any) => r.data)
        const flattened = [].concat(...gameStreams)
        const hasDrops: boolean =
          flattened
            .map((stream: any) => stream.title)
            .filter((a: string) => a.toLowerCase().includes('drops')).length > 1
        embed.setTitle(
          hasDrops
            ? 'There are drops today, go watch some streams.'
            : 'No drops today.'
        )
        gameStreams.forEach((gameStream: any) => {
          if (gameStream.length > 0) {
            embed.addField(
              `Here are some for **${gameStream[0].gameName}**`,
              gameStream
                .filter((stream: any) =>
                  stream.title.toLowerCase().includes('drops')
                )
                .map(
                  (stream: any) =>
                    `${stream.title}\n https://twitch.tv/${stream.userLogin} [${stream.viewerCount} viewers]`
                )
                .slice(0, 3)
                .join('\n')
            )
          }
        })
        command.reply(embed)
      })
      .catch((err) => {
        console.log(err.message)
        embed.setTitle(`Couldn't check for drops.`)
        command.reply(embed)
      })
  }

  @Command('drops-start-watch')
  async startWatch(command: CommandMessage, client: Client) {
    const embed = newMessage(command)
    if (job != null) {
      embed.setTitle('You were already watching for drops.')
    } else {
      job = scheduleJob('30 11 * * *', () => {
        this.drops(command, client)
      })
      embed.setTitle('You are now watching for drops.')
    }
    command.reply(embed)
  }

  @Command('drops-stop-watch')
  async stopWatch(command: CommandMessage, client: Client) {
    const embed = newMessage(command)
    if (job != null) {
      job.cancel()
      embed.setTitle('You are not watching for drops anymore.')
    } else {
      embed.setTitle('You are not watching for any drops already.')
    }
    command.reply(embed)
  }
}
