/*
  * By Eli Grey, http://eligrey.com
  * License : https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md (MIT)
  * source  : http://purl.eligrey.com/github/FileSaver.js
  */
export default function download(blob, name) {
  const a = document.createElement('a');
  a.download = name;
  if (typeof blob === 'string') {
    a.href = blob;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', blob);
    xhr.responseType = 'blob';
    xhr.onload = () => download(xhr.response, name);
    xhr.onerror = () => console.error('could not download file');
    xhr.send();
  } else {
    a.href = URL.createObjectURL(blob);
    setTimeout(() => URL.revokeObjectURL(a.href), 4E4); // 40s
    setTimeout(() => a.click(), 0);
  }
}
