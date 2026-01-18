/**
 * Redis Utility Functions
 * 
 * Handles:
 * - Exam state locking during attempts
 * - Session caching
 * - Rate limiting
 * - Real-time exam sync
 */

import Redis from 'ioredis'

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  retryStrategy: (times) => {
    if (times > 3) {
      console.error('Redis connection failed after 3 retries')
      return null
    }
    return Math.min(times * 200, 1000)
  },
})

redis.on('connect', () => {
  console.log('✅ Redis connected')
})

redis.on('error', (err) => {
  console.error('❌ Redis error:', err)
})

// ===========================================
// EXAM STATE MANAGEMENT
// ===========================================

/**
 * Lock exam attempt state in Redis
 * Used to prevent data loss during exam attempts
 */
export async function lockExamAttempt(
  attemptId: string,
  data: object,
  ttlSeconds: number = 7200 // 2 hours default
): Promise<void> {
  const key = `exam:${attemptId}`
  await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds)
}

/**
 * Get exam attempt state from Redis
 */
export async function getExamState(attemptId: string): Promise<object | null> {
  const key = `exam:${attemptId}`
  const data = await redis.get(key)
  return data ? JSON.parse(data) : null
}

/**
 * Update exam attempt state
 */
export async function updateExamState(
  attemptId: string,
  updates: object
): Promise<void> {
  const key = `exam:${attemptId}`
  const current = await getExamState(attemptId)
  
  if (current) {
    const merged = { ...current, ...updates }
    await redis.set(key, JSON.stringify(merged), 'KEEPTTL')
  }
}

/**
 * Sync individual answer to Redis
 * Allows real-time answer tracking
 */
export async function syncAnswer(
  attemptId: string,
  questionId: string,
  answer: object
): Promise<void> {
  const key = `exam:${attemptId}:answers`
  await redis.hset(key, questionId, JSON.stringify(answer))
  
  // Set expiry on first write
  const ttl = await redis.ttl(key)
  if (ttl === -1) {
    await redis.expire(key, 7200) // 2 hours
  }
}

/**
 * Get all answers for an attempt
 */
export async function getAttemptAnswers(
  attemptId: string
): Promise<Record<string, object>> {
  const key = `exam:${attemptId}:answers`
  const answers = await redis.hgetall(key)
  
  const parsed: Record<string, object> = {}
  for (const [questionId, answerJson] of Object.entries(answers)) {
    parsed[questionId] = JSON.parse(answerJson)
  }
  
  return parsed
}

/**
 * Delete exam attempt state
 * Called after persisting to database
 */
export async function deleteExamState(attemptId: string): Promise<void> {
  const keys = [
    `exam:${attemptId}`,
    `exam:${attemptId}:answers`,
  ]
  await redis.del(...keys)
}

/**
 * Get exam attempt TTL
 */
export async function getExamStateTTL(attemptId: string): Promise<number> {
  const key = `exam:${attemptId}`
  return await redis.ttl(key)
}

// ===========================================
// SESSION CACHING
// ===========================================

/**
 * Cache user session
 */
export async function cacheSession(
  sessionToken: string,
  session: object,
  ttlSeconds: number = 86400 // 24 hours
): Promise<void> {
  const key = `session:${sessionToken}`
  await redis.set(key, JSON.stringify(session), 'EX', ttlSeconds)
}

/**
 * Get cached session
 */
export async function getCachedSession(
  sessionToken: string
): Promise<object | null> {
  const key = `session:${sessionToken}`
  const data = await redis.get(key)
  return data ? JSON.parse(data) : null
}

/**
 * Delete cached session
 */
export async function deleteCachedSession(sessionToken: string): Promise<void> {
  const key = `session:${sessionToken}`
  await redis.del(key)
}

// ===========================================
// RATE LIMITING
// ===========================================

