/* eslint-disable react/require-default-props */
import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import propTypes from './struct/propTypes'
import MouseMoveTracker from './dom/MouseMoveTracker'
import { shallowEqual, clamp, cancelAnimationFrame, requestAnimationFrame } from './utils'
import FlexiGridCell from './FlexiGridCell'


export default class FlexiGridColumnReorderHandler extends React.Component {
  static propTypes = {
    prefixCls: PropTypes.string,
    column: propTypes.column,
    targets: propTypes.dropTarget,
    visible: PropTypes.bool,
    factor: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number,
    headerRowHeight: PropTypes.number,
    columnHeight: PropTypes.number,
    offsetLeft: PropTypes.number,
    offsetTop: PropTypes.number,
    borderSize: PropTypes.number,
    knobSize: PropTypes.number,
    initialEvent: propTypes.domEvent,
    onColumnReordering: PropTypes.func,
    onColumnReordered: PropTypes.func,
  }

  static defaultProps = {
    visible: false,
    factor: 3 / 4,
    width: 0,
    height: 0,
    headerRowHeight: 0,
    columnHeight: 0,
    offsetLeft: 0,
    offsetTop: 0,
    borderSize: 0,
    knobSize: 0,
    targets: [],
    initialEvent: null,
  }

  constructor(props) {
    super(props)
    this.state = {
      minLeft: 0,
      maxLeft: 0,
      left: 0,
    }
    this.cache = null
    this.animating = false
  }

  componentDidMount() {
    this.mouseMoveTracker = new MouseMoveTracker(
      document.body,
      this.onColumnReordering,
      this.onColumnReordered,
    )
  }

