import * as fs from 'fs'
import arg from 'arg'
import { any, BBox, bboxToTiles, get, required, tileUrl } from './utils'


const args = arg({
  '--zoom': Number,
  '--bbox': (value: string): BBox => {
    const bbox = value
      .split(',')
      .map((value) => parseFloat(value.trim()))

    if (bbox.length !== 4 || any((value) => typeof value !== 'number' || isNaN(value), bbox)) {
      throw new Error('Malformed bbox argument. Expected w,s,e,n. e.g. `--bbox=-68.8,44.03,-68.77,44.12`')
    }

    return { west: bbox[0], south: bbox[1], east: bbox[2], north: bbox[3] }
  },
  '--user': String,
  '--style': String,
  '--token': String,
})


const zoom = required(args['--zoom'], '--zoom')
const bbox = required(args['--bbox'], '--bbox')
const user = required(args['--user'], '--user')
const style = required(args['--style'], '--style')
const token = required(args['--token'], '--token')


for (const { x, y } of bboxToTiles(bbox, zoom)) {
  console.log(`Downloading z: ${zoom}, x: ${x}, y: ${y}`)

  const get$ = get(tileUrl(x, y, zoom, user, style, token))

  get$
    .on('error', (err) => console.error(`Error downloading z: ${zoom}, x: ${x}, y: ${y}`, err))
    .on('end', () => console.log(`Done downloading z: ${zoom}, x: ${x}, y: ${y}`))

  get$.pipe(fs.createWriteStream(`${__dirname}/../images/${zoom}-${x}-${y}.png`))
}
