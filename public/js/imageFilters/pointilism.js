import cloneCanvas from '../cloneCanvas.js'

// Converted from C++ from here: https://www.partow.net/programming/bitmap/index.html

const RAND_MAX = Number.MAX_SAFE_INTEGER;

// thanks https://www.dyclassroom.com/reference-javascript/php-rand-function-in-javascript-to-generate-random-integers
function rand(min, max) {
  var min = min || 0,
      max = max || Number.MAX_SAFE_INTEGER;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
export default {
  name: 'Pointilism (partow.net)',
  func: (state, radiusModulo = 7) => {
    const [baseCanvas, baseCtx] = cloneCanvas(state.canvas)      
    const pixelCount = baseCanvas.width * baseCanvas.height
      const N = pixelCount * 0.03 // 3% of pixels
      const rnd_ratio = pixelCount / (1.0 + RAND_MAX)
      for (let i = 0; i < N; ++i) {
        const r = rand() * rnd_ratio
        const x = r % baseCanvas.width
        const y = r / baseCanvas.width
        const cx = x
        const cy = y
        const radius = 1.0 + r % radiusModulo
        const data = baseCtx.getImageData(x, y, 1, 1).data
        state.ctx.beginPath()
        state.ctx.arc(cx, cy, radius, 0, 2 * Math.PI, false)
        state.ctx.fillStyle = `rgb(${data[0]},${data[1]},${data[2]})`
        state.ctx.fill()
      }
  },
  controls: [
    {
      label: 'Radius', default: 7, type: 'slider',
      attributes: [
        { name: 'value', value: 7},
        {name: 'max', value: 100 }
      ]
    },
    {
      label: 'Reference', type: 'link', href: 'https://www.partow.net/programming/bitmap/index.html'
    }
  ]
}