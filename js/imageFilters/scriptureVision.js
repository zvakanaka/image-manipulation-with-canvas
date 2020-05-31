import parseScriptures from '../scriptureRegex/index.js'

// THANK YOU: https://github.com/jeromewu/tesseract.js-video

export default {
  name: 'Scripture Vision',
  pre: async (state) => {
    state.drawLock = true

    const goButton = document.querySelector('#scripture-visualize-go')
    goButton.disabled = true

    if (state.video) { 
      state.stopVideo()
    }
    const outputEl = document.createElement('div')
    outputEl.classList.add('ocr-output')
    outputEl.classList.add('filter-messages')
    document.querySelector('.image-filter-controls').insertAdjacentElement('afterend', outputEl)
    // load tesseract
    outputEl.textContent = 'Loading Tesseract...'
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
    outputEl.textContent = 'Ready to run OCR!'
    goButton.disabled = false
    setTimeout(() => outputEl.textContent = '', 500)

    if (state.video) {
      await state.startVideo(500)
    }
    state.drawLock = false

    goButton.addEventListener('click', async () => {
      goButton.disabled = true
      console.log('Running OCR...\n')
      const startTime = Date.now()
      const { data: { text } } = await scheduler.addJob('recognize', state.canvas)
      const endTime = Date.now()
      const totalTime = endTime - startTime
      console.log(`Finished OCR in ${totalTime / 1000} seconds\n`)
      goButton.disabled = false
      outputEl.innerHTML += parseScriptures(text)
      outputEl.scrollTop = outputEl.scrollHeight
    })
  },
  func: ({ canvas, ctx }) => {
     const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < pixels.data.length; i = i + 4) {
      const newColor = (pixels.data[i] + pixels.data[i + 1] + pixels.data[i + 2]) / 3
      pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = newColor
    }

    ctx.putImageData(pixels, 0, 0);
  },
  post: async (state) => {
    document.querySelector('.ocr-output').remove()
    if (state.video) {
      state.stopVideo()
      await state.startVideo()
    }
  },
  controls: [
    {
      label: 'Recognize Text', type: 'button',
      attributes: [
        { name: 'id', value: 'scripture-visualize-go' }
      ]
    }
  ]
}
