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
    columnsToRender: propTypes.columns,
    leafColumnsToRender: propTypes.columns,
    columnsUpdated: PropTypes.bool,
    columnsToRenderUpdated: PropTypes.bool,
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
    const {
      prefixCls,
      height,
      leafColumns,
      leafColumnsToRender,
      record,
      rowIndex,
      fixLastColumn,
    } = this.props

    let left = 0

    return (leafColumnsToRender || leafColumns).map((column) => {
      const { width, key, dataIndex, render, align, offsetLeft, isLastLeaf } = column
      const cellProps = {
        prefixCls,
        width,
        height,
        left: offsetLeft !== undefined ? offsetLeft : left,
        record,
        dataIndex,
        rowIndex,
        align,
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
      className: classNames({
        unsortable: column.sortable === false,
        unreorderable: column.reorderable === false,
        [NO_RIGHT_BORDR]: fixLastColumn && isLastLeaf,
      }),
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
      const { children, width, title, key, isLastLeaf, align } = column
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
          align,
          render: title,
          className: {
            unsortable: column.sortable === false,
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
