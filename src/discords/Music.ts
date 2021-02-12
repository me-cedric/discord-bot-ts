// import { Discord, Command, CommandMessage, Client } from '@typeit/discord'
// import { Guild } from 'discord.js'
// import * as ytdl from 'ytdl-core'
// import * as config from '../../config.json'
// import { newMessage } from '../main'

// const queue = new Map()

// @Discord(config.prefix)
// export class Music {
//   @Command('play')
//   async play(command: CommandMessage, client: Client) {
//     const splitted: string[] = command.commandContent.split(' ')
//     const voiceChannel = command.member.voice.channel
//     const embed = newMessage(command)
//     if (!voiceChannel) {
//       embed.setTitle('Tu dois être dans un canal vocal pour lancer la musique.')
//       return command.reply(embed)
//     }
//     const permissions = voiceChannel.permissionsFor(command.client.user)
//     if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
//       embed.setTitle(
//         "J'ai besoin de la permission de rejoindre et parler dans ton canal."
//       )
//       return command.reply(embed)
//     }
//     const songInfo = await ytdl.getInfo(splitted[1])
//     const song: { id: string; title: string; url: string } = {
//       id: songInfo.videoDetails.videoId,
//       title: songInfo.videoDetails.title,
//       url: songInfo.videoDetails.video_url
//     }
//     const serverQueue = queue.get(command.guild.id)

//     if (!serverQueue) {
//       const queueContruct = {
//         textChannel: command.channel,
//         voiceChannel,
//         connection: null,
//         songs: [],
//         volume: 5,
//         playing: true
//       }

//       queue.set(command.guild.id, queueContruct)

//       queueContruct.songs.push(song)

//       try {
//         const connection = await voiceChannel.join()
//         queueContruct.connection = connection
//         this.playSong(command.guild, queueContruct.songs[0])
//       } catch (err) {
//         console.log(err)
//         queue.delete(command.guild.id)
//         embed.setTitle(err)
//         return command.reply(embed)
//       }
//     } else {
//       serverQueue.songs.push(song)
//       embed.addField(song.title, 'A été ajouté à la queue!')
//       return command.reply(embed)
//     }
//   }

//   @Command('next')
//   next(command: CommandMessage, client: Client) {
//     const serverQueue = queue.get(command.guild.id)
//     const embed = newMessage(command)
//     if (!command.member.voice.channel) {
//       embed.setTitle(
//         `Tu dois être dans un canal vocal pour passer la musique !`
//       )
//       return command.reply(embed)
//     }
//     if (!serverQueue) {
//       embed.setTitle(`Il n'y a aucune musique que je peux passer !`)
//       return command.reply(embed)
//     }
//     serverQueue.connection.dispatcher.end()
//   }

//   @Command('stop')
//   stop(command: CommandMessage, client: Client) {
//     const serverQueue = queue.get(command.guild.id)
//     if (!command.member.voice.channel) {
//       const embed = newMessage(command).setTitle(
//         `Tu dois être dans un canal vocal pour arrêter la musique !`
//       )
//       return command.reply(embed)
//     }
//     serverQueue.songs = []
//     serverQueue.connection.dispatcher.end()
//   }

//   @Command('nowplaying')
//   nowplaying(command: CommandMessage, client: Client) {
//     const serverQueue = queue.get(command.guild.id)
//     const embed = newMessage(command)
//     if (!serverQueue) {
//       embed.setTitle("Il n'y a rien dans la file.")
//     } else {
//       embed.setTitle(`Now playing: ${serverQueue.songs[0].title}`)
//     }
//     command.reply(embed)
//   }

//   playSong(guild: Guild, song: { id: string; title: string; url: string }) {
//     const serverQueue = queue.get(guild.id)
//     if (!song) {
//       serverQueue.voiceChannel.leave()
//       queue.delete(guild.id)
//       return
//     }

//     const dispatcher = serverQueue.connection
//       .play(ytdl(song.url))
//       .on('finish', () => {
//         serverQueue.songs.shift()
//         this.playSong(guild, serverQueue.songs[0])
//       })
//       .on('error', (error) => console.error(error))
//     dispatcher.setVolumeLogarithmic(serverQueue.volume / 5)
//     serverQueue.textChannel.send(`Commence à lire: **${song.title}**`)
//   }
// }
