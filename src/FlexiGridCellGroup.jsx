import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import propTypes from './struct/propTypes'
import { translateDOMPosition } from './utils'
import { shouldUpdateCellGroup } from './FlexiGridUpdateHelper'
import FlexiGridCell from './FlexiGridCell'

const NO_RIGHT_BORDR = 'no-right-border'

export default class FlexiGridCellGroup extends React.Component {
  static PROPTYPES_DISABLED_FOR_PERFORMANCE = {
    prefixCls: PropTypes.string,
    className: propTypes.className,
    record: propTypes.record,
    width: PropTypes.number,
    height: PropTypes.number,
    left: PropTypes.number,
    zIndex: PropTypes.number,
    scrollX: PropTypes.number,
    isHeader: PropTypes.bool,
    rowIndex: PropTypes.number,
    rowHeight: PropTypes.number,
    columns: propTypes.columns,
    leafColumns: propTypes.columns,
    columnsUpdated: PropTypes.bool,
    fixLastColumn: PropTypes.bool,
  }

  componentWillMount() {
    this.initialRender = true
  }

  componentDidMount() {
    this.initialRender = false
  }

  shouldComponentUpdate(nextProps) {
    return shouldUpdateCellGroup(this.props, nextProps)
  }

  renderBodyCells() {
    const { prefixCls, height, leafColumns, record, fixLastColumn } = this.props
    let left = 0

    return leafColumns.map((column) => {
      const { width, key, dataIndex, render, rowIndex, isLastLeaf } = column
      const cellProps = {
        prefixCls,
        width,
        height,
        left,
        record,
        dataIndex,
        rowIndex,
        render,
      }

      if (fixLastColumn && isLastLeaf) {
        cellProps.className = NO_RIGHT_BORDR
      }

      left += width
      return <FlexiGridCell key={key} {...cellProps} />
    })
  }

  renderHeaderMergedCells(height, left, column) {
    const { prefixCls, rowHeight, fixLastColumn } = this.props
    const { children, width, title, align, isLastLeaf, key } = column
    const cellProps = {
      prefixCls,
      width,
      height: rowHeight,
      left: 0,
      align: align || 'center',
      render: title,
    }

    if (column.reorderable === false) {
      cellProps.className = 'unreorderable'
    }

    if (fixLastColumn && isLastLeaf) {
      cellProps.className = NO_RIGHT_BORDR
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
            height: height - rowHeight,
            top: rowHeight,
          }}
        >
          {
            this.renderHeaderCells({
              prefixCls,
              height: height - rowHeight,
              columns: children,
              fixLastColumn,
            })
          }
        </div>
      </div>
    )
  }

  renderHeaderCells(props = this.props) {
    const { prefixCls, height, columns, fixLastColumn } = props

    let left = 0

    return columns.map((column) => {
      const { children, width, title, key, isLastLeaf } = column
      let ret

      if (children && children.length) {
        ret = this.renderHeaderMergedCells(height, left, column)
      } else {
        const cellProps = {
          prefixCls,
          width,
          height,
          left,
          key,
          render: title,
          className: {
            unreorderable: column.reorderable === false,
          },
        }

        if (fixLastColumn && isLastLeaf) {
          cellProps.className[NO_RIGHT_BORDR] = true
        }

        ret = <FlexiGridCell {...cellProps} />
      }

      left += width

      return ret
    })
  }

  render() {
    const { prefixCls, className, width, height, left, zIndex, isHeader, scrollX } = this.props
    const wrapStyle = { width, height, left, zIndex }
    const innerStyle = { width, height }

    translateDOMPosition(innerStyle, -scrollX, 0, this.initialRender)

    return (
      <div
        className={`${prefixCls}-cells-group-wrap`}
        style={wrapStyle}
      >
        <div
          className={classNames(`${prefixCls}-cells-group`, className)}
          style={innerStyle}
        >
          {
            isHeader
              ? this.renderHeaderCells()
              : this.renderBodyCells()
          }
        </div>
      </div >
    )
  }
}
