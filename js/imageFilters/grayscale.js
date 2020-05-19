export default {
  name: 'Grayscale',
  func: (state, algorithm = 'rgb2gray') => {
    for (let x = 0; x < state.canvas.width; x++) {
      for (let y = 0; y < state.canvas.height; y++) {
        const data = state.ctx.getImageData(x, y, 1, 1).data
        const [r, g, b] = data
        let newColor
        switch (algorithm) {
          case 'rgb2gray':
            // https://www.mathworks.com/help/matlab/ref/rgb2gray.html
            newColor = (0.299 * r) + (0.587 * g) + (0.114 * b)
            break
          case 'average':
            newColor = (data[0] + data[1] + data[2]) / 3
            break
          default:
            break
        }
        state.ctx.fillStyle = `rgb(${newColor}, ${newColor}, ${newColor})`
        state.ctx.fillRect(x, y, 1, 1)
      }
    }
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
