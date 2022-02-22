import * as https from 'https'
import * as stream from 'stream'
import SphericalMercator from '@mapbox/sphericalmercator'


// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = () => {}


export const required = <T>(value: T | undefined, arg: string) => {
  if (value === undefined) {
    throw new Error(`Argument ${arg} is required`)
  }

  return value
}


export const any = <T>(predicate: (value: T) => boolean, list: T[]) => {
  for (const item of list) {
    if (predicate(item)) {
      return true
    }
  }

  return false
}


export const tileUrl = (x: number, y: number, z: number, user: string, style: string, token: string) => {
  return `https://api.mapbox.com/styles/v1/${user}/${style}/tiles/512/${z}/${x}/${y}@2x?access_token=${token}`
}


export const get = (url: string) => {
  const response = new stream.Readable({
    read: noop,
  })
  
  https.request(
    url,
    (res) => {
      if (res.statusCode !== 200) {
        response.destroy(new Error(res.statusCode?.toString() ?? 'UNKNOWN'))
      }
      
      res.on('end', () => {
        response.push(null)
      })
  
      res.on('data', (data) => {
        response.push(data)
      })
    }
  )
    .on('error', (error) => response.destroy(error))
    .end()

  return response
}


const mercator = new SphericalMercator({
  size: 256
})


export type BoundingBox = [number, number, number, number]


export function* bboxToTiles(bbox: BoundingBox, zoom: number): Generator<{ x: number, y: number }, void, void> {
  const { minX, minY, maxX, maxY } = mercator.xyz(bbox, zoom)
  let x = minX
  let y = minY

  while (y < maxY) {
    while (x < maxX) {
      yield { x, y }
      x += 1
    }
    y += 1
  }
}
