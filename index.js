import imageFilters from './js/imageFilters/index.js'
import createControl from './js/createControl.js'
import download from './js/download.js'
import { corsServer } from './config.js'

const imageSrc = 'https://images.unsplash.com/photo-1579036018199-6cab68e7f7c9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1267&q=80'
const exampleSrc = `${corsServer}${imageSrc}`

const state = {
  ratio: null,
  canvas: document.querySelector('canvas') // defaults to 300x150
}

state.image = new Image()
state.image.crossOrigin = 'anonymous'
state.image.src = exampleSrc
state.ctx = state.canvas.getContext('2d')

state.drawImg = () => {
  // contain image within view
  const maxWidth = window.innerWidth
  const maxHeight = window.innerHeight
  if (maxWidth < maxHeight) {
    if (state.image.width > maxWidth) {
      state.canvas.width = maxWidth
      state.ratio = state.image.width / maxWidth
      state.canvas.height = state.image.height / state.ratio
    }
  } else {
    if (state.image.height > maxHeight) {
      state.canvas.height = maxHeight
      state.ratio = state.image.height / maxHeight
      state.canvas.width = state.image.width / state.ratio
    }
  }
  state.ctx.drawImage(state.image, 0, 0, state.canvas.width, state.canvas.height)
}

const imageFilterContainer = document.querySelector('.image-filter-container')
const imageFilterSelect = imageFilterContainer.querySelector('.image-filter-select')
const imageFilterControls = imageFilterContainer.querySelector('.image-filter-controls')

const addImageFilter = (name, i) => {
  const option = document.createElement('option')
  option.value = `${i}`
  option.textContent = name
  imageFilterSelect.appendChild(option)
}
// add each filter to the select
imageFilters.forEach((imageFilter, i) => addImageFilter(imageFilter.name, i))

state.currentFilter = () => imageFilters[imageFilterSelect.value]

const draw = () => {
  state.drawImg()
  Array.from(imageFilterControls.children).forEach(child => child.remove())
  const filter = state.currentFilter()
  filter.func(state)
  filter.controls.forEach((control) => {
    const controlEl = createControl(control, state)
    imageFilterControls.appendChild(controlEl)
  })
}

// apply the selected filter
imageFilterSelect.addEventListener('change', draw)
state.image.onload = draw
window.onresize = draw

// export button - or you can right-click the canvas -> save image
const exportButton = document.querySelector('.export')
exportButton.addEventListener('click', () => {
  const outFileName = `${state.currentFilter().name}-${new Date().toString()}.png`
  state.canvas.toBlob(blob => download(blob, outFileName))
})
