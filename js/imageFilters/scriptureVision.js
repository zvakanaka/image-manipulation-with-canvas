import parseScriptures from '../scriptureRegex/index.js'

// THANK YOU: https://github.com/jeromewu/tesseract.js-video
const OCR_INTERVAL = 10000

let ocrTimerId

export default {
  name: 'Scripture Vision',
  pre: async (state) => {
    state.drawLock = true
    state.stopVideo()
    const outputEl = document.createElement('div')
    outputEl.classList.add('ocr-output')
    outputEl.classList.add('filter-messages')
    document.querySelector('.image-filter-controls').insertAdjacentElement('afterend', outputEl)
    // load tesseract
    outputEl.textContent = 'Loading Tesseract'
    await import('https://unpkg.com/tesseract.js@v2.0.0-beta.1/dist/tesseract.min.js')
    const { createWorker, createScheduler } = Tesseract
    const scheduler = createScheduler()

    // initialize tesseract
    outputEl.textContent = 'Initializing Tesseract...'
    for (let i = 0; i < 4; i++) {
      const worker = createWorker()
      await worker.load()
      await worker.loadLanguage('eng')
      await worker.initialize('eng')
      scheduler.addWorker(worker)
    }
    outputEl.textContent = 'OCR Started'
    setTimeout(() => outputEl.textContent = '', 500)

    await state.startVideo(500)
    state.drawLock = false

    ocrTimerId = setInterval(async () => {
      const { data: { text } } = await scheduler.addJob('recognize', state.canvas);
      outputEl.innerHTML += parseScriptures(text)
      outputEl.scrollTop = outputEl.scrollHeight
    }, OCR_INTERVAL);
  },
  func: ({ canvas, ctx }) => {},
  post: async (state) => {
    clearInterval(ocrTimerId)
    document.querySelector('.ocr-output').remove()
    state.stopVideo()
    await state.startVideo()
  },
  controls: []
}
