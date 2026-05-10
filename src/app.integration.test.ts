import request from 'supertest'
import app from './app.js'
import { describe, it, expect } from 'vitest'

describe('integration: http server', () => {
    it('serves the homepage', async () => {
        const res = await request(app.callback()).get('/')
        expect(res.status).toBe(200)
        expect(res.headers['content-type']).toContain('text/html')
        expect(res.text).toContain('Is On Water')
    })

    it('returns a well-formed response for coordinates with missing dataset tile', async () => {
        const res = await request(app.callback()).get('/api/v1/get/0/0')
        expect(res.status).toBe(200)
        expect(res.headers['content-type']).toContain('application/json')

        expect(res.body).toEqual({
            isWater: true,
            feature: 'UNKNOWN',
            lat: 0,
            lon: 0,
            reqMs: expect.any(Number),
        })
    })

    it('returns RIVER for /api/v1/get/30.03/31.22', async () => {
        const res = await request(app.callback()).get('/api/v1/get/30.03/31.22')
        expect(res.status).toBe(200)
        expect(res.headers['content-type']).toContain('application/json')
        expect(res.body).toEqual({
            isWater: true,
            feature: 'RIVER',
            lat: 30.03,
            lon: 31.22,
            reqMs: expect.any(Number),
        })
    })

    it('returns LAND for /api/v1/get/-10.47/105.57', async () => {
        const res = await request(app.callback()).get('/api/v1/get/-10.47/105.57')
        expect(res.status).toBe(200)
        expect(res.headers['content-type']).toContain('application/json')
        expect(res.body).toEqual({
            isWater: false,
            feature: 'LAND',
            lat: -10.47,
            lon: 105.57,
            reqMs: expect.any(Number),
        })
    })

    it('returns LAKE for /api/v1/get/46.67/103.3', async () => {
        const res = await request(app.callback()).get('/api/v1/get/46.67/103.3')
        expect(res.status).toBe(200)
        expect(res.headers['content-type']).toContain('application/json')
        expect(res.body).toEqual({
            isWater: true,
            feature: 'LAKE',
            lat: 46.67,
            lon: 103.3,
            reqMs: expect.any(Number),
        })
    })
})
