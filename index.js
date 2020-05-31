import imageFilters from './js/imageFilters/index.js'
import createControl from './js/createControl.js'
import download from './js/download.js'
import initDragAndDrop from './js/dragAndDrop.js'
import { corsServer } from './config.js'
import './js/logWindow.js'

document.body.appendChild(document.createElement('log-window'))
customElements.whenDefined('log-window').then(() => {
  const log = document.querySelector('log-window')
  log.windowTitle = 'Console Output'
  log.consoleOverride = true
})

const inputSourceSelect = document.querySelector('.input-source-select')
const imageFilterContainer = document.querySelector('.image-filter-container')
const imageFilterSelect = imageFilterContainer.querySelector('.image-filter-select')
const imageFilterControls = imageFilterContainer.querySelector('.image-filter-controls')
const drop = document.querySelector('.drop')
const imageInput = drop.querySelector('#image-file')
const urlInputContainer = document.querySelector('.url-input-container')
const urlInput = document.querySelector('.url-input')
const urlInputGo = document.querySelector('.url-input-go-button')

const state = {
  ratio: null,
  canvas: document.querySelector('canvas') // defaults to 300x150
}

initDragAndDrop(state, imageInput)

state.ctx = state.canvas.getContext('2d')

state.drawImg = () => {
  // contain image within view
  const maxWidth = window.innerWidth
  const maxHeight = window.innerHeight
  const imageWidth = state.image.videoWidth || state.image.width
  const imageHeight = state.image.videoHeight || state.image.height
  state.canvas.width = imageWidth
  state.canvas.height = imageHeight

  if (maxWidth < maxHeight) {
    if (imageWidth > maxWidth) {
      state.canvas.width = maxWidth
      state.ratio = imageWidth / maxWidth
      state.canvas.height = imageHeight / state.ratio
    }
  } else {
    if (imageHeight > maxHeight) {
      state.canvas.height = maxHeight
      state.ratio = imageHeight / maxHeight
      state.canvas.width = imageWidth / state.ratio
    }
  }
  state.ctx.drawImage(state.image, 0, 0, state.canvas.width, state.canvas.height)
}

const addImageFilter = (name, i) => {
  const option = document.createElement('option')
  option.value = `${i}`
  option.textContent = name
  imageFilterSelect.appendChild(option)
}
// add each filter to the select
imageFilters.forEach((imageFilter, i) => addImageFilter(imageFilter.name, i))

state.currentFilter = () => imageFilters[imageFilterSelect.value]

let lastSelectedFilterSelectValue
state.draw = async () => {
  if (!state.drawLock) {
    state.drawImg()
  }

  const filter = state.currentFilter()
  if (lastSelectedFilterSelectValue !== imageFilterSelect.value) {
    // run teardown
    const lastFilter = imageFilters[lastSelectedFilterSelectValue]
    if (lastFilter && typeof lastFilter.post === 'function') {
      await lastFilter.post(state)
    }

    // set up controls
    Array.from(imageFilterControls.children).forEach(child => child.remove())
    filter.controls.forEach((control) => {
      const controlEl = createControl(control, state)
      imageFilterControls.appendChild(controlEl)
    })
    lastSelectedFilterSelectValue = imageFilterSelect.value

    if (typeof filter.pre === 'function') {
      await filter.pre(state)
    }
  }

  if (!state.drawLock) {
    filter.func(state, state.lastFuncArg)
  }
}

// apply the selected filter
imageFilterSelect.addEventListener('change', async () => {
  delete state.lastFuncArg
  await state.draw()
})

state.canvas.addEventListener('mousedown', ({layerX, layerY}) => {
  state.lastClickX = layerX
  state.lastClickY = layerY
  if (state.currentFilter().events && state.currentFilter().events.includes('mousedown')) {
    state.draw()
  }
})

state.canvas.addEventListener('mousemove', ({layerX, layerY}) => {
  state.lastClickX = layerX
  state.lastClickY = layerY
  if (state.currentFilter().events && state.currentFilter().events.includes('mousemove')) {
    state.draw()
  }
})

window.onresize = () => {
  state.draw()
}

document.addEventListener('dragover', (ev) => ev.preventDefault())

state.loadImage = () => {
  urlInputContainer.hidden = false
  const defaultImageUrl = 'https://images.unsplash.com/photo-1579036018199-6cab68e7f7c9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1267&q=80'
  const imageSrc = !urlInput.value ? defaultImageUrl : urlInput.value
  const exampleSrc = `${corsServer}${imageSrc}`
  state.image = new Image()
  state.image.crossOrigin = 'anonymous'
  state.image.src = exampleSrc
  state.image.onload = state.draw
}

urlInputGo.addEventListener('click', state.loadImage)

let canPlayEventListenerHandle
state.startVideo = async (interval = 16) => {
  state.video = document.querySelector('video')
  const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
  state.video.srcObject = mediaStream
  state.video.play()
  canPlayEventListenerHandle = () => {
    state.image = state.video
    state.videoIntervalHandle = setInterval(state.draw, interval)
  }
  state.video.addEventListener('canplay', canPlayEventListenerHandle)
}

state.stopVideo = () => {
  state.video.removeEventListener('canplay', canPlayEventListenerHandle)
  clearInterval(state.videoIntervalHandle)
  state.video.pause()
  if (state.video.srcObject) {
    state.video.srcObject.getTracks().forEach(track => track.stop())
  }
  state.video.srcObject = null
  delete state.image.videoWidth
  delete state.image.videoHeight
}

inputSourceSelect.addEventListener('change', () => {
  drop.hidden = true
  urlInputContainer.hidden = true
  switch (inputSourceSelect.value) {
    case 'webcam':
      state.startVideo()
      break
    case 'url':
      if (state.video) {
        state.stopVideo()
      }
      state.loadImage()
      break
    case 'file':
      if (state.video) {
        state.stopVideo()
      }
      drop.hidden = false
      break
    default:
      break
  }
})

inputSourceSelect.dispatchEvent(new Event('change'))

// export button - or you can right-click the canvas -> save image
const exportButton = document.querySelector('.export')
exportButton.addEventListener('click', () => {
  const outFileName = `${state.currentFilter().name}-${new Date().toString()}.png`
  state.canvas.toBlob(blob => download(blob, outFileName))
})
