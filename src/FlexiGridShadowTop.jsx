import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { shallowEqual } from './utils'

export default class FlexiGridShadowTop extends React.Component {
  static propTypes = {
    prefixCls: PropTypes.string.isRequired,
    display: PropTypes.bool.isRequired,
    visible: PropTypes.bool.isRequired,
    width: PropTypes.number.isRequired,
    top: PropTypes.number.isRequired,
  }

  shouldComponentUpdate(nextProps) {
    return !shallowEqual(this.props, nextProps)
  }

  render() {
    if (this.props.display) {
      const className = classNames(`${this.props.prefixCls}-shadow`, 'top', {
        visible: this.props.visible,
      })
      const style = {
        width: this.props.width,
        top: this.props.top,
      }

      return (<div className={className} style={style} />)
    }

    return null
  }
}
