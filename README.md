[Try it out](https://zvakanaka.github.io/image-manipulation-with-canvas)

# Add Your Own Image Filter
You can add your own image filter by taking the example code below and adding it to a new file in `/js/imageFilters/` (feel free to make a PR!).

You will need to export an object with a `name`, `func`, and possible `controls` (see existing image filters for [controls examples](./js/imageFilters/grayscale.js)). Make sure to also add your filter to the [image filters index](./js/imageFilters/index.js).
```javascript
// by <YOUR_NAME_HERE>
const DEFAULT_THRESHOLD = 100

export default {
  name: 'Black and White',
  func: (state, threshold = DEFAULT_THRESHOLD) => {
    for (let x = 0; x < state.canvas.width; x++) {
      for (let y = 0; y < state.canvas.height; y++) {
        const data = state.ctx.getImageData(x, y, 1, 1).data
        const newColor = (data[0] + data[1] + data[2]) / 3 < threshold ? 'black' : 'white'
        state.ctx.fillStyle = newColor
        state.ctx.fillRect(x, y, 1, 1)
      }
    }
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

```
