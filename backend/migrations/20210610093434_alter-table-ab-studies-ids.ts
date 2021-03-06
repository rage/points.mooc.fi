import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.raw(`CREATE SCHEMA IF NOT EXISTS "extensions";`)
    await knex.raw(
      `CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA "extensions";`,
    )
  } catch {
    console.warn(
      "Error creating uuid-ossp extension. Ignore if this didn't fall on next hurdle",
    )
  }

  try {
    // if uuid-ossp already exists, but in another schema
    await knex.raw(`ALTER EXTENSION "uuid-ossp" SET SCHEMA "extensions";`)
  } catch {
    // we can probably ignore this
  }

  await knex.raw(
    `ALTER TABLE "ab_study" ALTER COLUMN "id" SET DEFAULT extensions.uuid_generate_v4();`,
  )
}

export async function down(_knex: Knex): Promise<void> {}