  componentWillReceiveProps(props) {
    if (props.initialEvent && !this.mouseMoveTracker.isDragging()) {
      this.mouseMoveTracker.capture(props.initialEvent)

      const { column, targets, offsetLeft } = props
      const minLeft = targets.length ? targets[0].left : offsetLeft
      const maxLeft = targets.length
        ? targets[targets.length - 1].left + targets[targets.length - 1].width - column.width
        : offsetLeft

      this.setState({
        minLeft,
        maxLeft,
        left: offsetLeft,
        delta: offsetLeft,
        targetKey: null,
        targetPosition: 0,
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

  onColumnReordering = (deltaX) => {
    if (deltaX !== 0) {
      const state = this.cache || this.state
      const newLeft = state.delta + deltaX
      const newFixedLeft = clamp(newLeft, this.state.minLeft, this.state.maxLeft)
      this.cache = {
        movingLeft: deltaX < 0,
        left: newFixedLeft,
        delta: newLeft,
      }
    }
  }

  onColumnReordered = () => {
    const targetKey = this.cache && this.cache.targetKey
    cancelAnimationFrame(this.frameId)
    this.cache = null
    this.frameId = null
    this.animating = false

    this.mouseMoveTracker.release()
    if (this.props.onColumnReordered) {
      this.props.onColumnReordered(targetKey)
    }
  }

  updateState = () => {
    if (this.animating) {
      this.frameId = requestAnimationFrame(this.updateState)
    }

    if (this.cache) {
      const { column, targets, factor } = this.props
      const { left, movingLeft } = this.cache
      const right = left + column.width

      let currentTarget = null
      const tryLeftSide = () => {
        targets.some((target) => {
          if (
            target.key !== column.key &&
            left > target.left &&
            left < target.left + target.width * factor
          ) {
            currentTarget = {
              targetKey: target.key,
              targetPosition: target.left,
              isLeftTarget: true,
              visible: target.leftSideVisible,
            }
            return true
          }

          return false
        })
      }
      const tryRightSide = () => {
        for (let i = targets.length - 1; i >= 0; i -= 1) {
          const target = targets[i]
          if (
            target.key !== column.key &&
            right < target.left + target.width &&
            right > target.left + target.width * (1 - factor)
          ) {
            currentTarget = {
              targetKey: target.key,
              targetPosition: target.left + target.width,
              isLeftTarget: false,
              visible: target.rightSideVisible,
            }
            break
          }
        }
      }


      if (movingLeft) {
        tryLeftSide()
      } else {
        tryRightSide()
      }

      if (!currentTarget) {
        if (movingLeft) {
          tryRightSide()
        } else {
          tryLeftSide()
        }
      }

      if (!currentTarget) {
        currentTarget = {
          targetKey: null,
          targetPosition: 0,
          isLeftTarget: true,
        }
      }

      if (!currentTarget.visible) {
        currentTarget.targetKey = null
      }

      this.cache = {
        ...this.cache,
        ...currentTarget,
      }

      this.setState(this.cache)

      if (this.props.onColumnReordering) {
        this.props.onColumnReordering({
          targetKey: currentTarget.targetKey,
          position: left,
          movingLeft,
        })
      }
    }
  }

  renderDropTargets() {
    const { targets } = this.props
    return (targets || []).map(({ key, ...style }) => (
      <div
        key={key}
        style={style}
        className={'drop-target'}
      />
    ))
  }

  renderSourceMask() {
    const { column, columnHeight, borderSize, offsetLeft, offsetTop } = this.props
    return column ? (<div
      className={'source-mask'}
      style={{
        left: offsetLeft,
        top: offsetTop,
        height: columnHeight - borderSize,
        width: column.width - borderSize,
      }}
    />) : null
  }

  renderHeaderMergedCells(height, left, column) {
    const { prefixCls, headerRowHeight } = this.props
    const { children, width, title, key, align } = column
    const cellProps = {
      prefixCls,
      width,
      height: headerRowHeight,
      left: 0,
      render: title,
      align: align || 'center',
    }

    return (
      <div
        key={`${key}-merged-cells-wrap`}
        className={`${prefixCls}-header-merged-cells-wrap`}
        style={{ width, height, left }}
      >
        <FlexiGridCell {...cellProps} />
        <div
          key={`${key}-merged-cells`}
          className={`${prefixCls}-header-merged-cells`}
          style={{
            width,
            height: height - headerRowHeight,
            top: headerRowHeight,
          }}
        >
          {
            this.renderHeaderCells(children, height - headerRowHeight)
          }
        </div>
      </div>
    )
  }

  renderHeaderCells(columns, height) {
    const { prefixCls } = this.props

    let left = 0

    return columns.map((column) => {
      const { children, width, title, key, align } = column
      let ret

      if (children) {
        ret = this.renderHeaderMergedCells(height, left, column)
      } else {
        const cellProps = {
          key,
          prefixCls,
          width,
          height,
          left,
          align,
          render: title,
        }

        ret = <FlexiGridCell {...cellProps} />
      }

      left += width

      return ret
    })
  }

  renderDragKnob(column, height, offsetLeft, offsetTop) {
    const { prefixCls, knobSize } = this.props
    const style = {
      top: offsetTop,
      left: offsetLeft,
      width: knobSize,
      height,
    }
    const className = classNames(`${prefixCls}-reorder-knob`, {
      active: column === this.props.column,
    })

    return (
      <div
        key={column.key}
        style={style}
        className={className}
      />
    )
  }

  renderDragKnobs(columns, height, offsetLeft, offsetTop) {
    const { headerRowHeight } = this.props
    const knobs = []
    let left = offsetLeft

    columns.forEach((column) => {
      if (column.children) {
        knobs.push(
          this.renderDragKnob(column, headerRowHeight, left, offsetTop),
          ...this.renderDragKnobs(
            column.children,
            height - headerRowHeight, left, offsetTop + headerRowHeight,
          ),
        )
      } else {
        knobs.push(this.renderDragKnob(column, height, left, offsetTop))
      }
      left += column.width
    })

    return knobs
  }

  renderDragProxy() {
    if (this.props.column) {
      const { left } = this.state
      const { column, columnHeight, offsetTop } = this.props
      return (
        <div
          className={'drag-proxy'}
          style={{
            width: column.width,
            height: columnHeight,
            top: offsetTop,
            left,
          }}
        >
          {
            this.renderHeaderCells([column], columnHeight)
          }
          {
            this.renderDragKnobs([column], columnHeight, 0, 0)
          }
        </div >
      )
    }

    return null
  }

  renderDropMarker() {
    const { columnHeight, offsetTop, width } = this.props
    const { targetKey, targetPosition, isLeftTarget } = this.state
    if (targetKey) {
      const className = classNames('target-marker', {
        'is-left': isLeftTarget,
        'is-right': !isLeftTarget,
      })
      const style = {
        height: columnHeight,
        top: offsetTop,
      }
      if (isLeftTarget) {
        style.left = targetPosition
      } else {
        style.right = width - targetPosition
      }

      return (<div className={className} style={style} />)
    }

    return null
  }

  render() {
    const { prefixCls, visible, width, height } = this.props
    const className = classNames(
      `${prefixCls}-reorder-handler`, {
        visible,
      },
    )

    const wrapStyle = {
      width,
      height,
    }

    return (
      <div className={className} style={wrapStyle}>
        {this.renderDropTargets()}
        {this.renderSourceMask()}
        {this.renderDropMarker()}
        {this.renderDragProxy()}
      </div>
    )
  }
}
