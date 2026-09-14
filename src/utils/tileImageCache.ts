import type { GeoTIFFImage } from 'geotiff'

const MAX_CACHE_BYTES = 250 * 1024 * 1024 // 250MB

type CacheEntry = {
    image: GeoTIFFImage
    sizeBytes: number
}

// Map preserves insertion order, which we use as the LRU order:
// re-inserting a key on access bumps it to the most-recently-used end.
const cache = new Map<string, CacheEntry>()
const inFlight = new Map<string, Promise<GeoTIFFImage>>()
let currentBytes = 0

function markRecentlyUsed(key: string, entry: CacheEntry) {
    cache.delete(key)
    cache.set(key, entry)
}

function evictUntilWithinBudget() {
    for (const [key, entry] of cache) {
        if (currentBytes <= MAX_CACHE_BYTES) break
        cache.delete(key)
        currentBytes -= entry.sizeBytes
    }
}

export async function getOrLoadTileImage(
    tileKey: string,
    loader: () => Promise<{ image: GeoTIFFImage; sizeBytes: number }>
): Promise<GeoTIFFImage> {
    const cached = cache.get(tileKey)
    if (cached) {
        markRecentlyUsed(tileKey, cached)
        return cached.image
    }

    const pending = inFlight.get(tileKey)
    if (pending) {
        return pending
    }

    const promise = loader()
        .then(({ image, sizeBytes }) => {
            if (sizeBytes <= MAX_CACHE_BYTES) {
                const entry = { image, sizeBytes }
                currentBytes += sizeBytes
                markRecentlyUsed(tileKey, entry)
                evictUntilWithinBudget()
            }
            return image
        })
        .finally(() => {
            inFlight.delete(tileKey)
        })

    inFlight.set(tileKey, promise)
    return promise
}
