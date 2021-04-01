export default (control, state) => {
  let el
  let attributeEl
  switch (control.type) {
    case 'button':
      el = document.createElement('button')
      el.textContent = control.label
      break
    case 'range':
    case 'slider':
      el = document.createElement('span')
      if (control.label) {
        const label = document.createElement('label')
        label.textContent = control.label
        el.appendChild(label)
      }
      const input = document.createElement('input')
      input.type = 'range'
      setTimeout(() => {
        input.value = control.default
      })
      attributeEl = input
      const valueSpan = document.createElement('span')
      valueSpan.textContent = control.default
      input.addEventListener('input', ({target}) => {
        control.currentValue = Number(target.value)
        state.drawImg()
        const filter = state.currentFilter()
        valueSpan.textContent = target.value
        state.lastFuncArg = control.currentValue
        filter.func(state, control.currentValue)
      })
      el.appendChild(input)
      el.appendChild(valueSpan)
      break
    case 'link':
      el = document.createElement('a')
      el.href = control.href
      el.textContent = control.label || control.href
      el.setAttribute('target', '_blank')
      break
    case 'select':
      el = document.createElement('span')
      const label = document.createElement('label')
      label.textContent = control.label
      const select = document.createElement('select')
      control.options.forEach(obj => {
        const option = document.createElement('option')
        option.textContent = obj.label
        option.value = obj.value
        select.appendChild(option)
      })
      select.addEventListener('change', ({target}) => {
        control.currentValue = target.value
        state.drawImg()
        const filter = state.currentFilter()
        state.lastFuncArg = control.currentValue
        filter.func(state, control.currentValue)
      })
      label.appendChild(select)
      el.appendChild(label)
      break
    default:
      break
  }

  if (control.attributes) {
    if (!attributeEl) {
     attributeEl = el 
    }
    control.attributes.forEach(attr => attributeEl.setAttribute(attr.name, attr.value))
  }

  return el
}

// TODO
// to have handles clean them up after selecting another filter
// const controlsEventListeners = {}
