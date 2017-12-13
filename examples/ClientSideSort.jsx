import React from 'react'
import generateDataItem from './helpers/generateDataItem'
import Avatar from './helpers/Avatar'
import FlexiGrid from '../src/FlexiGrid'
import '../assets/flexigrid.css'

export default class ColumnGroups extends React.Component {
  constructor(props) {
    super(props)

    this.data = []

    for (let i = 0; i < 10000; i += 1) {
      this.data.push(generateDataItem(i + 1))
    }

    this.state = {
      data: this.data,
      sortType: null,
      sortColumnKey: null,
    }
  }


  handleSort = (column, type) => {
    if (this.state.sortColumnKey === column.key && this.state.sortType === type) {
      this.setState({
        data: this.data,
        sortType: null,
        sortColumnKey: null,
      })
    } else {
      const data = this.data.slice()
      data.sort((itemA, itemB) => {
        const valueA = itemA[column.dataIndex]
        const valueB = itemB[column.dataIndex]
        let sortVal = 0
        if (valueA > valueB) {
          sortVal = 1
        }
        if (valueA < valueB) {
          sortVal = -1
        }
        if (sortVal !== 0 && type === 'desc') {
          sortVal *= -1
        }

        return sortVal
      })

      this.setState({
        data,
        sortType: type,
        sortColumnKey: column.key,
      })
    }
  }

  render() {
    const columns = [
      {
        title: 'Index',
        dataIndex: 'id',
        width: 64,
        reorderable: false,
        resizable: false,
        sortable: false,
      },
      {
        title: 'Avatar',
        dataIndex: 'avatar',
        width: 64,
        align: 'center',
        render: ({ content }) => (<Avatar src={content} />),
        fixed: 'left',
        reorderable: false,
        resizable: false,
        sortable: false,
      },
      {
        title: 'Name',
        children: [
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
        ],
      },
      {
        title: 'Other',
        children: [
          {
            title: 'Age',
            dataIndex: 'age',
            width: 64,
            align: 'right',
          },
          {
            title: 'Address',
            children: [
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
                title: 'Block',
                children: [
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
                ],
              },
              {
                title: 'ZipCode',
                dataIndex: 'zipCode',
                width: 100,
              },
            ],
          },
        ],
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
        sortable
        sortType={this.state.sortType}
        sortColumnKey={this.state.sortColumnKey}
        onColumnSort={this.handleSort}
        rowHeight={48}
        width={1200}
        height={500}
      />
    )
  }
}
