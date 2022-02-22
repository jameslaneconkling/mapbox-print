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
  t.plan(2)

  let awaitingResponse = true

  const url = tileUrl(5061, 5952, 14, user, style, token)

  console.log('requesting tile', url)
  get(url)
    .on('data', (data) => {
      console.log('data:', data.length)
      if (awaitingResponse) {
        awaitingResponse = false
      }
    })
    .on('error', (error) => {
      t.fail(error.toString())
    })
    .on('end', () => {
      console.log('--done--')
      if (!awaitingResponse) {
        t.pass('request emitted data')
      }
      t.pass('request completed')
    })
})


test('unsuccessful tile request', (t) => {
  t.plan(1)

  get(tileUrl(5061, 5952, 14, user, style, 'bad-token-value'))
    .on('data', (data) => {
      t.fail(`bad request should not emit. emitted: ${data}`)
    })
    .on('error', (error) => {
      t.pass(`bad request successfully emitted error: ${error}`)
    })
    .on('end', () => {
      t.fail('bad request should not end')
    })
})
