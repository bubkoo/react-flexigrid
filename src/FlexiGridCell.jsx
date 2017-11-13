import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import propTypes from './struct/propTypes'
import { shallowEqual } from './utils'


export default class FlexiGridCell extends React.Component {
  static PROPTYPES_DISABLED_FOR_PERFORMANCE = {
    prefixCls: PropTypes.string,
    className: propTypes.className,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    minWidth: PropTypes.number,
    maxWidth: PropTypes.number,
    left: PropTypes.number,
    align: propTypes.align,
    rowIndex: PropTypes.number.isRequired,
    dataIndex: propTypes.columnKey,
    render: propTypes.render,
    record: propTypes.record,
  }

  shouldComponentUpdate(nextProps) {
    return !shallowEqual(this.props, nextProps)
  }

  renderContent() {
    const { prefixCls, height, width, dataIndex, rowIndex, record, render } = this.props

    let content = record && record[dataIndex]
    if (render) {
      if (React.isValidElement(render)) {
        content = React.cloneElement(render, {
          record,
          dataIndex,
          rowIndex,
        })
      } else if (typeof render === 'function') {
        content = render(content, record, rowIndex)
      } else {
        content = render
      }
    }

    return (
      <div className={`${prefixCls}-cell-wrap1`} style={{ width, height }}>
        <div className={`${prefixCls}-cell-wrap2`}>
          <div className={`${prefixCls}-cell-wrap3`}>
            <div className={`${prefixCls}-cell-content`} style={{ width }}>
              {content}
            </div>
          </div>
        </div>
      </div>
    )
  }

  render() {
    const { prefixCls, className, align, width, height, left } = this.props
    const cls = classNames({
      [`${prefixCls}-cell`]: true,
      'align-left': align === 'left' || align === undefined,
      'align-center': align === 'center',
      'align-right': align === 'right',
    }, className)

    return (
      <div className={cls} style={{ width, height, left }}>
        {this.renderContent()}
      </div >
    )
  }
}
