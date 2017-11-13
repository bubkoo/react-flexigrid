/* eslint-disable react/require-default-props */
import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import propTypes from './struct/propTypes'
import MouseMoveTracker from './dom/MouseMoveTracker'
import {
  clamp,
  shallowEqual,
  cancelAnimationFrame,
  requestAnimationFrame,
} from './utils'

export default class FlexiGridColumnResizeHandler extends React.Component {
  static propTypes = {
    prefixCls: PropTypes.string,
    rtl: PropTypes.bool,
    visible: PropTypes.bool,
    height: PropTypes.number,
    offsetLeft: PropTypes.number,
    offsetTop: PropTypes.number,
    initialWidth: PropTypes.number,
    minWidth: PropTypes.number,
    maxWidth: PropTypes.number,
    knobSize: PropTypes.number,
    adjustKnob: PropTypes.bool,
    initialEvent: propTypes.domEvent,
    columnKey: propTypes.columnKey,
    onColumnResizing: PropTypes.func,
    onColumnResized: PropTypes.func,
  }

  static defaultProps = {
    rtl: false,
    visible: false,
    adjustKnob: false,
    height: 0,
    offsetLeft: 0,
    offsetTop: 0,
    initialWidth: 0,
    minWidth: 0,
    maxWidth: Number.MAX_SAFE_INTEGER,
    knobSize: 0,
    initialEvent: null,
  }

  constructor(props) {
    super(props)

    this.state = {
      width: 0,
      cursorDelta: 0,
    }
    this.cache = null
    this.animating = false
  }

  componentDidMount() {
    this.mouseMoveTracker = new MouseMoveTracker(
      document.body,
      this.onColumnResizing,
      this.onColumnResized,
    )
  }

  componentWillReceiveProps(props) {
    if (props.initialEvent && !this.mouseMoveTracker.isDragging()) {
      this.mouseMoveTracker.capture(props.initialEvent)
      this.setState({
        left: props.offsetLeft - (props.rtl ? 1 : 0),
        width: props.initialWidth,
        cursorDelta: props.initialWidth,
      })

      this.cache = null
      this.animating = true
      this.frameId = requestAnimationFrame(this.updateState)
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      !shallowEqual(this.props, nextProps) ||
      !shallowEqual(this.state, nextState)
    )
  }

  componentWillUnmount() {
    this.mouseMoveTracker.release()
    this.mouseMoveTracker = null
  }

  onColumnResizing = (deltaX) => {
    const { rtl } = this.props
    const state = this.cache || this.state

    const newWidth = state.cursorDelta + (rtl ? -deltaX : deltaX)
    const newFixedWidth = clamp(newWidth, this.props.minWidth, this.props.maxWidth)
    const left = state.left - (this.props.rtl ? newFixedWidth - state.width : 0)

    this.cache = {
      left,
      width: newFixedWidth,
      cursorDelta: newWidth,
    }
  }

  onColumnResized = () => {
    cancelAnimationFrame(this.frameId)
    this.cache = null
    this.frameId = null
    this.animating = false

    this.mouseMoveTracker.release()
    if (this.props.onColumnResized) {
      this.props.onColumnResized(this.state.width, this.props.columnKey)
    }
  }

  updateState = () => {
    if (this.animating) {
      this.frameId = requestAnimationFrame(this.updateState)
    }

    if (this.cache) {
      this.setState(this.cache)
      if (this.props.onColumnResizing) {
        this.props.onColumnResizing(this.cache.width, this.props.columnKey)
      }
    }
  }

  render() {
    const { prefixCls, rtl, visible, height, offsetTop, knobSize, adjustKnob } = this.props
    const { width, left } = this.state
    const className = classNames(
      `${prefixCls}-resize-handler`, {
        visible,
      },
    )

    const wrapStyle = {
      width,
      left,
      height: height - offsetTop,
      top: offsetTop,
    }
    const lineStyle = {
      height: wrapStyle.height,
      top: 0,
    }
    const innerStyle = {
      ...lineStyle,
      width: knobSize,
      right: -Math.ceil(knobSize / 2),
    }

    if (rtl) {
      lineStyle.left = 0
      innerStyle.left = -Math.ceil(knobSize / 2)
    } else {
      lineStyle.right = adjustKnob ? knobSize : 0
      innerStyle.right = (adjustKnob ? knobSize : 0) - Math.ceil(knobSize / 2)
    }

    return (
      <div className={className} style={wrapStyle} >
        <div
          className={'knob-marker'}
          style={lineStyle}
        />
        <div
          className={'mouse-area'}
          style={innerStyle}
        />
      </div>
    )
  }
}
