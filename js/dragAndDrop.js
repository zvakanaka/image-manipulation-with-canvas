import fileParts from './fileParts.js'

function readInFile(files, callback) {
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
      state.image.onload = callback
      state.image.src = fr.result
    }
    fr.readAsDataURL(file)
  }
}

export default function loadFile(ev, callback) {
  const target = ev.dataTransfer ? ev.dataTransfer : ev.target
  window.fileObject = target.files[0]
  if (target.files.length === 1) { // single file
    //determine if our URL is a supported image
    const supportedFileExtensions = ['png', 'jpg', 'gif', 'bmp', 'jpeg']
    const {ext} = fileParts(target.files[0].name.toLowerCase())
    if (supportedFileExtensions.includes(ext)) { // valid extension
      readInFile(target.files, callback)
    } else {
      alert(`Invalid extension ${ext} in ${supportedFileExtensions.join(', ')}`)
    }
  }
  else { // list of files
    alert('No support for list of files yet')
  }
}
