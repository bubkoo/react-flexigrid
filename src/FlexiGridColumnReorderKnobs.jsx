import React from 'react'
import PropTypes from 'prop-types'
import propTypes from './struct/propTypes'
import { shallowEqual } from './utils'

export default class FlexiGridColumnReorderKnobs extends React.Component {
  static propTypes = {
    prefixCls: PropTypes.string.isRequired,
    knobSize: PropTypes.number.isRequired,
    rowHeight: PropTypes.number.isRequired,
    headerHeight: PropTypes.number.isRequired,
    bodyWidth: PropTypes.number.isRequired,
    scrollX: PropTypes.number.isRequired,
    showScrollbarX: PropTypes.bool.isRequired,
    leftFixedColumns: propTypes.columns.isRequired,
    scrollableColumns: propTypes.columns.isRequired,
    rightFixedColumns: propTypes.columns.isRequired,
    leftFixedColumnsWidth: PropTypes.number.isRequired,
    scrollableColumnsWidth: PropTypes.number.isRequired,
    rightFixedColumnsWidth: PropTypes.number.isRequired,
    onColumnReorder: PropTypes.func.isRequired,
  }

  shouldComponentUpdate(nextProps) {
    return !shallowEqual(this.props, nextProps)
  }

  buildReorderKnob(column, leftColumnsWidth, scrollable, isRightFixedColumn) {
    if (column.reorderable === false) {
      return null
    }

    const {
      knobSize,
      rowHeight,
      headerHeight,
      bodyWidth,
      scrollX,
      showScrollbarX,
      leftFixedColumnsWidth,
      scrollableColumnsWidth,
      rightFixedColumnsWidth,
    } = this.props


    const hasChildren = column.children && column.children.length > 0
    const top = rowHeight * (column.depth - 1)
    const left = leftColumnsWidth - (scrollable ? scrollX : 0)
    const height = (
      hasChildren
        ? rowHeight
        : headerHeight - top
    ) - 1

    const style = {
      top,
      left,
      width: knobSize,
      height,
      zIndex: scrollable ? 0 : 1,
    }

    const data = {
      column,
      knobSize,
    }

    if (showScrollbarX) {
      if (scrollable) {
        if (
          left < leftFixedColumnsWidth ||
          left > bodyWidth - rightFixedColumnsWidth - knobSize
        ) {
          style.display = 'none'
        }
      }

      if (isRightFixedColumn) {
        style.left = (bodyWidth - leftFixedColumnsWidth - rightFixedColumnsWidth)
          + (leftColumnsWidth - scrollableColumnsWidth)
      }
    }

    const key = column.key || `${leftColumnsWidth}-${column.depth}`

    return (
      <div // eslint-disable-line
        key={`reorder-knob-for-${key}`}
        className={`${this.props.prefixCls}-reorder-knob`}
        style={style}
        onMouseDown={(e) => { this.props.onColumnReorder(data, e) }}
      />
    )
  }

  buildReorderKnobs(columns, leftColumnsWidth, scrollable, isRightFixed) {
    let width = leftColumnsWidth
    const knobs = []

    columns.forEach((column) => {
      knobs.push(this.buildReorderKnob(column, width, scrollable, isRightFixed))
      if (column.children && column.children.length) {
        knobs.push(
          ...this.buildReorderKnobs(column.children, width, scrollable, isRightFixed),
        )
      }
      width += column.width
    })

    return knobs
  }

  render() {
    const {
      leftFixedColumns,
      scrollableColumns,
      rightFixedColumns,
      leftFixedColumnsWidth,
      scrollableColumnsWidth,
    } = this.props
    const knobs = [
      ...this.buildReorderKnobs(leftFixedColumns, 0, false, false),
      ...this.buildReorderKnobs(scrollableColumns, leftFixedColumnsWidth, true, false),
      ...this.buildReorderKnobs(rightFixedColumns, leftFixedColumnsWidth + scrollableColumnsWidth, false, true), // eslint-disable-line
    ]

    return (
      <div className={`${this.props.prefixCls}-reorder-wrap`}>
        {knobs}
      </div>
    )
  }
}
