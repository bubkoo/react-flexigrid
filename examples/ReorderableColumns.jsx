import React from 'react'
import FakeObjectDataListStore from './helpers/FakeObjectDataListStore'
import FlexiGrid from '../src/FlexiGrid'
import '../assets/flexigrid.css'

export default class ReorderableColumns extends React.Component {
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
        reorderable: false,
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
      {
        title: 'Phone',
        dataIndex: 'phone',
        width: 160,
      },
      {
        title: 'City',
        dataIndex: 'city',
        width: 160,
      },
      {
        title: 'Street',
        dataIndex: 'street',
        width: 160,
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
        reorderable
        resizable
        width={1200}
        height={500}
      />
    )
  }
}
