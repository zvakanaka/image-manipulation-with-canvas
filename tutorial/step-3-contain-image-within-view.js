import { corsServer } from '../config.js'

const img = new Image()
img.crossOrigin = 'anonymous'

const imageSrc = 'https://images.unsplash.com/photo-1579036018199-6cab68e7f7c9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1267&q=80'
img.src = `${corsServer}${imageSrc}`

const canvas = document.querySelector('canvas') // defaults to 300x150
const ctx = canvas.getContext('2d')

let ratio

const drawImg = (img) => {
  // contain image within view
  const maxWidth = window.innerWidth
  const maxHeight = window.innerHeight

  if (maxWidth < maxHeight) { // if window is narrower than it is wide
    if (img.width > maxWidth) { // if img is wider than window - scale image
      canvas.width = maxWidth
      ratio = img.width / maxWidth
      canvas.height = img.height / ratio
    }
  } else { // if img is taller than window - scale image
    if (img.height > maxHeight) {
      canvas.height = maxHeight
      ratio = img.height / maxHeight
      canvas.width = img.width / ratio
    }
  }

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
}

const blackAndWhite = (threshold = 100) => {
  for (let x = 0; x < canvas.width; x++) {
    for (let y = 0; y < canvas.height; y++) {
      const data = ctx.getImageData(x, y, 1, 1).data
      const newColor = (data[0] + data[1] + data[2]) / 3 < threshold ? 'black' : 'white'
      ctx.fillStyle = newColor
      ctx.fillRect(x, y, 1, 1)
    }
  }
}

img.onload = () => {
  drawImg(img)
  blackAndWhite()
}

window.onresize = () => {
  drawImg(img)
  blackAndWhite()
}
