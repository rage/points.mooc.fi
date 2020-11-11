const connection = {
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "postgres",
  // database: "testing",
}

const knex = require("knex")({
  client: "pg",
  connection,
})

const createDb = async () => {
  try {
    await knex.raw("CREATE DATABASE testing;")
  } catch (e) {
    console.error(`Error creating test db: ${e}`)
  }
}

createDb().then(async () => {
  knex.destroy()
  process.exit(0)
})
