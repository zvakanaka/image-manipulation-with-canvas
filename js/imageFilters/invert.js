export default {
  name: 'Invert',
  func: ({ canvas, ctx }) => {
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height)

    for (let i = 0; i < pixels.data.length; i += 4) {
      pixels.data[i]     = 255 - pixels.data[i]     // red
      pixels.data[i + 1] = 255 - pixels.data[i + 1] // green
      pixels.data[i + 2] = 255 - pixels.data[i + 2] // blue
    }

    ctx.putImageData(pixels, 0, 0)
  },
  controls: []
}
