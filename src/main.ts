import { Client, On } from '@typeit/discord'
import { synchronise } from './db'
import * as config from '../config.json'
import { MessageEmbed } from 'discord.js'

let TOKEN: string
let PREFIX: string
let COLOR: string
try {
  TOKEN = config.token
  PREFIX = config.prefix
  COLOR = config.color
} catch (error) {
  TOKEN = process.env.token
  PREFIX = process.env.prefix
  COLOR = config.color
}

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
