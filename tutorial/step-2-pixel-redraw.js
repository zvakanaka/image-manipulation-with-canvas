import { corsServer } from '../config.js'

// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Using_images
const img = new Image()

// thanks: https://stackoverflow.com/a/50002148/4151489
img.crossOrigin = 'anonymous'

// thanks: https://gist.github.com/jimmywarting/ac1be6ea0297c16c477e17f8fbe51347
// and specifically: https://github.com/Rob--W/cors-anywhere
img.src = `${corsServer}/https://mdn.mozillademos.org/files/5397/rhino.jpg`

const canvas = document.querySelector('canvas') // defaults to 300x150
const ctx = canvas.getContext('2d')

img.onload = () => {
  canvas.width = img.width
  canvas.height = img.height
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  const threshold = 100

  for (let x = 0; x < canvas.width; x++) {
    for (let y = 0; y < canvas.height; y++) {
      const data = ctx.getImageData(x, y, 1, 1).data
      const newColor = (data[0] + data[1] + data[2]) / 3 < threshold ? 'black' : 'white'
      ctx.fillStyle = newColor
      ctx.fillRect(x, y, 1, 1)
    }
  }

}
