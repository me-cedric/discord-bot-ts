import { Sequelize, STRING, BOOLEAN, DATEONLY } from 'sequelize'

const sequelize = new Sequelize('database', 'user', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  logging: false,
  // SQLite only
  storage: 'db/database.sqlite'
})

export interface Movie {
  id: number
  name: string
  username: string
  watched: boolean
  createdAt: string
  updatedAt: string
}

export const Movies = sequelize.define('movies', {
  name: {
    type: STRING,
    unique: true
  },
  username: STRING,
  watched: BOOLEAN
})

export const MovieLists = sequelize.define('movieLists', {
  name: {
    type: STRING,
    unique: true
  }
})

export interface TwitchGameResponse {
  data: {
    id: string
    name: string
    boxArtUrl: string
  }[]
}

export interface TwitchGame {
  id: number
  gameName: string
  gameId: string
  createdAt: string
  updatedAt: string
}

export interface Drop {
  id: number
  gameName: string
  gameId: string
  createdAt: string
  updatedAt: string
}

export interface Birthday {
  id: number
  userId: string
  userName: string
  userString: string
  date: Date
  createdAt: string
  updatedAt: string
}

export const Drops = sequelize.define('drops', {
  gameName: {
    type: STRING,
    unique: true
  },
  gameId: {
    type: STRING,
    unique: true
  }
})

export const Birthdays = sequelize.define('birthdays', {
  userId: {
    type: STRING,
    unique: true
  },
  userName: {
    type: STRING,
    unique: false
  },
  userString: {
    type: STRING,
    unique: true
  },
  date: {
    type: DATEONLY,
    unique: false
  }
})

export const synchronise = () => {
  Movies.sync()
  MovieLists.sync()
  Drops.sync()
  Birthdays.sync()
}

export async function updateOrCreate(model, where, newItem): Promise<any> {
  // First try to find the record
  const foundItem = await model.findOne({ where })
  if (!foundItem) {
    // Item not found, create a new one
    await model.create(newItem)
  } else {
    // Found an item, update it
    await model.update(newItem, { where })
  }
  const item = await model.findOne({ where })
  return { item, created: false }
}
