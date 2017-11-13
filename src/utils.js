import translateDOMPositionXY from './dom/translateDOMPositionXY'

export clamp from 'clamp'
export deepEqual from 'lodash.isequal'
export shallowEqual from 'shallowequal'
const functionReturnTrue = () => true
const functionReturnFalse = () => false

const nativeRequestAnimationFrame =
  global.requestAnimationFrame ||
  global.webkitRequestAnimationFrame ||
  global.mozRequestAnimationFrame ||
  global.oRequestAnimationFrame ||
  global.msRequestAnimationFrame

export const cancelAnimationFrame =
  global.cancelAnimationFrame ||
  global.webkitCancelAnimationFrame ||
  global.mozCancelAnimationFrame ||
  global.oCancelAnimationFrame ||
  global.msCancelAnimationFrame ||
  global.clearTimeout

let animationFrameTime = 0

export const requestAnimationFrame = nativeRequestAnimationFrame || ((callback) => {
  const currTime = Date.now()
  const timeDelay = Math.max(0, 16 - (currTime - animationFrameTime))
  animationFrameTime = currTime + timeDelay
  return global.setTimeout(() => {
    callback(Date.now())
  }, timeDelay)
})

export function translateDOMPosition(style, x, y, initialRender = false) {
  if (initialRender) {
    style.left = `${x}px`
    style.top = `${y}px`
  } else {
    translateDOMPositionXY(style, x, y)
  }
}

export function debounce(
  func,
  wait,
  context,
  setTimeoutFunc = setTimeout,
  clearTimeoutFunc = clearTimeout,
) {
  let timeout

  const debouncer = (...args) => {
    debouncer.reset()

    const callback = () => {
      func.apply(context, args)
    }
    timeout = setTimeoutFunc(callback, wait)
  }

  debouncer.reset = () => {
    clearTimeoutFunc(timeout)
  }

  return debouncer
}

export function getJudgeFunction(fn) {
  if (typeof handleScrollX !== 'function') {
    return fn ? functionReturnTrue : functionReturnFalse
  }
  return fn
}
