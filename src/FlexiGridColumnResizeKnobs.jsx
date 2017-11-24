import React from 'react'
import PropTypes from 'prop-types'
import propTypes from './struct/propTypes'
import { shallowEqual } from './utils'

export default class FlexiGridColumnResizeKnobs extends React.Component {
  static propTypes = {
    prefixCls: PropTypes.string.isRequired,
    headerRowHeight: PropTypes.number.isRequired,
    headerHeight: PropTypes.number.isRequired,
    bodyHeight: PropTypes.number.isRequired,
    bodyWidth: PropTypes.number.isRequired,
    knobSize: PropTypes.number.isRequired,
    scrollX: PropTypes.number.isRequired,
    showScrollbarX: PropTypes.bool.isRequired,
    leftFixedLeafColumns: propTypes.columns.isRequired,
    scrollableLeafColumns: propTypes.columns.isRequired,
    rightFixedLeafColumns: propTypes.columns.isRequired,
    leftFixedColumnsWidth: PropTypes.number.isRequired,
    scrollableColumnsWidth: PropTypes.number.isRequired,
    rightFixedColumnsWidth: PropTypes.number.isRequired,
    onColumnResize: PropTypes.func.isRequired,
  }

  shouldComponentUpdate(nextProps) {
    return !shallowEqual(this.props, nextProps)
  }

  renderResizeKnob(column, leftColumnsWidth, scrollable, isRightFixed) {
    if (column.resizable === false) {
      return null
    }

    const {
      headerRowHeight,
      headerHeight,
      bodyHeight,
      bodyWidth,
      scrollX,
      showScrollbarX,
      leftFixedColumnsWidth,
      scrollableColumnsWidth,
      rightFixedColumnsWidth,
    } = this.props

    const knobSize = this.props.knobSize % 2 === 1
      ? this.props.knobSize
      : this.props.knobSize + 1

    const offsetLeft = leftColumnsWidth - (scrollable ? scrollX : 0)
    const left = offsetLeft - Math.ceil(knobSize / 2)
    const top = ((column.isFirstLeaf && isRightFixed) || column.isLastLeaf)
      ? 0
      : headerRowHeight * (column.depth - 1)

    const style = {
      top,
      left,
      width: knobSize,
      height: headerHeight + bodyHeight - top,
      zIndex: scrollable ? 0 : 1,
    }

    const data = {
      column,
      knobSize,
      top,
      left: leftColumnsWidth - column.width - (scrollable ? scrollX : 0),
    }

    if (showScrollbarX) {
      if (scrollable) {
        if (
          offsetLeft <= leftFixedColumnsWidth ||
          offsetLeft > bodyWidth - rightFixedColumnsWidth
        ) {
          style.display = 'none'
        }

        // When the last scrollable column reach maxScrollX
        if (column.isLastLeaf && offsetLeft === bodyWidth - rightFixedColumnsWidth) {
          style.left -= knobSize
          // Adjust the last scrollable column's resize-knob position when
          // reach the maxScrollX to avoid non-interactive.
          data.adjustKnob = true
        }
      }

      if (isRightFixed) {
        data.left = (bodyWidth - leftFixedColumnsWidth - rightFixedColumnsWidth)
          + (leftColumnsWidth - scrollableColumnsWidth)
          - column.width
        data.rtl = true
        style.left = data.left - Math.ceil(knobSize / 2)
      }
    }

    return (
      <div // eslint-disable-line
        key={column.key}
        style={style}
        className={`${this.props.prefixCls}-resize-knob`}
        onMouseDown={(e) => { this.props.onColumnResize(data, e) }}
      >
        <div
          className={`${this.props.prefixCls}-resize-knob-marker`}
          style={{ left: Math.floor(knobSize / 2) }}
        />
      </div>
    )
  }

  render() {
    const { leftFixedLeafColumns, scrollableLeafColumns, rightFixedLeafColumns } = this.props
    let width = 0
    return (
      <div className={`${this.props.prefixCls}-resize-wrap`}>
        {
          leftFixedLeafColumns.map((column) => {
            width += column.width
            return this.renderResizeKnob(column, width, false)
          })
        }
        {
          scrollableLeafColumns.map((column) => {
            width += column.width
            return this.renderResizeKnob(column, width, true)
          })
        }
        {
          rightFixedLeafColumns.map((column) => {
            width += column.width
            return this.renderResizeKnob(column, width, false, true)
          })
        }
      </div>
    )
  }
}
