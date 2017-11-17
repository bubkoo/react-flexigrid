import React from 'react'
import PropTypes from 'prop-types'
import propTypes from './struct/propTypes'
import { shouldUpdateHeader } from './FlexiGridUpdateHelper'
import FlexiGridRow from './FlexiGridRow'

export default class FlexiGridHeader extends React.Component {
  static PROPTYPES_DISABLED_FOR_PERFORMANCE = {
    prefixCls: PropTypes.string,
    rowHeight: PropTypes.number,
    bordered: PropTypes.bool,
    scrollX: PropTypes.number,
    showScrollbarX: PropTypes.bool,
    showScrollbarY: PropTypes.bool,
    leftFixedColumns: propTypes.columns,
    scrollableColumns: propTypes.columns,
    rightFixedColumns: propTypes.columns,
    leftFixedLeafColumns: propTypes.columns,
    scrollableLeafColumns: propTypes.columns,
    rightFixedLeafColumns: propTypes.columns,
    scrollableColumnsToRender: propTypes.columns,
    scrollableLeafColumnsToRender: propTypes.columns,
    leftFixedColumnsWidth: PropTypes.number,
    scrollableColumnsWidth: PropTypes.number,
    rightFixedColumnsWidth: PropTypes.number,
    leftFixedColumnsUpdated: PropTypes.bool,
    scrollableColumnsUpdated: PropTypes.bool,
    rightFixedColumnsUpdated: PropTypes.bool,
    scrollableColumnsToRenderUpdated: PropTypes.bool,


    width: PropTypes.number,
    height: PropTypes.number,
    scrollbarSize: PropTypes.number,
  }

  shouldComponentUpdate(nextProps) {
    return shouldUpdateHeader(this.props, nextProps)
  }

  render() {
    const {
      prefixCls,
      width,
      height,
      showScrollbarX,
      showScrollbarY,
      scrollbarSize,
    } = this.props

    const rowProps = {
      ...this.props,
      offsetTop: 0,
      rowIndex: -1,
      isHeader: true,
    }

    return (
      <div className={`${prefixCls}-header`} style={{ width, height }}>
        <FlexiGridRow key="header-row" {...rowProps} />
        {
          showScrollbarX && showScrollbarY ? (
            <div
              className={`${prefixCls}-header-end-sapce`}
              style={{ width: scrollbarSize, height }}
            />
          ) : null
        }
      </div>
    )
  }
}
