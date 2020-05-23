import parseScriptures from '../scriptureRegex/index.js'

// THANK YOU: https://github.com/jeromewu/tesseract.js-video
const OCR_INTERVAL = 10000

let timerId

export default {
  name: 'Scripture Vision',
  pre: async (state) => {
    state.drawLock = true
    state.stopVideo()
    const outputEl = document.createElement('div')
    outputEl.classList.add('ocr-output')
    document.querySelector('.image-filter-controls').insertAdjacentElement('afterend', outputEl)
    // load tesseract
    console.log('loading tesseract')
    await import('https://unpkg.com/tesseract.js@v2.0.0-beta.1/dist/tesseract.min.js')
    const { createWorker, createScheduler } = Tesseract
    console.log('loaded tesseract')
    const scheduler = createScheduler();

    // initialize tesseract
    console.log('initializing tesseract')
    for (let i = 0; i < 4; i++) {
      const worker = createWorker();
      await worker.load();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      scheduler.addWorker(worker);
    }
    console.log('initialized tesseract')

    await state.startVideo(500)
    state.drawLock = false

    timerId = setInterval(async () => {
      const start = new Date();
      const { data: { text } } = await scheduler.addJob('recognize', state.canvas);
      const end = new Date()
      console.log(`[${start.getMinutes()}:${start.getSeconds()} - ${end.getMinutes()}:${end.getSeconds()}], ${(end - start) / 1000} s`);
      text.split('\n').forEach((line) => {
        console.log(line);
      });
      outputEl.innerHTML += parseScriptures(text)
    }, OCR_INTERVAL);
  },
  func: ({ canvas, ctx }) => {
    // const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height)

    // for (let i = 0; i < pixels.data.length; i += 4) {
    //   pixels.data[i]     = 255 - pixels.data[i]     // red
    //   pixels.data[i + 1] = 255 - pixels.data[i + 1] // green
    //   pixels.data[i + 2] = 255 - pixels.data[i + 2] // blue
    // }

    // ctx.putImageData(pixels, 0, 0)
  },
  post: async (state) => {
    clearInterval(timerId)
  },
  controls: []
}
