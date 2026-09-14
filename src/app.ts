import { getValueInLatitude } from './getValueInLatitude.js'
import Koa from 'koa'
import Router from '@koa/router'
import cors from '@koa/cors'
import serve from 'koa-static'
import path from 'path'
import {fileURLToPath} from 'url';
import { rateLimit } from './rateLimit.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = new Koa()
// Trust X-Forwarded-For from the reverse proxy so rate limiting and ctx.ip
// reflect the real client, not the proxy.
app.proxy = true

const router = new Router()

router.get('/api/v1/get/:lat/:lon', rateLimit, async (ctx) => {
    const startTs = Date.now()

    const lat = parseFloat(ctx.params.lat)
    const lon = parseFloat(ctx.params.lon)

    const feature = await getValueInLatitude(lat, lon)

    console.log({lat, lon, feature})

    ctx.body = {
        isWater: feature !== 'LAND',
        feature,
        lat,
        lon,
        reqMs: Date.now() - startTs,
    }
})


app.use(cors())
    .use(serve(path.join(__dirname, '..', 'static')))
    .use(router.routes())
    .use(router.allowedMethods())

export default app
