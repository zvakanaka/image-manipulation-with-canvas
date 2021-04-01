const DEFAULT_DITHER_MIN = 175
const DEFAULT_DITHER_MAX = 220
const WHITE = 255;
const BLACK = 0;

export default {
  name: 'Dither',
  func: ({ canvas, ctx }, ditherRangeMin = DEFAULT_DITHER_MIN, ditherRangeMax = DEFAULT_DITHER_MAX) => {
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);

    let ditherCount = 0;

    for (let i = 0; i < pixels.data.length; i = i + 4) {
      const rgbOver3 = (pixels.data[i] + pixels.data[i + 1] + pixels.data[i + 2]) / 3;
      const doDither = rgbOver3 < ditherRangeMin + 50;
      if (i % 8 === 0) ditherCount++;
      if (i % 512) ditherCount++;
      const newColor = rgbOver3 < ditherRangeMin 
        ? BLACK
        : doDither ? (ditherCount % 2 == 0 ? WHITE : BLACK) : WHITE;

      pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = newColor;
    }
    ctx.putImageData(pixels, 0, 0);
  },
  controls: [
    {
      label: 'DitherRangeMin', default: DEFAULT_DITHER_MIN, type: 'slider',
      attributes: [
        { name: 'value', value: DEFAULT_DITHER_MIN },
        { name: 'max', value: 256 }
      ]
    },
    // {
    //   label: 'DitherRangeMax', default: DEFAULT_DITHER_MAX, type: 'slider',
    //   attributes: [
    //     { name: 'value', value: DEFAULT_DITHER_MAX },
    //     { name: 'max', value: 256 }
    //   ]
    // }
  ]
}
