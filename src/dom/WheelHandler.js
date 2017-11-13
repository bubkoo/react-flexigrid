import { requestAnimationFrame, getJudgeFunction } from '../utils'
import normalizeWheel from './normalizeWheel'

export default class WheelHandler {
  /**
   * onWheel is the callback that will be called with right frame rate if
   * any wheel events happened
   * onWheel should is to be called with two arguments: deltaX and deltaY in
   * this order
   */
  constructor(onWheel, handleScrollX, handleScrollY, stopPropagation) {
    this.deltaX = 0
    this.deltaY = 0
    this.animationFrameID = null

    this.handleScrollX = getJudgeFunction(handleScrollX)
    this.handleScrollY = getJudgeFunction(handleScrollY)
    this.stopPropagation = getJudgeFunction(stopPropagation)
    this.callback = onWheel
  }

  onWheel = (e) => {
    const normalizedEvent = normalizeWheel(e)
    const { pixelX, pixelY } = normalizedEvent
    const deltaX = this.deltaX + pixelX
    const deltaY = this.deltaY + pixelY
    const handleScrollX = this.handleScrollX(deltaX, deltaY)
    const handleScrollY = this.handleScrollY(deltaY, deltaX)
    if (!handleScrollX && !handleScrollY) { return }

    this.deltaX += handleScrollX ? pixelX : 0
    this.deltaY += handleScrollY ? pixelY : 0

    e.preventDefault()

    let changed
    if (this.deltaX !== 0 || this.deltaY !== 0) {
      if (this.stopPropagation()) {
        e.stopPropagation()
      }
      changed = true
    }

    if (changed === true && this.animationFrameID === null) {
      this.animationFrameID = requestAnimationFrame(this.didWheel)
    }
  }

  didWheel = () => {
    this.animationFrameID = null
    if (this.callback) {
      this.callback(this.deltaX, this.deltaY)
    }
    this.deltaX = 0
    this.deltaY = 0
  }
}
