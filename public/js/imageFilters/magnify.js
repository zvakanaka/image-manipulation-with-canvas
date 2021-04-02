import cloneCanvas from '../cloneCanvas.js'
const DEFAULT_LENS_FACTOR = 0.7

// Converted from C++ from here: https://www.partow.net/programming/bitmap/index.html

export default {
  name: 'Magnify (partow.net)',
  events: ['mousedown', 'mousemove'],
  func: ({ canvas, ctx, lastClickX, lastClickY }, lensFactor = DEFAULT_LENS_FACTOR) => {
    const [ baseCanvas, baseCtx ] = cloneCanvas(canvas)
    const lensCenterX = typeof lastClickX !== 'undefined' ? lastClickX : canvas.width / 2
    const lensCenterY = typeof lastClickY !== 'undefined' ? lastClickY : canvas.height / 2
    const lensRadius = Math.min(baseCanvas.width, baseCanvas.height)    
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const basePixels = baseCtx.getImageData(0, 0, canvas.width, canvas.height);    
    for (let i = 0; i < pixels.data.length; i = i + 4) {
      const j = i / 4
      const x = j % canvas.width
      const y = Math.floor(j / canvas.width)      
      const dx = x - lensCenterX
      const dy = y - lensCenterY      
      const distance = Math.sqrt(dx * dx + dy * dy)      
      if (distance <= lensRadius) {
        const radius = distance / lensRadius
        const angle = Math.atan2(dy, dx)
        const distortion = Math.pow(radius, lensFactor) * distance        
        let sx = distortion * Math.cos(angle) + lensCenterX
        let sy = distortion * Math.sin(angle) + lensCenterY        
        if (
          sx >= 0
          && sy >= 0
          && sx < canvas.width
          && sy < canvas.height
        ) {
          const baseI = (Math.floor(sy) * canvas.width + Math.floor(sx)) * 4
          pixels.data[i] = basePixels.data[baseI]
          pixels.data[i + 1] = basePixels.data[baseI + 1]
          pixels.data[i + 2] = basePixels.data[baseI + 2]
        }
      }
    }
    ctx.putImageData(pixels, 0, 0);
  },
  controls: [
    {
      label: 'Lens Factor', default: DEFAULT_LENS_FACTOR, type: 'slider',
      attributes: [
        { name: 'value', value: DEFAULT_LENS_FACTOR},
        { name: 'max', value: 10 },
        { name: 'step', value: 0.1 }
      ]
    },
    {
      label: 'Reference', type: 'link', href: 'https://www.partow.net/programming/bitmap/index.html'
    }
  ]
}