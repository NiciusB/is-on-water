import fs from 'fs'
import unzipper from 'unzipper'
import { fromArrayBuffer } from 'geotiff'
import stream2buffer from './utils/stream2buffer.js'
import toArrayBuffer from './utils/toArrayBuffer.js'
import checkFileExists from './utils/checkFileExists.js'
import path from 'path'
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type WATER_VALUE_TYPES = 'LAND' | 'OCEAN' | 'RIVER' | 'LAKE' | 'UNKNOWN'

export async function getValueInLatitude(
    lat: number,
    lon: number
): Promise<WATER_VALUE_TYPES> {
    const latStr =
        (lat >= 0 ? 'N' : 'S') +
        Math.abs(Math.floor(lat)).toString().padStart(2, '0')
    const lonStr =
        (lon >= 0 ? 'E' : 'W') +
        Math.abs(Math.floor(lon)).toString().padStart(3, '0')

    const zipFilename = path.join(
        __dirname,
        '..',
        'dataset',
        `ASTWBDV001_${latStr}${lonStr}.zip`
    )

    const doesFileExist = await checkFileExists(zipFilename)

    if (!doesFileExist) {
        return 'UNKNOWN'
    }

    const readable = fs
        .createReadStream(zipFilename)
        .pipe(
            unzipper.ParseOne(
                new RegExp(`ASTWBDV001_${latStr}${lonStr}_att\\.tif`)
            )
        )

    const tiff = await fromArrayBuffer(
        toArrayBuffer(await stream2buffer(readable))
    )

    const image = await tiff.getImage()

    const bbox = image.getBoundingBox()
    const pixelWidth = image.getWidth()
    const pixelHeight = image.getHeight()
    const bboxWidth = bbox[2] - bbox[0]
    const bboxHeight = bbox[3] - bbox[1]

    const widthPct = (lon - bbox[0]) / bboxWidth
    const heightPct = (lat - bbox[1]) / bboxHeight
    const xPx = Math.floor(pixelWidth * widthPct)
    const yPx = Math.floor(pixelHeight * (1 - heightPct))

    const window = [xPx, yPx, xPx + 1, yPx + 1]

    const rasters = await image.readRasters({ window })
    const dataArray = rasters[0] as Int16Array // Our dataset returns Int16Array

    switch (dataArray[0]) {
        case 0:
            return 'LAND'
        case 1:
            return 'OCEAN'
        case 2:
            return 'RIVER'
        case 3:
            return 'LAKE'
        default:
            return 'UNKNOWN'
    }
}
