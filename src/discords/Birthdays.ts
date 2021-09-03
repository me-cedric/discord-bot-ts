import { Discord, Command, Client, CommandMessage, Once } from '@typeit/discord'
import { Birthday, Birthdays, updateOrCreate } from '../db'
import * as config from '../../config.json'
import { COLOR, getGame, getStreams, newMessage, titleCase } from '../main'
import { scheduleJob } from 'node-schedule'
import { MessageEmbed, TextChannel } from 'discord.js'
import * as moment from 'moment'

var job = {}

const bdayStrings = [
  'happy birthday f*ckface',
  'still alive huh ?',
  'one more year of suffering',
  'at least the bot remembers your birthday',
  'what is the point of celebrating your birthday when you are moving one step closer to death?',
  'how about a sex doll as your birthday gift you sick freak!',
  'may your happiness be sucked out from your life. Happy birthday !',
  'I won’t bring a birthday cake for you, you fat f*ck',
  'numerous birthdays have passed but there is no sign of maturity in you'
]

const weekBdayStrings = [
  "If you don't get them anything I will be coming for you in your sleep.",
  'Time to be generous now or be forever ashamed.',
  'I will expose you browsing history if you do not have gifts for them.',
  "If you don't have a gift for them, send me money via https://www.paypal.com/paypalme/mecedric or I will burn your house down.",
  'Your identity will be stolen if no presents are given to them.',
  'That leaves you some time to send them something they like, or your emails will leak online.'
]

@Discord(config.prefix)
export class BirthdaysApp {
  @Command('birthdays')
  async birthdays(command: CommandMessage, client: Client) {
    const embed = newMessage(command)
    Birthdays.findAll()
      .then((drops: any[]) => {
        if (drops.length > 0) {
          embed.setTitle('Here are the users a birthday wish will be sent:')
          embed.addField(
            'Users:',
            (drops as Birthday[])
              .map(
                (elem, i) =>
                  `${i + 1}. ${elem.userName}: ${elem.date.toDateString()}`
              )
              .join('\n')
          )
        } else {
          embed.setTitle(`No users birthday has been added.`)
        }
        embed
          .addField(
            '`-birthday-add **dd/mm/YYYY**`',
            `Will save your user's birthday.`
          )
          .addField(
            '`-birthday-remove`',
            `Will remove your birthday from the list.`
          )
      })
      .catch(() => {
        embed.setTitle(`An error happened while listing the birthdays.`)
      })
      .finally(() => command.reply(embed))
  }

  @Command('birthday-add')
  async birthdayAdd(command: CommandMessage, client: Client) {
    const embed = newMessage(command)
    const splitted: string[] = command.commandContent.split(' ')
    splitted.shift()
    if (splitted.length == 0) {
      embed
        .setTitle('How to add your birthday to the list:')
        .addField(
          '`-birthday-add **dd/mm/YYYY**`',
          `Will save your user's birthday.`
        )
        .addField(
          '`-birthday-remove`',
          `Will remove your birthday from the list.`
        )
      command.reply(embed)
    } else {
      try {
        const date: string = splitted[0]
        const birthdayRes: any = await updateOrCreate(
          Birthdays,
          { userId: command.author.id },
          {
            userId: command.author.id,
            userName: command.author.username,
            userString: command.author.toString(),
            date: moment(date, 'DD/MM/YYYY').toDate()
          }
        )
        command.reply(
          `your birthday has been set on ${moment(
            (birthdayRes.item as Birthday).date,
            'YYYY-MM-DD'
          ).format('DD/MM')}.`
        )
      } catch (e) {
        console.log(e)
        if (e.name === 'SequelizeUniqueConstraintError') {
          embed.setTitle(`The birthday already exists.`)
          command.reply(embed)
        } else {
          embed.setTitle(`Something happened.`)
          command.reply(embed)
        }
      }
    }
  }

  @Command('birthday-remove')
  async birthdayRemove(command: CommandMessage, client: Client) {
    const embed = newMessage(command)
    try {
      const bday = await Birthdays.findOne({
        where: { userId: command.author.id }
      })
      if (bday != null) {
        await bday.destroy()
        embed.setTitle(`Your birthday was removed from the list.`)
      } else {
        embed.setTitle(`Your birthday was not foud in the list.`)
      }
    } catch (e) {
      embed.setTitle(
        `An error happened while removing the birthday from the list.`
      )
    }
    command.reply(embed)
  }

