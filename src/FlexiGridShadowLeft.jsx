import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { shallowEqual } from './utils'

export default class FlexiGridShadowLeft extends React.Component {
  static propTypes = {
    prefixCls: PropTypes.string.isRequired,
    visible: PropTypes.bool.isRequired,
    display: PropTypes.bool.isRequired,
    height: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
  }

  shouldComponentUpdate(nextProps) {
    return !shallowEqual(this.props, nextProps)
  }

  render() {
    if (this.props.display) {
      const className = classNames(`${this.props.prefixCls}-shadow`, 'left', {
        visible: this.props.visible,
      })
      const style = {
        height: this.props.height,
        left: this.props.left,
      }
      return (<div className={className} style={style} />)
    }

    return null
  }
}
