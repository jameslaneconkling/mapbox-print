import * as https from 'https'
import SphericalMercator from '@mapbox/sphericalmercator'
import Jimp from 'jimp'


export type BBox = { west: number, south: number, east: number, north: number }


// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = () => {}


export const required = <T>(value: T | undefined, arg: string) => {
  if (value === undefined) {
    throw new Error(`Argument ${arg} is required`)
  }

  return value
}


export const range = (min: number, max: number) => {
  const out: number[] = []
  let i = min

  while (i <= max) {
    out.push(i)
    i++
  }

  return out
}


export const sequential = async <T, R>(project: (item: T) => Promise<R>, list: T[]) => {
  const result: R[] = []

  for (const item of list) {
    const projected = await project(item)
    result.push(projected)
  }

  return result
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


export const get = (url: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const buffer: Buffer[] = []

    https.request(
      url,
      (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(res.statusCode?.toString() ?? 'UNKNOWN'))
        }
        
        res
          .on('data', (data) => buffer.push(data))
          .on('error', (error) => reject(error))
          .on('end', () => resolve(Buffer.concat(buffer)))
      }
    )
      .on('error', (error) => reject(error))
      .end()
  })
}


export const composeImagesHorizontally = (images: Jimp[]) => {
  const width = images.reduce((width, image) => width + image.getWidth(), 0)
  const height = images[0]?.getHeight() ?? 0

  let out = new Jimp(width, height, 0xffffff00)
  let xOffset = 0

  for (let i = 0; i < images.length; i++) {
    out = out.composite(images[i], xOffset, 0)
    xOffset += images[i].getWidth()
  }

  return out
}


export const composeImagesVertically = (images: Jimp[]) => {
  const width = images[0]?.getWidth() ?? 0
  const height = images.reduce((height, image) => height + image.getHeight(), 0)

  let out = new Jimp(width, height, 0xffffff00)
  let yOffset = 0

  for (let i = 0; i < images.length; i++) {
    out = out.composite(images[i], 0, yOffset)
    yOffset += images[i].getHeight()
  }

  return out
}


const _mercator = new SphericalMercator({ size: 256 })
export const print = (bbox: BBox, zoom: number, user: string, style: string, token: string) => {
  const { minX, minY, maxX, maxY } = _mercator.xyz([bbox.west, bbox.south, bbox.east, bbox.north], zoom)

  console.log(`Downloading ${(maxX - minX + 1) * (maxY - minY + 1)} tiles ...`)

  return sequential(
    (y) => {
      console.log(`Downloading tile row ${y - minY + 1} of ${maxY - minY + 1}`)

      return Promise.all(
        range(minX, maxX).map((x) => {
          console.log(`Downloading tile z: ${zoom}, x: ${x}, y: ${y}`)
  
          return get(
            tileUrl(x, y, zoom, user, style, token)
          )
            .then(Jimp.read)
        })
      )
        .then(composeImagesHorizontally)
    },
    range(minY, maxY)
  )
    .then(composeImagesVertically)
    .then((image) => {
      console.log('Done')
      return image
    })
}
