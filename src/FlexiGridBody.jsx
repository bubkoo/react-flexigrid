import React from 'react'
import PropTypes from 'prop-types'
import propTypes from './struct/propTypes'
import { shouldUpdateBody } from './FlexiGridUpdateHelper'
import FlexiGridBufferedRows from './FlexiGridBufferedRows'


export default class FlexiGridBody extends React.Component {
  static PROPTYPES_DISABLED_FOR_PERFORMANCE = {
    prefixCls: PropTypes.string,
    rowHeight: PropTypes.number,
    bordered: PropTypes.bool,
    scrollX: PropTypes.number,
    showScrollbarX: PropTypes.bool,
    showScrollbarY: PropTypes.bool,

    width: PropTypes.number,
    height: PropTypes.number,
    data: propTypes.data,
    rowKey: propTypes.columnKey,
    firstRowIndex: PropTypes.number,
    firstRowOffset: PropTypes.number,
    bufferRowCount: PropTypes.number,
    scrolling: PropTypes.bool,
    getRowPosition: PropTypes.func.isRequired,
    getRowClassName: PropTypes.func,
    getRowHeight: PropTypes.func,
    getSubRowHeight: PropTypes.func,

    leftFixedColumns: propTypes.columns,
    scrollableColumns: propTypes.columns,
    rightFixedColumns: propTypes.columns,
    leftFixedLeafColumns: propTypes.columns,
    scrollableLeafColumns: propTypes.columns,
    rightFixedLeafColumns: propTypes.columns,
    leftFixedColumnsWidth: PropTypes.number,
    scrollableColumnsWidth: PropTypes.number,
    rightFixedColumnsWidth: PropTypes.number,
    leftFixedColumnsUpdated: PropTypes.bool,
    scrollableColumnsUpdated: PropTypes.bool,
    rightFixedColumnsUpdated: PropTypes.bool,

    onRowTouchStart: PropTypes.func,
    onRowTouchEnd: PropTypes.func,
    onRowTouchMove: PropTypes.func,

    onRowClick: PropTypes.func,
    onRowDoubleClick: PropTypes.func,
    onRowMouseDown: PropTypes.func,
    onRowMouseUp: PropTypes.func,
    onRowMouseEnter: PropTypes.func,
    onRowMouseLeave: PropTypes.func,
  }

  shouldComponentUpdate(nextProps) {
    return shouldUpdateBody(this.props, nextProps)
  }

  renderRows() {
    return (
      <FlexiGridBufferedRows
        {...this.props}
        rowCount={this.props.data.length}
        defaultRowHeight={this.props.rowHeight}
      />
    )
  }

  render() {
    const { prefixCls, width, height, data } = this.props
    return (
      <div className={`${prefixCls}-body`} style={{ width, height }}>
        {
          data && data.length ? this.renderRows() : null
        }
      </div>
    )
  }
}
