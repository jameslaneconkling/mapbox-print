import arg from 'arg'
import { print } from './'
import { any, BBox, required } from './utils'


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
  '--outfile': String,
  // '--dry-run': Boolean,
})


const zoom = required(args['--zoom'], '--zoom')
const bbox = required(args['--bbox'], '--bbox')
const user = required(args['--user'], '--user')
const style = required(args['--style'], '--style')
const token = required(args['--token'], '--token')
const outfile = args['--outfile'] ?? `${process.cwd()}/map.png`


print(bbox, zoom, user, style, token)
  .then((out) => {
    out.write(outfile)
    console.log(`Saved map to ${outfile}`)
  })
  .catch((err) => console.error(err))
