const DEFAULT_THRESHOLD = 100

export default {
  name: 'Black and White',
  func: ({ canvas, ctx }, threshold = DEFAULT_THRESHOLD) => {
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < pixels.data.length; i = i + 4) {
      const newColor = (pixels.data[i] + pixels.data[i + 1] + pixels.data[i + 2]) / 3 < threshold ? 0 : 255
      pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = newColor;
    }
    ctx.putImageData(pixels, 0, 0);
  },
  controls: [
    {
      label: 'Threshold', default: DEFAULT_THRESHOLD, type: 'slider',
      attributes: [
        { name: 'value', value: DEFAULT_THRESHOLD },
        { name: 'max', value: 256 }
      ]
    }
  ]
}
