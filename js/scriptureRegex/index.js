import bookMap from './scriptureMap.js'

const scripturePattern = /(\b(((\w+)?(\s|&|\&amp;)?)?([A-z]+))\s+)(\d+)(:?(\d+)(\-?(\d+)|(\,?(\d+))*))?/g
const base = 'https://www.churchofjesuschrist.org/study/scriptures'

function replaceScriptureWithLink() {
  //     0     1  2    3 4 5 6  7       8  9           10
  const [whole, , book, , , , , chapter, , startVerse, endVerse] = arguments
  // e.g. https://www.churchofjesuschrist.org/study/scriptures/bofm/1-ne/2.16,18?lang=eng#p16
  const mappedBook = bookMap[book.trim().toLowerCase()]
  if (mappedBook) {
    const link = `<a href="${base}/${mappedBook}/${chapter}${startVerse ? `.${startVerse}${endVerse ? endVerse : ''}#p${startVerse - 1}` : ''}" target="_blank">${whole}</a>`
    return link
  } else {
    console.warn(`'${book}' is not a known book`)
    return whole
  }
}

const parse = (unparsedVal) => replaceMap.reduce((acc, cur) => acc.replace(cur.regexp, cur.replacement), unparsedVal)
const replaceMap = [ { regexp: scripturePattern, replacement: replaceScriptureWithLink } ]


// const parsed = parse(content)
export default parse
