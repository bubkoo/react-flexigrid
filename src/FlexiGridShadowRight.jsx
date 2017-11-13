import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { shallowEqual } from './utils'

export default class FlexiGridShadowRight extends React.Component {
  static propTypes = {
    prefixCls: PropTypes.string.isRequired,
    visible: PropTypes.bool.isRequired,
    display: PropTypes.bool.isRequired,
    height: PropTypes.number.isRequired,
    right: PropTypes.number.isRequired,
  }

  shouldComponentUpdate(nextProps) {
    return !shallowEqual(this.props, nextProps)
  }

  render() {
    if (this.props.display) {
      const className = classNames(`${this.props.prefixCls}-shadow`, 'right', {
        visible: this.props.visible,
      })
      const style = {
        height: this.props.height,
        right: this.props.right,
      }
      return (<div className={className} style={style} />)
    }
    return null
  }
}
