import { Sequelize, STRING, BOOLEAN } from 'sequelize'

const sequelize = new Sequelize('database', 'user', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  logging: false,
  // SQLite only
  storage: 'database.sqlite'
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

export const synchronise = () => {
  Movies.sync()
  MovieLists.sync()
}
