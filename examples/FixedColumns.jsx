import React from 'react'
import FakeObjectDataListStore from './helpers/FakeObjectDataListStore'
import Avatar from './helpers/Avatar'
import FlexiGrid from '../lib/FlexiGrid'
import '../assets/flexigrid.css'

export default class FixedColumns extends React.Component {
  state = {
    data: new FakeObjectDataListStore(1000000),
  }

  render() {
    const columns = [
      {
        title: 'Index',
        dataIndex: 'id',
        width: 64,
        reorderable: false,
        resizable: false,
      },
      {
        title: 'Avatar',
        dataIndex: 'avatar',
        width: 64,
        align: 'center',
        render: ({ content }) => (<Avatar src={content} />),
        reorderable: false,
        resizable: false,
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
        fixed: 'left',
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
        title: 'Building',
        dataIndex: 'building',
        width: 120,
      },
      {
        title: 'Door No.',
        dataIndex: 'doorNo',
        width: 80,
      },
      {
        title: 'ZipCode',
        dataIndex: 'zipCode',
        width: 100,
      },
      {
        title: 'Job',
        dataIndex: 'job',
        width: 120,
        fixed: 'right',
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
        rowHeight={48}
        width={1200}
        height={500}
      />
    )
  }
}
