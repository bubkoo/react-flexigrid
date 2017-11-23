import React from 'react'
import FakeObjectDataListStore from './helpers/FakeObjectDataListStore'
import FlexiGrid from '../lib/FlexiGrid'
import '../assets/flexigrid.css'

export default class ObjectData extends React.Component {
  state = {
    data: new FakeObjectDataListStore(1000000),
  }

  render() {
    const columns = [
      {
        title: 'Index',
        dataIndex: 'id',
        width: 64,
        resizable: false,
      },
      {
        title: 'FirstName',
        dataIndex: 'firstName',
        minWidth: 80,
        width: 120,
      },
      {
        title: 'LastName',
        dataIndex: 'lastName',
        minWidth: 80,
        width: 120,
      },
      {
        title: 'CompanyName',
        dataIndex: 'companyName',
        minWidth: 80,
        maxWidth: 320,
        width: 160,
      },
      {
        title: 'CompanyAddress',
        dataIndex: 'catchPhrase',
        width: 240,
      },
    ]

    return (
      <FlexiGrid
        rowKey={'id'}
        data={this.state.data}
        columns={columns}
        bordered
        resizable
        onColumnResize={(columnKey, columnWidth) => { console.log(`Column '${columnKey}' start resize, current width: ${columnWidth}px`) }}
        onColumnResizing={(columnKey, columnWidth) => { console.log(`Column '${columnKey}' resizing, current width: ${columnWidth}px`) }}
        onColumnResized={(columnKey, columnWidth) => { console.log(`Column '${columnKey}' stop resize, current width: ${columnWidth}px`) }}
        width={1200}
        height={500}
      />
    )
  }
}
