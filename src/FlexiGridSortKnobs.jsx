import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import propTypes from './struct/propTypes'
import { shallowEqual } from './utils'


export default class FlexiGridSortKnobs extends React.Component {
  static propTypes = {
    prefixCls: PropTypes.string.isRequired,
    headerRowHeight: PropTypes.number.isRequired,
    headerHeight: PropTypes.number.isRequired,
    bodyWidth: PropTypes.number.isRequired,
    knobSize: PropTypes.number.isRequired,
    scrollX: PropTypes.number.isRequired,
    showScrollbarX: PropTypes.bool.isRequired,
    leftFixedColumns: propTypes.columns.isRequired,
    scrollableColumns: propTypes.columns.isRequired,
    rightFixedColumns: propTypes.columns.isRequired,
    leftFixedColumnsWidth: PropTypes.number.isRequired,
    scrollableColumnsWidth: PropTypes.number.isRequired,
    rightFixedColumnsWidth: PropTypes.number.isRequired,
    onSort: PropTypes.func.isRequired,
  }

  shouldComponentUpdate(nextProps) {
    return !shallowEqual(this.props, nextProps)
  }

  renderKnob(column, leftColumnsWidth, scrollable, isRightFixedColumn) {
    if (column.sortable === false) {
      return null
    }

    const {
      sortType,
      sortColumnKey,
      onSort,
      knobSize,
      headerRowHeight,
      headerHeight,
      bodyWidth,
      scrollX,
      showScrollbarX,
      leftFixedColumnsWidth,
      scrollableColumnsWidth,
      rightFixedColumnsWidth,
    } = this.props


    const left = leftColumnsWidth + column.width - (scrollable ? scrollX : 0)
    let top = headerRowHeight * (column.depth - 1)

    top += (headerHeight - top) / 2

    const style = {
      top,
      left,
      zIndex: scrollable ? 0 : 1,
    }

    if (showScrollbarX) {
      if (scrollable) {
        if (
          left < leftFixedColumnsWidth + knobSize ||
          left > bodyWidth - rightFixedColumnsWidth
        ) {
          style.display = 'none'
        }
      }

      if (isRightFixedColumn) {
        style.left = (bodyWidth - leftFixedColumnsWidth - rightFixedColumnsWidth)
          + (leftColumnsWidth - scrollableColumnsWidth) + column.width
      }
    }

    const key = column.key || `${leftColumnsWidth}-${column.depth}`

    return (
      <div
        key={`sort-knob-for-${key}`}
        className={`${this.props.prefixCls}-sort-knob`}
        style={style}
      >
        <i // eslint-disable-line
          className={classnames('sort-asc', { on: column.key === sortColumnKey && sortType === 'asc' })}
          onClick={() => onSort(column, 'asc')}
        />
        <i // eslint-disable-line
          className={classnames('sort-desc', { on: column.key === sortColumnKey && sortType === 'desc' })}
          onClick={() => onSort(column, 'desc')}
        />
      </div>
    )
  }

  renderKnobs(columns, leftColumnsWidth, scrollable, isRightFixed) {
    let width = leftColumnsWidth
    const knobs = []

    columns.forEach((column) => {
      if (column.children) {
        knobs.push(
          ...this.renderKnobs(column.children, width, scrollable, isRightFixed),
        )
      } else {
        knobs.push(this.renderKnob(column, width, scrollable, isRightFixed))
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
      ...this.renderKnobs(leftFixedColumns, 0, false, false),
      ...this.renderKnobs(scrollableColumns, leftFixedColumnsWidth, true, false),
      ...this.renderKnobs(rightFixedColumns, leftFixedColumnsWidth + scrollableColumnsWidth, false, true), // eslint-disable-line
    ]

    return (
      <div className={`${this.props.prefixCls}-sort-wrap`}>
        {knobs}
      </div>
    )
  }
}
