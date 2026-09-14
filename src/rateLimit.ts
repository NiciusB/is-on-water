import { Middleware } from 'koa'

// Simple in-memory fixed-window rate limiter, keyed by client IP.
// Generous limits since this is intended to be a free/dev-friendly API,
// but not unlimited, to protect against abuse.
const WINDOW_MS = 60_000
const MAX_REQUESTS_PER_WINDOW = 120

type WindowState = {
    count: number
    resetAt: number
}

const buckets = new Map<string, WindowState>()

// Periodically drop expired buckets so memory doesn't grow unbounded.
setInterval(() => {
    const now = Date.now()
    for (const [key, state] of buckets) {
        if (state.resetAt <= now) buckets.delete(key)
    }
}, WINDOW_MS).unref()

export const rateLimit: Middleware = async (ctx, next) => {
    const key = ctx.ip
    const now = Date.now()

    let state = buckets.get(key)
    if (!state || state.resetAt <= now) {
        state = { count: 0, resetAt: now + WINDOW_MS }
        buckets.set(key, state)
    }

    state.count++

    ctx.set('X-RateLimit-Limit', String(MAX_REQUESTS_PER_WINDOW))
    ctx.set('X-RateLimit-Remaining', String(Math.max(0, MAX_REQUESTS_PER_WINDOW - state.count)))
    ctx.set('X-RateLimit-Reset', String(Math.ceil(state.resetAt / 1000)))

    if (state.count > MAX_REQUESTS_PER_WINDOW) {
        ctx.set('Retry-After', String(Math.ceil((state.resetAt - now) / 1000)))
        ctx.status = 429
        ctx.body = { error: 'Too many requests, please slow down.' }
        return
    }

    await next()
}
