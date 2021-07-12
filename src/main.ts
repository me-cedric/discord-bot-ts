import { Client, Once, CommandNotFound, CommandMessage } from '@typeit/discord'
import { synchronise, TwitchGameResponse } from './db'
import * as config from '../config.json'
import { MessageEmbed, PresenceData, TextChannel } from 'discord.js'
import TwitchJs, { ApiVersions } from 'twitch-js'
import fetchUtil from 'twitch-js/lib/utils/fetch'
import { watchDrops } from './discords/Drops'
import { watchBirthdays } from './discords/Birthdays'

let TOKEN: string
let TWITCH_TOKEN: string
let TWITCH_CLIENT_ID: string
let TWITCH_CLIENT_SECRET: string
let TWITCH_REFRESH_TOKEN: string
let TWITCH_USERNAME: string
export let PREFIX: string
export let COLOR: string
try {
  TOKEN = config.token
  PREFIX = config.prefix
  COLOR = config.color
  TWITCH_TOKEN = config.twitchToken
  TWITCH_CLIENT_ID = config.twitchClientId
  TWITCH_CLIENT_SECRET = config.twitchSecret
  TWITCH_REFRESH_TOKEN = config.twitchRefresh
  TWITCH_USERNAME = config.twitchUsername
} catch (error) {
  TOKEN = process.env.token
  PREFIX = process.env.prefix
  COLOR = config.color
  TWITCH_TOKEN = process.env.twitchToken
  TWITCH_CLIENT_ID = process.env.twitchClientId
  TWITCH_CLIENT_SECRET = process.env.twitchSecret
  TWITCH_REFRESH_TOKEN = process.env.twitchRefresh
  TWITCH_USERNAME = process.env.twitchUsername
}

const onAuthenticationFailure = () =>
  fetchUtil('https://id.twitch.tv/oauth2/token', {
    method: 'post',
    search: {
      grant_type: 'refresh_token',
      refresh_token: TWITCH_REFRESH_TOKEN,
      client_id: TWITCH_CLIENT_ID,
      client_secret: TWITCH_CLIENT_SECRET
    }
  }).then((response) => response.accessToken)

const { api } = new TwitchJs({
  token: TWITCH_TOKEN,
  username: TWITCH_USERNAME,
  clientId: TWITCH_CLIENT_ID,
  onAuthenticationFailure
})

export const twitchApi = api

export const getStreams = (id: string): Promise<any> =>
  api.get('streams', {
    version: ApiVersions.Helix,
    search: { game_id: id }
  })

export const getGame = ({
  id,
  name
}: {
  id?: string
  name?: string
}): Promise<TwitchGameResponse> =>
  api.get('games', {
    version: ApiVersions.Helix,
    search: { id, name }
  })

export const titleCase = (str: string) => {
  var splitStr = str.toLowerCase().split(' ')
  for (var i = 0; i < splitStr.length; i++) {
    splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1)
  }
  return splitStr.join(' ')
}

export const newMessage = (command) => {
  return new MessageEmbed()
    .setColor(COLOR)
    .setTimestamp()
    .setFooter(command.guild.name, command.guild.banner)
}

export let channelsBot: TextChannel[] = []

export class Main {
  private static client: Client

  static get BetterClient(): Client {
    return this.client
  }

  static start() {
    this.client = new Client()
    this.client.login(TOKEN, `${__dirname}/discords/*.ts`)
  }

  static synchronizeChannels() {
    console.log('synchronizeChannels')
    channelsBot = Main.client.guilds.cache.map((guild) => {
      const channels = guild.channels.cache
        .filter((channel) => channel.type == 'text')
        .array()
      const botChannels = channels.filter(
        (channel) =>
          channel.name.includes('bot') && !channel.name.includes('music')
      )
      if (botChannels.length > 0) return botChannels[0]
      else return channels[0]
    }) as TextChannel[]
    channelsBot.forEach((channel: TextChannel) => {
      if (channel != null) {
        watchDrops(channel)
        watchBirthdays(channel)
      }
    })
  }

  @Once('ready')
  ready() {
    console.log('loaded')
    Main.synchronizeChannels()
    synchronise()
    const presence: PresenceData = {
      status: 'online',
      activity: {
        name: 'you, beware',
        type: 'WATCHING',
        url: 'https://i.kym-cdn.com/entries/icons/original/000/025/817/Screen_Shot_2018-03-30_at_11.34.27_AM.png'
      }
    }
    Main.client.user.setPresence(presence)
  }

  @CommandNotFound()
  notFoundA(command: CommandMessage) {
    command.reply('Command not found')
  }
}

Main.start()
