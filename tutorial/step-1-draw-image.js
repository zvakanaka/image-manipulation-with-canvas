// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Using_images
const img = new Image()

img.src = 'https://mdn.mozillademos.org/files/5397/rhino.jpg'

const canvas = document.querySelector('canvas') // defaults to 300x150
const ctx = canvas.getContext('2d')

canvas.width = img.width
canvas.height = img.height

img.onload = () => {
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
}
