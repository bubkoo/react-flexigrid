/* eslint-disable react/require-default-props */

import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import keys from 'rc-util/lib/KeyCode'
import { shallowEqual, translateDOMPosition, clamp } from './utils'
import WheelHandler from './dom/WheelHandler'
import MouseMoveTracker from './dom/MouseMoveTracker'

const FACE_MARGIN = 4
const FACE_MARGIN_2X = FACE_MARGIN * 2
const SCROLLBAR_SIZE = 15
const FACE_SIZE_MIN = 30
const KEYBOARD_SCROLL_AMOUNT = 40

let lastScrolledScrollbar = null

export default class Scrollbar extends React.Component {
  static SIZE = SCROLLBAR_SIZE
  static OFFSET = FACE_MARGIN / 2 + 1
  static KEYBOARD_SCROLL_AMOUNT = KEYBOARD_SCROLL_AMOUNT

  static propTypes = {
    size: PropTypes.number.isRequired,
    contentSize: PropTypes.number.isRequired,
    position: PropTypes.number,
    defaultPosition: PropTypes.number,
    opaque: PropTypes.bool,
    orientation: PropTypes.oneOf(['vertical', 'horizontal']),
    trackColor: PropTypes.oneOf(['gray']),
    zIndex: PropTypes.number,
    top: PropTypes.number, // top position of vertical bar
    left: PropTypes.number, // left position of horizontal bar
    onScroll: PropTypes.func,
  }

  static defaultProps = {
    defaultPosition: 0,
    opaque: true,
    zIndex: 99,
    orientation: 'vertical',
  }

  constructor(props) {
    super(props)
    this.state = this.calculateState(props.position || props.defaultPosition || 0)
  }

  componentWillMount() {
    const onWheel = this.state.horizontal ? this.onWheelX : this.onWheelY

    this.wheelHandler = new WheelHandler(
      onWheel,
      this.shouldHandleScrollX,
      this.shouldHandleScrollY,
    )

    this.initialRender = true
  }

  componentDidMount() {
    this.mouseMoveTracker = new MouseMoveTracker(
      document.documentElement,
      this.onMouseMove,
      this.onMouseMoveEnd,
    )

    if (
      this.props.position !== undefined &&
      this.state.position !== this.props.position
    ) {
      this.triggerOnScrollCallback()
    }

    this.initialRender = false
  }

