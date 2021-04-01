import imageFilters from './js/imageFilters/index.js'
import createControl from './js/createControl.js'
import download from './js/download.js'
import initDragAndDrop from './js/dragAndDrop.js'
import { corsServer } from './config.js'
import './js/logWindow.js'

const ENDPOINT = ''
// document.body.appendChild(document.createElement('log-window'))
// customElements.whenDefined('log-window').then(() => {
//   const log = document.querySelector('log-window')
//   log.windowTitle = 'Console Output'
//   log.consoleOverride = true
// })

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
  const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: false,   video: {
    width: 640,
    height: { max: 640 }
  } })
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

// send button - or you can right-click the canvas -> save image
const sendButton = document.querySelector('.send-button')
sendButton.addEventListener('click', async () => {
const THRESHOLD = 128;

  sendButton.disabled = true;
  var imgData = state.ctx.getImageData(0, 0, state.canvas.width, state.canvas.height);
  function getPixel(imgData, index) {
    var i = index * 4, d = imgData.data;
    return [d[i], d[i+1], d[i+2], d[i+3]] // Returns array [R,G,B,A]
  }
  function getPixelXY(imgData, x, y) {
    return getPixel(imgData, y * imgData.width + x);
  }
  const rows = [];
  
  const pixelsWidth = 128;
  const dividend = state.canvas.width / pixelsWidth
  const pixelsHeight = 64 //state.canvas.height / dividend
  // console.log(state.canvas.width, pixelsWidth, pixelsHeight, dividend)
  for (let y = 0; y < pixelsHeight; y++) {
    const row = [];
    for (let x = 0; x < pixelsWidth; x++) {
      const [r, g, b] = getPixelXY(imgData,
        x * dividend + (Math.floor(dividend / 2)),
        y * dividend + (Math.floor(dividend / 2)))
        // const [r, g, b] = getPixelXY(imgData, x, y);
        const pixel = (r + g + b) / 3 > THRESHOLD ? 1 : 0
        row.push(pixel);
    }
    rows.push(row.join(''));
  }

    // for (let x = 0; x < pixelsWidth; x++) {
    //   for (let y = 0; y < pixelsHeight; y++) {
    //     const data = getPixelXY(
    //       x * dividend + (Math.floor(dividend / 2)),
    //       y * dividend + (Math.floor(dividend / 2)))
    //     const [r, g, b] = data

    //     // state.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
    //     // state.ctx.fillRect(x * dividend, y * dividend, dividend, dividend)
    //   }
    // }


console.log(rows)
const n = 64; // number of times to call promise
const responses = await sequentialPromiseAll(
    sendRow, // function that returns a promise (will be called n times after previous one resolves)
    [0, rows[0]], // arguments array provided to promise
    n, // number of times to call promise
    ( // callback - invoked after each promise resolution
      argsHandle, // modify this in the callback to change the arguments at the next invocation
      _previousResponse, // what is resolved from promise
      i) => {
        
        argsHandle[0] = i;
        argsHandle[1] = rows[i];
      });
      sendButton.disabled = false;
    })
    
    
    function delay(ms) {
      return new Promise(function (resolve) { return setTimeout(resolve, ms); });
    };
function sendRow(num, data) {
  return new Promise(async (resolve) => {
    await delay(100);
    const payload = {
      rowNum: num,
      data
    }
      fetch(`${ENDPOINT}/draw-row`, {
        method: 'POST',
        body: JSON.stringify(payload),
        'content-type': 'application/json'
      })
      .then(res => res.text())
      .then(data => resolve(data));

  })
}

function sendText(text, x = 0, y = 0, size = 1) {
  return new Promise((resolve) => {
    const payload = {
      x,
      y,
      text,
      size
    }
    fetch(`${ENDPOINT}/draw-text`, {
      method: 'POST',
      body: JSON.stringify(payload),
      'content-type': 'application/json'
    })
    .then(res => res.text())
    .then(data => resolve(data));
  })
}
const sendTextButton = document.querySelector('.send-text-button')
sendTextButton.addEventListener('click', async () => {
  const text = document.querySelector('.send-text-text').value
  const size = document.querySelector('.send-text-size').value
  const x = document.querySelector('.send-text-x').value
  const y = document.querySelector('.send-text-y').value
  sendTextButton.disabled = true
  await sendText(text, x, y, size)
  sendTextButton.disabled = false
})

function clearDisplay() {
  return new Promise((resolve) => {
    fetch(`${ENDPOINT}/clear-display`)
    .then(res => resolve('cleared'));
  })
}
const clearDisplayButton = document.querySelector('.clear-display-button')
clearDisplayButton.addEventListener('click', async () => {
  clearDisplayButton.disabled = true
  await clearDisplay()
  clearDisplayButton.disabled = false
})

function invert() {
  return new Promise((resolve) => {
    fetch(`${ENDPOINT}/invert`)
    .then(res => resolve('inverted'));
  })
}
const invertButton = document.querySelector('.invert-button')
invertButton.addEventListener('click', async () => {
  invertButton.disabled = true
  await invert()
  invertButton.disabled = false
})
function unInvert() {
  return new Promise((resolve) => {
    fetch(`${ENDPOINT}/un-invert`)
    .then(res => resolve('un-inverted'));
  })
}
const unInvertButton = document.querySelector('.un-invert-button')
unInvertButton.addEventListener('click', async () => {
  unInvertButton.disabled = true
  await unInvert()
  unInvertButton.disabled = false
})

function dim() {
  return new Promise((resolve) => {
    fetch(`${ENDPOINT}/dim`)
    .then(res => resolve('dimmed'));
  })
}
const dimButton = document.querySelector('.dim-button')
dimButton.addEventListener('click', async () => {
  dimButton.disabled = true
  await dim()
  dimButton.disabled = false
})
function unDim() {
  return new Promise((resolve) => {
    fetch(`${ENDPOINT}/un-dim`)
    .then(res => resolve('un-dimmed'));
  })
}
const unDimButton = document.querySelector('.un-dim-button')
unDimButton.addEventListener('click', async () => {
  unDimButton.disabled = true
  await unDim()
  unDimButton.disabled = false
})

/** see https://www.npmjs.com/package/sequential-promise-all */
/**
 * Call a promise n times, waiting for each promise to resolve before calling it again.
 * THANK YOU for idea: Jason Suttles https://stackoverflow.com/a/43377621/4151489
 * @param  {function} promise        function that returns a Promise (will be called n times after previous one finishes)
 * @param  {Array}    args           arguments to pass to promise
 * @param  {Number}   n              number of times to call promise
 * @param  {function} [updateCb]     callback that is called after every resolution (modify args here before next call if desired)
 * @return {Promise[]}               array of responses from all promises
 */
function sequentialPromiseAll(promise, args, n, updateCb) {
  return new Promise((resolve, reject) => {
    const responses = [];
    const arr = Array.from(Array(n), (_d, i) => i); // create array filled with 0..n
    arr.reduce((p, _item, i) => {
      return p.then((previousResponse) => {
        if (previousResponse) {
          responses.push(previousResponse);
          if (updateCb) updateCb(args, previousResponse, i);
        }
        return promise(...args);
      });
    }, Promise.resolve()).then((previousResponse) => {
      responses.push(previousResponse);
      resolve(responses);
    }).catch((err) => {
      console.warn(err, responses);
      reject(responses);
    });
  });
}
