import imageFilters from './js/imageFilters/index.js'
import createControl from './js/createControl.js'
import download from './js/download.js'
import { corsServer } from './config.js'
import fileParts from './js/fileParts.js'

const inputSourceSelect = document.querySelector('.input-source-select')
const imageFilterContainer = document.querySelector('.image-filter-container')
const imageFilterSelect = imageFilterContainer.querySelector('.image-filter-select')
const imageFilterControls = imageFilterContainer.querySelector('.image-filter-controls')
const drop = document.querySelector('.drop')
const imageInput = drop.querySelector('#image-file')

const state = {
  ratio: null,
  canvas: document.querySelector('canvas') // defaults to 300x150
}

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
const draw = async () => {
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
  await draw()
})

state.canvas.addEventListener('mousedown', ({layerX, layerY}) => {
  state.lastClickX = layerX
  state.lastClickY = layerY
  if (state.currentFilter().events && state.currentFilter().events.includes('mousedown')) {
    draw()
  }
})

state.canvas.addEventListener('mousemove', ({layerX, layerY}) => {
  state.lastClickX = layerX
  state.lastClickY = layerY
  if (state.currentFilter().events && state.currentFilter().events.includes('mousemove')) {
    draw()
  }
})

window.onresize = () => {
  draw()
}

function consumeFile(ev) {
  const target = ev.dataTransfer ? ev.dataTransfer : ev.target;
  window.fileObject = target.files[0];
  if (target.files.length === 1) { // single file
    //determine if our URL is a supported image
    const supportedFileExtensions = ['png', 'jpg', 'gif', 'bmp', 'jpeg'];
    const {ext} = fileParts(target.files[0].name.toLowerCase());
    if (supportedFileExtensions.includes(ext)) { // valid extension
      loadFile(target.files);
    } else {
      alert(`Invalid extension ${ext} in ${supportedFileExtensions.join(', ')}`);
    }
  }
  else { // list of files
    alert('No support for list of files yet');
  }
}

imageInput.addEventListener('change', (ev) => {
  ev.preventDefault()
  consumeFile(ev)
})

document.addEventListener('drop', (ev) => {
  ev.preventDefault()
  consumeFile(ev)
}, false)

document.addEventListener('dragover', (ev) => ev.preventDefault())

state.loadImage = () => {
  const imageSrc = 'https://images.unsplash.com/photo-1579036018199-6cab68e7f7c9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1267&q=80'
  const exampleSrc = `${corsServer}${imageSrc}`
  state.image = new Image()
  state.image.crossOrigin = 'anonymous'
  state.image.src = exampleSrc
  state.image.onload = draw
}

function loadFile(files) {
  let file, fr

  if (typeof window.FileReader !== 'function') {
    console.log('File API not supported')
    return
  }

  if (!files) {
    console.log('No support for files input')
  } else if (!files[0]) {
    console.log('No file selected')
  } else {
    file = files[0]
    fr = new FileReader()
    fr.onload = () => {
      state.image = new Image()
      state.image.onload = () => {
        draw()
      }
      state.image.src = fr.result
    }
    fr.readAsDataURL(file)
  }
}

state.startVideo = async (interval = 16) => {
  state.video = document.querySelector('video')
  const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
  state.video.srcObject = mediaStream
  state.video.play()
  state.video.addEventListener('canplay', () => {
    state.image = state.video
    state.videoIntervalHandle = setInterval(draw, interval)
  })
}

state.stopVideo = () => {
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
  drop.hidden = true;
  switch (inputSourceSelect.value) {
    case 'webcam':
      state.startVideo()
      break
    case 'url':
      state.stopVideo()
      state.loadImage()
      break
    case 'file':
      state.stopVideo()
      drop.hidden = false;
      break
    default:
      break
  }
})
state.startVideo()

// export button - or you can right-click the canvas -> save image
const exportButton = document.querySelector('.export')
exportButton.addEventListener('click', () => {
  const outFileName = `${state.currentFilter().name}-${new Date().toString()}.png`
  state.canvas.toBlob(blob => download(blob, outFileName))
})
