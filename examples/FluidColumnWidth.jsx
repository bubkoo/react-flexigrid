import React from 'react'
import FakeObjectDataListStore from './helpers/FakeObjectDataListStore'
import FlexiGrid from '../src/FlexiGrid'
import '../assets/flexigrid.css'

export default class FluidColumnWidth extends React.Component {
  state = {
    data: new FakeObjectDataListStore(100000),
  }

  render() {
    const columns = [
      {
        title: 'FirstName',
        dataIndex: 'firstName',
        width: 160,
        fixed: 'left',
      },
      {
        title: 'Company(flexGrow greediness=1)',
        dataIndex: 'companyName',
        flexGrow: 1,
        width: 240,
      },
      {
        title: 'CatchPhrase(flexGrow greediness=2)',
        dataIndex: 'catchPhrase',
        flexGrow: 2,
        width: 320,
      },
      {
        title: 'LastName',
        dataIndex: 'lastName',
        width: 160,
      },
    ]
    return (
      <FlexiGrid
        rowKey={'id'}
        data={this.state.data}
        columns={columns}
        bordered
        reorderable
        resizable
        width={1200}
        height={500}
      />
    )
  }
}
