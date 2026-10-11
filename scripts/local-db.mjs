// Local Postgres without Docker (an embedded binary), for the CMS in development.
// `pnpm db` keeps it running; `pnpm dev:cms` starts it and then `next dev`.
// Data lives in .local-db/ (git-ignored). Production uses Supabase.
import EmbeddedPostgres from 'embedded-postgres'
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'

const port = Number(process.env.LOCAL_DB_PORT ?? 5432)
const dir = '.local-db'
const pg = new EmbeddedPostgres({ databaseDir: dir, user: 'payload', password: 'payload', port, persistent: true, onLog: () => {} })

if (!existsSync(`${dir}/PG_VERSION`)) await pg.initialise()
await pg.start()
try {
  await pg.createDatabase('ascendit')
} catch {
  // already exists
}
console.log(`Postgres ready: postgres://payload:payload@localhost:${port}/ascendit`)

const stop = async () => {
  await pg.stop()
  process.exit(0)
}
process.on('SIGINT', stop)
process.on('SIGTERM', stop)

if (process.argv.includes('--with-dev')) {
  const dev = spawn('pnpm', ['next', 'dev'], { stdio: 'inherit', env: { ...process.env, DATABASE_URI: process.env.DATABASE_URI ?? `postgres://payload:payload@localhost:${port}/ascendit` } })
  dev.on('exit', stop)
} else {
  setInterval(() => {}, 1 << 30)
}
