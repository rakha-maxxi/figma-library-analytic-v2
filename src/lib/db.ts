import { AsyncLocalStorage } from 'node:async_hooks'
import { PrismaClient } from '@prisma/client'

export type DbMetricStore = {
  count: number
  slow: string[]
}

export const dbMetrics = new AsyncLocalStorage<DbMetricStore>()

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'stdout', level: 'error' },
      { emit: 'stdout', level: 'warn' },
    ],
  })

db.$on('query', (event) => {
  const store = dbMetrics.getStore()
  if (!store) return
  store.count += 1
  if (event.duration >= 100) {
    store.slow.push(`${event.duration}ms ${event.query.replace(/\s+/g, ' ').slice(0, 140)}`)
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