  componentWillReceiveProps(nextProps) {
    if (!shallowEqual(this.props, nextProps)) {
      const controlledPosition = nextProps.position
      if (controlledPosition === undefined) {
        this.setNextState(
          this.calculateState(this.state.position, nextProps),
        )
      } else {
        this.setNextState(
          this.calculateState(controlledPosition, nextProps),
          nextProps,
        )
      }
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !shallowEqual(this.props, nextProps) ||
      !shallowEqual(this.state, nextState)
  }

  componentWillUnmount() {
    this.mouseMoveTracker.release()
    delete this.mouseMoveTracker

    if (lastScrolledScrollbar === this) {
      lastScrolledScrollbar = null
    }
  }

  onWheel = (delta) => {
    this.setNextState(
      this.calculateState(this.state.position + delta),
    )
  }

  onWheelX = (deltaX) => { this.onWheel(deltaX) }

  onWheelY = (deltaX, deltaY) => { this.onWheel(deltaY) }

  onMouseDown = (e) => {
    let nextState

    if (e.target !== this.faceElem) {
      const nativeEvent = e.nativeEvent
      let position = this.state.horizontal
        ? nativeEvent.offsetX || nativeEvent.layerX
        : nativeEvent.offsetY || nativeEvent.layerY

      // mousedown on the scroll-track directly, move the
      // center of the scroll-face to the mouse position.
      position /= this.state.scale
      nextState = this.calculateState(position - (this.state.faceSize * 0.5 / this.state.scale))
    } else {
      nextState = {}
    }

    nextState.focused = true

    this.setNextState(nextState)
    this.mouseMoveTracker.capture(e)
    // focus the container so it may receive keyboard events
    this.containerElem.focus()
  }

  onMouseMove = (deltaX, deltaY) => {
    let delta = this.state.horizontal ? deltaX : deltaY
    if (delta !== 0) {
      delta /= this.state.scale
      this.setNextState(this.calculateState(this.state.position + delta))
    }
  }

  onMouseMoveEnd = () => {
    this.mouseMoveTracker.release()
    this.setState({ dragging: false, focused: false })
  }

  onKeyDown = (e) => {
    const keyCode = e.keyCode

    // let focus move off the scrollbar
    if (keyCode === keys.TAB) { return }

    let distance = KEYBOARD_SCROLL_AMOUNT
    let direction = 0

    if (this.state.horizontal) {
      switch (keyCode) {
        case keys.HOME:
          direction = -1
          distance = this.props.contentSize
          break

        case keys.LEFT:
          direction = -1
          break

        case keys.RIGHT:
          direction = 1
          break

        default:
          return
      }
    } else {
      switch (keyCode) {
        case keys.SPACE:
          if (e.shiftKey) {
            direction = -1
          } else {
            direction = 1
          }
          break

        case keys.HOME:
          direction = -1
          distance = this.props.contentSize
          break

        case keys.UP:
          direction = -1
          break

        case keys.DOWN:
          direction = 1
          break

        case keys.PAGE_UP:
          direction = -1
          distance = this.props.size
          break

        case keys.PAGE_DOWN:
          direction = 1
          distance = this.props.size
          break

        default:
          return
      }
    }

    e.preventDefault()

    this.setNextState(this.calculateState(this.state.position + (distance * direction)))
  }

  onFocus = () => { this.setState({ focused: true }) }

  onBlur = () => { this.setState({ focused: false }) }

  setNextState(nextState, props = this.props) {
    const controlledPosition = props.position
    const willScroll = this.state.position !== nextState.position
    const callback = willScroll ? this.triggerOnScrollCallback : undefined

    if (controlledPosition === undefined) {
      this.setState(nextState, callback)
    } else if (controlledPosition === nextState.position) {
      this.setState(nextState)
    } else {
      // Scrolling is controlled.
      // Don't update the state and let the owner to update the scrollbar instead.
      if (
        nextState.position !== undefined &&
        nextState.position !== this.state.position
      ) {
        callback(nextState.position)
      }
      return
    }

    if (willScroll && lastScrolledScrollbar !== this) {
      if (lastScrolledScrollbar) {
        lastScrolledScrollbar.blur()
      }
      lastScrolledScrollbar = this
    }
  }

  calculateState(position, props = this.props) {
    const { size, contentSize, orientation } = props

    // unscrollable
    if (size < 1 || contentSize <= size) {
      return {
        position: 0,
        scrollable: false,
      }
    }

    const cachedStateKey = `${position}_${size}_${contentSize}_${orientation}`
    if (this.cachedStateKey === cachedStateKey) {
      return this.cachedState
    }

    // There are two types of positions here.
    // 1) Phisical position: changed by mouse or keyboard
    // 2) Logical position: changed by props.
    // The logical position will be kept as as internal state and the `render()`
    // function will translate it into physical position to render.

    let scale = size / contentSize
    let faceSize = size * scale

    if (faceSize < FACE_SIZE_MIN) {
      scale = (size - FACE_SIZE_MIN) / (contentSize - size)
      faceSize = FACE_SIZE_MIN
    }

    const maxPosition = contentSize - size

    position = clamp(position, 0, maxPosition) // eslint-disable-line

    // This function should only return flat values that can be
    // compared quiclky by `shallowEqual`.
    const state = {
      scale,
      faceSize,
      position,
      dragging: this.mouseMoveTracker ? this.mouseMoveTracker.isDragging() : false,
      horizontal: orientation === 'horizontal',
      scrollable: true,
    }

    // cache the state
    this.cachedStateKey = cachedStateKey
    this.cachedState = state

    return state
  }

  shouldHandleScrollChange(delta) {
    const nextState = this.calculateState(this.state.position + delta)
    return nextState.position !== this.state.position
  }

  shouldHandleScrollX = delta => (
    this.props.orientation === 'horizontal'
      ? this.shouldHandleScrollChange(delta)
      : false
  )

  shouldHandleScrollY = delta => (
    this.props.orientation !== 'horizontal'
      ? this.shouldHandleScrollChange(delta)
      : false
  )

  blur() {
    if (!this.containerElem) {
      return
    }

    try {
      this.onBlur()
      this.containerElem.blur()
    } catch (oops) {
      // pass
    }
  }

  scrollBy(delta) { this.onWheel(delta) }

  triggerOnScrollCallback = (position = this.state.position) => {
    if (this.props.onScroll) {
      this.props.onScroll(position)
    }
  }

  render() {
    if (!this.state.scrollable) { return null }

    const { prefixCls, size, opaque } = this.props
    const faceSize = this.state.faceSize
    const position = this.state.position * this.state.scale + FACE_MARGIN
    const active = this.state.focused || this.state.dragging
    const horizontal = this.state.horizontal

    const mainClassName = classNames({
      [`${prefixCls}-scroll`]: true,
      vertical: !horizontal,
      horizontal,
      opaque,
      active,
    })

    const faceClassName = classNames({
      [`${prefixCls}-scroll-face`]: true,
    })

    let mainStyle
    let faceStyle

    if (horizontal) {
      mainStyle = {
        left: this.props.left,
        width: size,
        height: SCROLLBAR_SIZE,
      }
      faceStyle = {
        width: faceSize - FACE_MARGIN_2X,
      }
      translateDOMPosition(faceStyle, position, 0, this.initialRender)
    } else {
      mainStyle = {
        top: this.props.top,
        width: SCROLLBAR_SIZE,
        height: size,
      }
      faceStyle = {
        height: faceSize - FACE_MARGIN_2X,
      }
      translateDOMPosition(faceStyle, 0, position, this.initialRender)
    }

    if (this.props.zIndex) {
      mainStyle.zIndex = this.props.zIndex
    }

    if (this.props.trackColor === 'gray') {
      mainStyle.backgroundColor = '#f6f7f8'
    }

    return (
      <div // eslint-disable-line
        style={mainStyle}
        className={mainClassName}
        tabIndex={0} // eslint-disable-line
        onBlur={this.onBlur}
        onFocus={this.onFocus}
        onKeyDown={this.onKeyDown}
        onMouseDown={this.onMouseDown}
        onWheel={this.wheelHandler.onWheel}
        ref={(containerElem) => { this.containerElem = containerElem }}
      >
        <div
          style={faceStyle}
          className={faceClassName}
          ref={(faceElem) => { this.faceElem = faceElem }}
        />
      </div>
    )
  }
}
