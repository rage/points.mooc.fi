require("dotenv-safe").config({
  allowEmptyValues: process.env.NODE_ENV === "production",
})

let url = process.env.DATABASE_URL
if (url && url?.lastIndexOf("?") !== -1) {
  url = url.substring(0, url.lastIndexOf("?"))
}

module.exports = {
  development: {
    client: "pg",
    searchPath: [process.env.SEARCH_PATH ?? "default$default"],
    connection: url, // "postgres://prisma:prisma@localhost:5678/prisma?schema=default$prisma2",
  },
  test: {
    client: "pg",
    connection: url,
    /*searchPath: [process.env.SEARCH_PATH],*/
  },
  production: {
    client: "pg",
    connection: url,
    searchPath: [process.env.SEARCH_PATH],
    /*connection: {
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT)
    },*/
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },
}
