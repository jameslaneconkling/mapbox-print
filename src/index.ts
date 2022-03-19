import Jimp from 'jimp'
import { BBox, get, MERCATOR, range, sequential, tileUrl, composeImagesHorizontally, composeImagesVertically } from './utils'


export const print = (bbox: BBox, zoom: number, user: string, style: string, token: string) => {
  const { minX, minY, maxX, maxY } = MERCATOR.xyz([bbox.west, bbox.south, bbox.east, bbox.north], zoom)

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
