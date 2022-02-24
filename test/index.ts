import arg from 'arg'
import test from 'tape'
import { get, required, tileUrl } from '../src/utils'


const args = arg({
  '--user': String,
  '--style': String,
  '--token': String,
})


const user = required(args['--user'], '--user')
const style = required(args['--style'], '--style')
const token = required(args['--token'], '--token')


test('successful tile request', (t) => {
  t.plan(1)

  const url = tileUrl(5061, 5952, 14, user, style, token)

  console.log('requesting tile', url)
  get(url)
    .then((buffer) => {
      t.ok(buffer instanceof Buffer, 'successfully returned image')
    })
    .catch((error) => {
      t.fail(error.toString())
    })
})


test('unsuccessful tile request', (t) => {
  t.plan(1)

  get(tileUrl(5061, 5952, 14, user, style, 'bad-token-value'))
    .then((buffer) => {
      t.fail(`bad request should not return: ${buffer}`)
    })
    .catch((error) => {
      t.pass(`bad request successfully returned error: ${error}`)
    })
})
