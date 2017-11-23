import React from 'react'
import PropTypes from 'prop-types'
import './Avatar.less'

const PendingPool = {}
const ReadyPool = {}
let imageIdCounter = 0

export default class Avatar extends React.Component {
  propTypes: {
    src: PropTypes.string.isRequired,
  }

  state = {
    ready: false,
  }

  componentWillMount() {
    imageIdCounter += 1

    this.componentId = imageIdCounter
    this.load(this.props.src)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.src !== this.props.src) {
      this.setState({ src: null })
      this.load(nextProps.src)
    }
  }

  componentWillUnmount() {
    const loadingPool = PendingPool[this.props.src]
    if (loadingPool) {
      delete loadingPool[this.componentId]
    }
  }


  onLoad = (src) => {
    ReadyPool[src] = true
    if (src === this.props.src) {
      this.setState({
        src,
      })
    }
  }

  load(src) {
    if (ReadyPool[src]) {
      this.setState({ src })
      return
    }

    if (PendingPool[src]) {
      PendingPool[src][this.componentId] = this.onLoad
      return
    }

    const callbackPool = {}
    PendingPool[src] = callbackPool
    callbackPool[this.componentId] = this.onLoad

    const img = new Image()
    img.onload = () => {
      Object.keys(callbackPool).forEach((componentId) => {
        callbackPool[componentId](src)
      })
      delete PendingPool[src]
      img.onload = null
    }

    img.src = src
  }

  render() {
    const style = this.state.src
      ? { backgroundImage: `url(${this.state.src})` }
      : null

    return <div className="example-img" style={style} />
  }
}
