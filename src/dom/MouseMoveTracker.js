import addEventListener from 'rc-util/lib/Dom/addEventListener'
import { requestAnimationFrame, cancelAnimationFrame } from '../utils'


export default class MouseMoveTracker {
  constructor(
    domNode,
    onMouseMoveCallback: Function,
    onMouseMoveEndCallback: Function,
  ) {
    this.domNode = domNode
    this.onMouseMoveCallback = onMouseMoveCallback
    this.onMouseMoveEndCallback = onMouseMoveEndCallback

    this.dragging = false
    this.animationFrameID = null
  }

  capture(e) {
    if (!this.captured) {
      this.mouseMoveToken = addEventListener(this.domNode, 'mousemove', this.onMouseMove)
      this.mouseUpToken = addEventListener(this.domNode, 'mouseup', this.onMouseUp)
      // this.mouseLeaveToken = addEventListener(this.domNode, 'mouseleave', this.onMouseEnd)
      // this.mouseOutToken = addEventListener(this.domNode, 'mouseout', this.onMouseEnd)
    }

    this.captured = true

    if (!this.dragging) {
      this.x = e.clientX
      this.y = e.clientY
      this.deltaX = 0
      this.deltaY = 0
      this.dragging = true
    }

    e.preventDefault()
  }

  release() {
    if (this.captured) {
      this.mouseMoveToken.remove()
      this.mouseMoveToken = null
      this.mouseUpToken.remove()
      this.mouseUpToken = null
      // this.mouseLeaveToken.remove()
      // this.mouseLeaveToken = null
      // this.mouseOutToken.remove()
      // this.mouseOutToken = null
    }

    this.captured = false

    if (this.dragging) {
      this.dragging = false
      this.x = null
      this.y = null
    }
  }

  isDragging() {
    return this.dragging
  }

  onMouseMove = (e) => {
    const x = e.clientX
    const y = e.clientY

    this.deltaX += (x - this.x)
    this.deltaY += (y - this.y)

    if (this.animationFrameID === null) {
      this.animationFrameID = requestAnimationFrame(this.triggerOnMouseMoveCallback)
    }

    this.x = x
    this.y = y

    e.preventDefault()
  }

  onMouseUp = () => {
    if (this.animationFrameID) {
      cancelAnimationFrame(this.animationFrameID)
      this.triggerOnMouseMoveCallback()
    }

    this.triggerOnMouseMoveEndCallback(false)
  }

  // onMouseEnd = () => {
  //   this.triggerMouseMoveEndCallback(true)
  // }

  triggerOnMouseMoveCallback = () => {
    this.animationFrameID = null
    this.onMouseMoveCallback(this.deltaX, this.deltaY)
    this.deltaX = 0
    this.deltaY = 0
  }

  triggerOnMouseMoveEndCallback = (cancelMove) => {
    this.onMouseMoveEndCallback(cancelMove)
  }
}
