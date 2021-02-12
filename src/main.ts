import { Client, On } from '@typeit/discord'
import { synchronise, TwitchGame, TwitchGameResponse } from './db'
import * as config from '../config.json'
import { MessageEmbed } from 'discord.js'
import TwitchJs, { ApiVersions } from 'twitch-js'
import fetchUtil from 'twitch-js/lib/utils/fetch'

let TOKEN: string
let TWITCH_TOKEN: string
let TWITCH_CLIENT_ID: string
let TWITCH_CLIENT_SECRET: string
let TWITCH_REFRESH_TOKEN: string
let TWITCH_USERNAME: string
let PREFIX: string
let COLOR: string
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

export const dropCheck = (): Promise<boolean> =>
  api
    .get('streams', {
      version: ApiVersions.Kraken,
      search: { game: 'Sea of Thieves', stream_type: 'live' }
    })
    .then(
      (response) =>
        response.streams
          .map((stream: any) => stream.channel.status)
          .filter((a: string) => a.toLowerCase().includes('drops')).length > 1
    )

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

// api
//   .get('games', {
//     version: ApiVersions.Helix,
//     // search: { name: 'Sea of Thieves' }
//     search: { id: '490377' }
//   })
//   .then((response) => {
//     console.log(response)
//     // Do stuff with response ...
//   })
//   .catch((err) => {
//     console.log(err.message)
//   })

// api
//   .get('users', {
//     version: ApiVersions.Helix,
//     search: { name: 'mecedric' }
//   })
//   .then((response) => {
//     console.log(response)
//     // Do stuff with response ...
//   })
//   .catch((err) => {
//     console.log(err.message)
//   })

// api
//   .get('entitlements', {
//     version: ApiVersions.Helix
//     // search: { user_id: '73743777', game_id: '490377' }
//   })
//   .then((response) => {
//     console.log(response)
//     // Do stuff with response ...
//   })
//   .catch((err) => {
//     console.log(err.message)
//   })

export const newMessage = (command) => {
  return new MessageEmbed()
    .setColor(COLOR)
    .setTimestamp()
    .setFooter(command.guild.name, command.guild.banner)
}

export class Main {
  private static client: Client

  static get BetterClient(): Client {
    return this.client
  }

  static start() {
    this.client = new Client()

    this.client.login(TOKEN, `${__dirname}/discords/*.ts`)
  }

  @On('ready')
  ready() {
    console.log('loaded')
    synchronise()
  }
}

Main.start()
