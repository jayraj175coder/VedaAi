import { logger } from '../utils/logger'

let redisAvailable = false

// Lazy Redis - only connect if needed and available
export const getRedisConfig = () => ({
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null,
  },
})

export const isRedisAvailable = () => redisAvailable

export const checkRedis = async (): Promise<boolean> => {
  try {
    const Redis = await import('ioredis').then(m => m.default)
    const client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      lazyConnect: true,
      connectTimeout: 3000,
      // prevent aggressive retry loops; we just want a quick availability check
      maxRetriesPerRequest: 1,
      retryStrategy: () => null,
    })

    // Handle ioredis errors to avoid 'Unhandled error event'
    client.on('error', () => {
      // ignore here; the connect attempt will be caught below
    })

    await client.connect()
    await client.ping()
    await client.quit().catch(() => client.disconnect())
    redisAvailable = true
    logger.info('Redis available')
    return true
  } catch (error) {
    redisAvailable = false
    logger.warn(`Redis not available - job queue disabled, using in-memory processing. Error: ${String((error as any)?.message || error)}`)
    return false
  }
}
