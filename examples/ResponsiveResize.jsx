import React from 'react'
import Dimensions from 'react-dimensions' // eslint-disable-line
import FakeObjectDataListStore from './helpers/FakeObjectDataListStore'
import FlexiGrid from '../lib/FlexiGrid'
import '../assets/flexigrid.css'

class ResponsiveResize extends React.Component {
  state = {
    data: new FakeObjectDataListStore(1000000),
  }

  render() {
    const { containerHeight, containerWidth } = this.props
    const columns = [
      {
        title: 'Index',
        dataIndex: 'id',
        width: 64,
      },
      {
        title: 'FirstName',
        dataIndex: 'firstName',
        width: 100,
      },
      {
        title: 'LastName',
        dataIndex: 'lastName',
        width: 100,
      },
      {
        title: 'Age',
        dataIndex: 'age',
        width: 64,
        align: 'right',
      },
      {
        title: 'Email',
        dataIndex: 'email',
        width: 220,
      },
    ]
    return (
      <FlexiGrid
        rowKey={'id'}
        data={this.state.data}
        columns={columns}
        bordered
        rowHeight={48}
        width={containerWidth}
        height={containerHeight}
      />
    )
  }
}

export default Dimensions({
  getHeight() {
    return window.innerHeight - 200
  },
  getWidth() {
    const widthOffset = window.innerWidth < 680 ? 0 : 240
    return window.innerWidth - widthOffset
  },
})(ResponsiveResize)
