import * as fs from 'fs'
import arg from 'arg'
import { get, required, tileUrl } from './utils'


const args = arg({
  '--user': String,
  '--style': String,
  '--token': String,
})


const user = required(args['--user'], '--user')
const style = required(args['--style'], '--style')
const token = required(args['--token'], '--token')


get(
  tileUrl(5061, 5952, 14, user, style, token)
).pipe(fs.createWriteStream('./image.png'))
