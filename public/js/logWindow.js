let logWindowCssAdded;

customElements.define('log-window', class LogWindow extends HTMLElement {
  constructor() {
    super();
  }
  
  connectedCallback() {
    const css = `
      log-window {
        /* display: inline-block; */
        position: fixed;
        top: 0;
        color: black;
      }
      log-window pre { 
        white-space: pre-line;
        padding: 1ch;
        margin: 0;
        background: #233;
        color: #3f4;
        max-height: 10rem;
        overflow-y: auto;
      }
      log-window code {
        white-space: pre-line;
      }
      log-window .window-bar {
        display: flex;
        justify-content: space-between;
        background: white;
        padding: 3px 8px 3px 6px;
        border: 2px solid blue;
        height: 1em;
        font-family: monospace;
        cursor: grab;
      }
      log-window .window-minimize {
        cursor: pointer;
        font-weight: bold;
        padding-right: 3px;
      }
      log-window .window-hamburger {
        padding-left: 3px;
      }
    `;
    logWindowCssAdded = true;
    this.innerHTML = `
    <div class="container">
      ${logWindowCssAdded ? `<style>${css}</style>` : ''}
      <div class="window-bar">
        <span class="window-minimize"> – </span>
        <span class="window-title"></span>
        <span class="window-hamburger"> ☰ </span>
      </div>
      <div class="display">
        <pre>
          <code></code>
        </pre>
      </div>
    </div>
    `;

    this._pre = this.querySelector('pre');
    this._code = this.querySelector('code');
    this._bar = this.querySelector('.window-bar');
    this._minimize = this.querySelector('.window-minimize');
    this._title = this.querySelector('.window-title');
    
    this._tempMinimizeTextContent = '+';
    
    this._minimize.addEventListener('click', () => {
      this._pre.hidden = !this._pre.hidden;
      [this._tempMinimizeTextContent, this._minimize.textContent] = [this._minimize.textContent, this._tempMinimizeTextContent];
    });
    
    dragElement(this, this._bar);
  }
  
  write(message = '', color = null) {
    if (this._code.childNodes.length > 0) {
      this._code.appendChild(document.createElement('br'));      
    }
    if (!color) {
      this._code.appendChild(document.createTextNode(message));
    } else {
      const colorSpan = document.createElement('span');
      colorSpan.style.color = color;
      colorSpan.appendChild(document.createTextNode(message));
      this._code.appendChild(colorSpan);
    }
    this._pre.scrollTop = this._pre.scrollHeight;
  }
  
  set windowTitle(titleStr) {
    this._title.textContent = titleStr;
  }
  
  set consoleOverride(on) {
    if (on) {
      this._origConsole = console;
      console = {};
      console.clear = () => this._code.innerHTML = '';
      console.log = (...args) => this.write(args);
      console.info = (...args) => this.write(args, 'aqua');
      console.warn = (...args) => this.write(args, 'yellow');
      console.error = (...args) => this.write(args, 'red');
      this._origOnError = window.onerror;
      window.onerror = function (msg, url, lineNo, columnNo, error) {
        console.error(msg)
        return false;
      }
    } else {
      console = this._origConsole;
      window.onerror = this._origOnError;
    }
  }
})

// thanks: https://www.w3schools.com/howto/howto_js_draggable.asp
function dragElement(el, handleEl) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

  let dragStartEvent;
  let dragMoveEvent;
  let dragEndEvent;
  if (window.TouchEvent) {
    dragStartEvent = 'ontouchstart';
    dragMoveEvent = 'ontouchmove';
    dragEndEvent = 'ontouchend';
  } else if (window.PointerEvent) {
    dragStartEvent = 'onpointerdown';
    dragMoveEvent = 'onpointermove';
    dragEndEvent = 'onpointerup';
  } else {
    dragStartEvent = 'onmousedown';
    dragMoveEvent = 'onmousemove';
    dragEndEvent = 'onmouseup';
  }

  if (handleEl) {
    handleEl[dragStartEvent] = dragMouseDown;
  } else {
    el[dragStartEvent] = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document[dragEndEvent] = closeDragElement;
    document[dragMoveEvent] = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    if (e.touches && e.touches.length && e.touches.length > 0) {
      e.clientX = e.touches[0].clientX;
      e.clientY = e.touches[0].clientY;
    }
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    el.style.top = (el.offsetTop - pos2) + 'px';
    el.style.left = (el.offsetLeft - pos1) + 'px';
  }

  function closeDragElement() {
    document[dragEndEvent] = null;
    document[dragMoveEvent] = null;
  }
}