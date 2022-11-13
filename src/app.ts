import { getValueInLatitude } from './getValueInLatitude.js'
import Koa from 'koa'
import Router from '@koa/router'
import cors from '@koa/cors'
import serve from 'koa-static'
import path from 'path'
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = new Koa()
const router = new Router()

router.get('/api/v1/get/:lat/:lon', async (ctx) => {
    const startTs = Date.now()

    const lat = parseFloat(ctx.params.lat)
    const lon = parseFloat(ctx.params.lon)

    const feature = await getValueInLatitude(lat, lon)

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
