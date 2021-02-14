export default {
  name: 'Grayscale',
  func: ({ canvas, ctx }, algorithm = 'rgb2gray') => {
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < pixels.data.length; i = i + 4) {
      let newColor
      switch (algorithm) {
        case 'rgb2gray':
          // https://www.mathworks.com/help/matlab/ref/rgb2gray.html
          newColor = (0.299 * pixels.data[i]) + (0.587 * pixels.data[i + 1]) + (0.114 * pixels.data[i + 2])
          break
        case 'average':
          newColor = (pixels.data[i] + pixels.data[i + 1] + pixels.data[i + 2]) / 3
          break
        default:
          break
      }
      pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = newColor
    }

    ctx.putImageData(pixels, 0, 0);
  },
  controls: [
    {
      label: 'Algorithm', type: 'select',
      options: [
        { label: 'Rgb2gray', value: 'rgb2gray' },
        { label: 'Average', value: 'average' }
      ]
    },
    {
      label: 'Rgb2gray reference', type: 'link', href: 'https://www.mathworks.com/help/matlab/ref/rgb2gray.html'
    }
  ]
}
