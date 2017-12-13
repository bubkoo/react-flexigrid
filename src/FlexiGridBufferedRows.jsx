import React from 'react'
import PropTypes from 'prop-types'
import propTypes from './struct/propTypes'
import FlexiGridRow from './FlexiGridRow'
import FlexiGridRowBuffer from './FlexiGridRowBuffer'

export default class FlexiGridBufferedRows extends React.Component {
  static PROPTYPES_DISABLED_FOR_PERFORMANCE = {
    // inherit from body
    prefixCls: PropTypes.string,
    rowHeight: PropTypes.number,
    bordered: PropTypes.bool,
    scrollX: PropTypes.number,
    showScrollbarX: PropTypes.bool,
    showScrollbarY: PropTypes.bool,
    isJustFullfill: PropTypes.bool,

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

    onRowTouchStart: PropTypes.func,
    onRowTouchEnd: PropTypes.func,
    onRowTouchMove: PropTypes.func,

    onRowClick: PropTypes.func,
    onRowDoubleClick: PropTypes.func,
    onRowMouseDown: PropTypes.func,
    onRowMouseUp: PropTypes.func,
    onRowMouseEnter: PropTypes.func,
    onRowMouseLeave: PropTypes.func,

    // specified
    rowCount: PropTypes.number,
    defaultRowHeight: PropTypes.number,
  }

  constructor(props) {
    super(props)

    this.rowBuffer = new FlexiGridRowBuffer(
      this.props.rowCount,
      this.props.defaultRowHeight,
      this.props.height,
      this.getRowHeight,
      this.props.bufferRowCount,
    )

    this.state = {
      rowsToRender: this.rowBuffer.getRows(
        this.props.firstRowIndex,
        this.props.firstRowOffset,
      ),
    }
  }

  componentDidMount() {
    setTimeout(this.updateBuffer, 1000)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.rowCount !== this.props.rowCount ||
      nextProps.defaultRowHeight !== this.props.defaultRowHeight ||
      nextProps.height !== this.props.height
    ) {
      this.rowBuffer = new FlexiGridRowBuffer(
        nextProps.rowCount,
        nextProps.defaultRowHeight,
        nextProps.height,
        this.getRowHeight,
        this.props.bufferRowCount,
      )
    }

    if (this.props.scrolling && !nextProps.scrolling) {
      this.updateBuffer()
    } else {
      this.setState({
        rowsToRender: this.rowBuffer.getRows(
          nextProps.firstRowIndex,
          nextProps.firstRowOffset,
        ),
      })
    }
  }

  shouldComponentUpdate() {
    return true
  }

  componentWillUnmount() {
    this.rowBuffer = null
  }

  getRowHeight = index => (
    this.props.getRowHeight ?
      this.props.getRowHeight(index) :
      this.props.defaultRowHeight
  )

  getSubRowHeight = index => (
    this.props.getSubRowHeight ?
      this.props.getSubRowHeight(index) :
      this.props.subRowHeight
  )

  updateBuffer() {
    if (this.rowBuffer) {
      this.setState({
        rowsToRender: this.rowBuffer.getRowsWithUpdatedBuffer(),
      })
    }
  }

  render() {
    const {
      data,
      rowKey,
      firstRowIndex,
      firstRowOffset,
      bufferRowCount,
      scrolling,
      getRowPosition,
      getRowClassName,
      getRowHeight,
      getSubRowHeight,
      ...otherProps
    } = this.props

    const rowsToRender = this.state.rowsToRender
    const baseOffsetTop = firstRowOffset - getRowPosition(firstRowIndex)
    const rowPositions = {}
    const sortedRows = rowsToRender.slice().sort((a, b) => a - b)

    sortedRows.forEach((rowIndex) => {
      rowPositions[rowIndex] = getRowPosition(rowIndex)
    })

    const renderredRows = sortedRows.map((rowIndex) => {
      const currentRowHeight = this.getRowHeight(rowIndex)
      // const currentSubRowHeight = this.getSubRowHeight(rowIndex)
      const rowOffsetTop = baseOffsetTop + rowPositions[rowIndex]
      const className = getRowClassName ? getRowClassName(rowIndex) : null
      const record = data[rowIndex]
      const rowProps = {
        ...otherProps,
        className,
        rowIndex,
        record,
        height: currentRowHeight,
        offsetTop: Math.round(rowOffsetTop),
      }

      return <FlexiGridRow key={`body-row-${record[rowKey]}`} {...rowProps} />
    })

    return (<div>{renderredRows}</div>)
  }
}
