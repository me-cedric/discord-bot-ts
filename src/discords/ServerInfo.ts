import { Discord, Command, Client, CommandMessage } from '@typeit/discord'
import { MessageEmbed } from 'discord.js'
import * as config from '../../config.json'
import { newMessage } from '../main'

@Discord(config.prefix)
export class ServerInfo {
  @Command('help')
  help(command: CommandMessage, client: Client) {
    const embed = newMessage(command)
      .setTitle('Liste des commandes disponibles')
      .addField('`!server-info`' , `Lister les infos du serveur actuel.`)
      .addField('`!user-info`' , `Lister vos infos.`)
    command.reply(embed)
  }

  @Command('server-info')
  serverInfo(command: CommandMessage, client: Client) {
    const embed = newMessage(command)
      .setTitle('Infos du serveur')
      .setURL(`https://discord.com/channels/${command.guild.applicationID}`)
      .addField(command.guild.name , `Membres : ${command.guild.memberCount}`)
      .setThumbnail(command.guild.banner)
    command.reply(embed)
  }

  @Command('user-info')
  userInfo(command: CommandMessage, client: Client) {
    const embed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle('Vos Infos')
      .setThumbnail(command.author.avatarURL())
      .addField('Pseudo' , command.author.username)
      .addField('ID' , command.author.id)
      .setTimestamp()
      .setFooter(command.guild.name, command.author.avatarURL())
    command.reply(embed)
  }
}