/**
 * Check rate limit for a key
 * Returns true if within limit, false if exceeded
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const rateLimitKey = `ratelimit:${key}`
  
  const current = await redis.incr(rateLimitKey)
  
  // Set expiry on first request
  if (current === 1) {
    await redis.expire(rateLimitKey, windowSeconds)
  }
  
  const ttl = await redis.ttl(rateLimitKey)
  const allowed = current <= limit
  const remaining = Math.max(0, limit - current)
  
  return {
    allowed,
    remaining,
    resetIn: ttl > 0 ? ttl : windowSeconds,
  }
}

/**
 * Reset rate limit for a key
 */
export async function resetRateLimit(key: string): Promise<void> {
  const rateLimitKey = `ratelimit:${key}`
  await redis.del(rateLimitKey)
}

// ===========================================
// GENERAL CACHING
// ===========================================

/**
 * Generic cache set
 */
export async function cacheSet(
  key: string,
  value: string | object,
  ttlSeconds?: number
): Promise<void> {
  const stringValue = typeof value === 'string' ? value : JSON.stringify(value)
  
  if (ttlSeconds) {
    await redis.set(key, stringValue, 'EX', ttlSeconds)
  } else {
    await redis.set(key, stringValue)
  }
}

/**
 * Generic cache get
 */
export async function cacheGet<T = string>(
  key: string,
  parse: boolean = false
): Promise<T | null> {
  const value = await redis.get(key)
  
  if (!value) return null
  
  if (parse) {
    try {
      return JSON.parse(value) as T
    } catch {
      return value as T
    }
  }
  
  return value as T
}

/**
 * Generic cache delete
 */
export async function cacheDelete(key: string): Promise<void> {
  await redis.del(key)
}

/**
 * Check if key exists
 */
export async function cacheExists(key: string): Promise<boolean> {
  const exists = await redis.exists(key)
  return exists === 1
}

// ===========================================
// LEADERBOARD (Sorted Sets)
// ===========================================

/**
 * Update user score in leaderboard
 */
export async function updateLeaderboard(
  tenantId: string,
  userId: string,
  score: number
): Promise<void> {
  const key = `leaderboard:${tenantId}`
  await redis.zadd(key, score, userId)
}

/**
 * Get top N users from leaderboard
 */
export async function getLeaderboard(
  tenantId: string,
  limit: number = 10
): Promise<Array<{ userId: string; score: number; rank: number }>> {
  const key = `leaderboard:${tenantId}`
  
  const results = await redis.zrevrange(key, 0, limit - 1, 'WITHSCORES')
  
  const leaderboard = []
  for (let i = 0; i < results.length; i += 2) {
    leaderboard.push({
      userId: results[i],
      score: parseFloat(results[i + 1]),
      rank: i / 2 + 1,
    })
  }
  
  return leaderboard
}

/**
 * Get user rank in leaderboard
 */
export async function getUserRank(
  tenantId: string,
  userId: string
): Promise<number | null> {
  const key = `leaderboard:${tenantId}`
  const rank = await redis.zrevrank(key, userId)
  
  return rank !== null ? rank + 1 : null
}

// ===========================================
// PUBSUB (Real-time notifications)
// ===========================================

/**
 * Publish message to channel
 */
export async function publish(channel: string, message: object): Promise<void> {
  await redis.publish(channel, JSON.stringify(message))
}

/**
 * Subscribe to channel
 * Note: Requires separate Redis connection
 */
export function subscribe(
  channel: string,
  callback: (message: object) => void
): Redis {
  const subscriber = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')
  
  subscriber.subscribe(channel)
  subscriber.on('message', (ch, msg) => {
    if (ch === channel) {
      try {
        callback(JSON.parse(msg))
      } catch (err) {
        console.error('Error parsing message:', err)
      }
    }
  })
  
  return subscriber
}

// ===========================================
// HEALTH CHECK
// ===========================================

/**
 * Check Redis health
 */
export async function healthCheck(): Promise<{
  status: 'healthy' | 'unhealthy'
  latency: number
}> {
  const start = Date.now()
  
  try {
    await redis.ping()
    const latency = Date.now() - start
    
    return {
      status: 'healthy',
      latency,
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: -1,
    }
  }
}

export default redis