  @Command('birthday-check')
  async birthdayCheck(command: CommandMessage, client: Client) {
    console.log('birthdayCheck')
    const embed = newMessage(command)
    Birthdays.findAll()
      .then((birthdays: any[]) => {
        if (birthdays.length > 0) {
          const thisWeeksBday = birthdays.filter((bday: Birthday) =>
            isThisWeek(bday.date)
          )
          const todaysBday = birthdays.filter((bday: Birthday) =>
            isSameDayAndMonth(bday.date)
          )
          const nextBday: Birthday = birthdays
            .filter(
              (bday: Birthday) =>
                !isSameDayAndMonth(bday.date) && !isThisWeek(bday.date)
            )
            .sort(
              (bdayA: Birthday, bdayB: Birthday) =>
                moment(bdayA.date, 'YYYY-MM-DD').valueOf() -
                moment(bdayB.date, 'YYYY-MM-DD').valueOf()
            )[0]
          todaysBday.forEach((bday: Birthday) =>
            command.channel.send(
              `${bday.userString} ${
                bdayStrings[Math.floor(Math.random() * bdayStrings.length)]
              }`
            )
          )
          if (todaysBday.length == 0 && thisWeeksBday.length == 0) {
            command.channel.send(`No birthday this week.`)
          }
          thisWeeksBday.forEach((bday: Birthday) =>
            command.channel.send(
              `${bday.userString}'s birthday is in ${isInDays(
                bday.date
              )} days. ${
                weekBdayStrings[
                  Math.floor(Math.random() * weekBdayStrings.length)
                ]
              }`
            )
          )
          if (nextBday) {
            command.channel.send(
              `Next birthday is ${nextBday.userString} on ${moment(
                nextBday.date,
                'YYYY-MM-DD'
              ).format('DD/MM')}.`
            )
          }
        } else {
          embed.setTitle(`No users birthday has been added.`)
          command.reply(embed)
        }
      })
      .catch((err) => {
        console.log(err.message)
        embed.setTitle(`Couldn't check for birthdays.`)
        command.reply(embed)
      })
  }

  // @Command('drops-start-watch')
  // async startWatch(command: CommandMessage, client: Client) {
  //   const embed = newMessage(command)
  //   if (job[command.guild.id] != null) {
  //     embed.setTitle('You were already watching for drops.')
  //   } else {
  //     job[command.guild.id] = scheduleJob('0 12 * * *', () => {
  //       this.drops(command, client)
  //     })
  //     embed.setTitle('You are now watching for drops.')
  //   }
  //   command.reply(embed)
  // }

  // @Command('drops-stop-watch')
  // async stopWatch(command: CommandMessage, client: Client) {
  //   const embed = newMessage(command)
  //   if (job[command.guild.id] != null) {
  //     job[command.guild.id].cancel()
  //     embed.setTitle('You are not watching for drops anymore.')
  //   } else {
  //     embed.setTitle('You are not watching for any drops already.')
  //   }
  //   command.reply(embed)
  // }
}
const isSameDayAndMonth = (date: Date) =>
  moment(date, 'YYYY-MM-DD').date() == moment().date() &&
  moment(date, 'YYYY-MM-DD').month() === moment().month()

const isThisWeek = (date: Date) => isInDays(date) < 8 && isInDays(date) > 0

const isInDays = (date: Date) =>
  moment(
    `${moment().year()}-${moment(date, 'YYYY-MM-DD').month() + 1}-${moment(
      date,
      'YYYY-MM-DD'
    ).date()}`,
    'YYYY-MM-DD'
  ).diff(moment().startOf('day'), 'days')

export const watchBirthdays = (channel: TextChannel) => {
  job[channel.guild.id] = scheduleJob('0 12 * * *', () => {
    const embed = new MessageEmbed()
      .setColor(COLOR)
      .setTimestamp()
      .setFooter(channel.guild.name, channel.guild.banner)
    Birthdays.findAll()
      .then((birthdays: any[]) => {
        if (birthdays.length > 0) {
          const thisWeeksBday = birthdays.filter((bday: Birthday) =>
            isThisWeek(bday.date)
          )
          const todaysBday = birthdays.filter((bday: Birthday) =>
            isSameDayAndMonth(bday.date)
          )
          const nextBday: Birthday = birthdays
            .filter(
              (bday: Birthday) =>
                !isSameDayAndMonth(bday.date) && !isThisWeek(bday.date)
            )
            .sort(
              (bdayA: Birthday, bdayB: Birthday) =>
                moment(bdayA.date, 'YYYY-MM-DD').valueOf() -
                moment(bdayB.date, 'YYYY-MM-DD').valueOf()
            )[0]
          todaysBday.forEach((bday: Birthday) =>
            channel.send(
              `${bday.userString} ${
                bdayStrings[Math.floor(Math.random() * bdayStrings.length)]
              }`
            )
          )
          thisWeeksBday.forEach((bday: Birthday) =>
            channel.send(
              `${bday.userString}'s birthday is in ${isInDays(
                bday.date
              )} days. ${
                weekBdayStrings[
                  Math.floor(Math.random() * weekBdayStrings.length)
                ]
              }`
            )
          )
          if (todaysBday.length > 0) {
            channel.send(
              `Next birthday is ${nextBday.userString} on ${moment(
                nextBday.date,
                'YYYY-MM-DD'
              ).format('DD/MM')}.`
            )
          }
        } else {
          embed.setTitle(`No users birthday has been added.`)
          channel.send(embed)
        }
      })
      .catch((err) => {
        console.log(err.message)
        embed.setTitle(`Couldn't check for birthdays.`)
        channel.send(embed)
      })
  })
}
