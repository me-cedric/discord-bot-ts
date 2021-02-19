import { Discord, Command, Client, CommandMessage } from '@typeit/discord'
import { MessageEmbed } from 'discord.js'
import * as config from '../../config.json'
import { newMessage } from '../main'

@Discord(config.prefix)
export class ServerInfo {
  @Command('help')
  help(command: CommandMessage, client: Client) {
    const embed = newMessage(command)
      .setTitle('List of available commands')
      .addField('`-server-info`', `List server infos.`)
      .addField('`-user-info`', `List your own infos.`)
      .addField('`-drops-list`', `List drops.`)
    command.reply(embed)
  }

  @Command('server-info')
  serverInfo(command: CommandMessage, client: Client) {
    const embed = newMessage(command)
      .setTitle('Server Infos')
      .setURL(`https://discord.com/channels/${command.guild.applicationID}`)
      .addField(command.guild.name, `Members : ${command.guild.memberCount}`)
      .setThumbnail(command.guild.banner)
    command.reply(embed)
  }

  @Command('user-info')
  userInfo(command: CommandMessage, client: Client) {
    const embed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle('Your Infos')
      .setThumbnail(command.author.avatarURL())
      .addField('Username', command.author.username)
      .addField('ID', command.author.id)
      .setTimestamp()
      .setFooter(command.guild.name, command.author.avatarURL())
    command.reply(embed)
  }
}
