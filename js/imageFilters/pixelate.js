const DEFAULT_PIXELS_WIDTH = 32
const MAX_PIXELS_WIDTH = 250

export default {
  name: 'Pixelate',
  func: ({ canvas, ctx }, pixelsWidth = DEFAULT_PIXELS_WIDTH) => {
    const dividend = canvas.width / pixelsWidth
    const pixelsHeight = canvas.height / dividend

    for (let x = 0; x < pixelsWidth; x++) {
      for (let y = 0; y < pixelsHeight; y++) {
        const data = ctx.getImageData(
          x * dividend + (Math.floor(dividend / 2)),
          y * dividend + (Math.floor(dividend / 2)),
          1, 1).data
        const [r, g, b] = data
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
        ctx.fillRect(x * dividend, y * dividend, dividend, dividend)
      }
    }
  },
  controls: [
    {
      label: 'Pixel Size', default: DEFAULT_PIXELS_WIDTH, type: 'slider',
      attributes: [
        { name: 'value', value: DEFAULT_PIXELS_WIDTH},
        { name: 'max', value: MAX_PIXELS_WIDTH },
        { name: 'min', value: 1 }
      ]
    }
  ]
}
