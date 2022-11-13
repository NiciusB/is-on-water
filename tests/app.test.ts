import request from 'supertest'
import app from '../src/app'

test('Homepage works', async () => {
    const response = await request(app.callback()).get('/')
    expect(response.status).toBe(200)
    expect(response.text.length).toBeGreaterThan(3000)
})

test('api/v1/get', async () => {
    const coordinatesToTest = [
        {
            lat: 0,
            lon: 0,
            result: {
                feature: 'UNKNOWN',
                isWater: true,
                lat: 0,
                lon: 0,
                reqMs: expect.any(Number),
            },
        },
        {
            lat: 9999,
            lon: 9999,
            result: {
                feature: 'UNKNOWN',
                isWater: true,
                lat: 9999,
                lon: 9999,
                reqMs: expect.any(Number),
            },
        },
        {
            lat: 46.67,
            lon: 103.3,
            result: {
                isWater: true,
                feature: 'LAKE',
                lat: 46.67,
                lon: 103.3,
                reqMs: expect.any(Number),
            },
        },
        {
            lat: -10.47,
            lon: 105.57,
            result: {
                isWater: false,
                feature: 'LAND',
                lat: -10.47,
                lon: 105.57,
                reqMs: expect.any(Number),
            },
        },
        {
            lat: 30.03,
            lon: 31.22,
            result: {
                isWater: true,
                feature: 'RIVER',
                lat: 30.03,
                lon: 31.22,
                reqMs: expect.any(Number),
            },
        },
        {
            lat: 45.295504,
            lon: 12.61337,
            result: {
                isWater: true,
                feature: 'OCEAN',
                lat: 45.295504,
                lon: 12.61337,
                reqMs: expect.any(Number),
            },
        },
        {
            lat: 44.35953,
            lon: -2.765543,
            result: {
                isWater: true,
                feature: 'UNKNOWN',
                lat: 44.35953,
                lon: -2.765543,
                reqMs: expect.any(Number),
            },
        },
        {
            lat: 6.56,
            lon: 0,
            result: {
                isWater: true,
                feature: 'LAKE',
                lat: 6.56,
                lon: 0,
                reqMs: expect.any(Number),
            },
        },
        {
            lat: 0,
            lon: -69,
            result: {
                isWater: false,
                feature: 'LAND',
                lat: 0,
                lon: -69,
                reqMs: expect.any(Number),
            },
        },
    ]

    await Promise.all(
        coordinatesToTest.map(async (coords) => {
            const response = await request(app.callback()).get(
                `/api/v1/get/${coords.lat}/${coords.lon}`
            )
            expect(response.status).toBe(200)
            expect(JSON.parse(response.text)).toEqual(coords.result)
        })
    )
})
