export function getColumnsWidth(columns: Array): Number {
  return columns.reduce((memo, column) => memo + column.width, 0)
}

function getColumnsFixed(columns: Array) {
  let fixed = false

  columns.some((column) => {
    if (column.fixed) {
      fixed = column.fixed
      return true
    }
    return false
  })

  return fixed
}

function getLeftFixedEndIndex(columns: Array): Number {
  // get index of the last left fixed column
  for (let i = columns.length - 1; i >= 0; i -= 1) {
    const { fixed } = columns[i]
    if (fixed === true || fixed === 'left') {
      return i
    }
  }

  return -1
}

function getRightFixedStartIndex(columns: Array): Number {
  // get index of the first right fixed column
  for (let i = 0, l = columns.length; i < l; i += 1) {
    const { fixed } = columns[i]
    if (fixed === 'right') {
      return i
    }
  }

  return -1
}

function colneColumns(
  columns: Array,
  widthMap = {},
  depth = 0,
  parent = null,
): Array {
  return columns.map(({ children, fixed, ...column }, index) => {
    column.depth = depth + 1

    if (children && children.length) {
      column.children = colneColumns(children, widthMap, column.depth, column)
      column.width = getColumnsWidth(column.children)
      // calc group key
      column.key = column.children.map(({ key }) => key).join('-')
      fixed = getColumnsFixed(column.children) // eslint-disable-line
    } else {
      // fix column key
      if (!column.key) {
        column.key = column.dataIndex
      }

      if (widthMap[column.key]) {
        column.width = widthMap[column.key]
      }
    }

    column.isLastLeaf = index === columns.length - 1
    column.isFirstLeaf = index === 0

    if (fixed) {
      column.fixed = fixed
    }

    if (parent) {
      column.parent = parent
    }

    return column
  })
}

function flattenColumns(columns: Array): Array {
  const cols = []
  columns.forEach((column) => {
    if (column.children && column.children.length) {
      cols.push(...flattenColumns(column.children))
    } else {
      cols.push(column)
    }
  })

  return cols
}

function finalCalc(columns: Array, left: Number, fixed: Boolean) {
  let offsetLeft = left
  columns.forEach((column) => {
    column.left = offsetLeft

    let current = column
    let parent = current.parent
    while (parent && current.isFirstLeaf) {
      parent.left = current.left
      current = parent
      parent = current.parent
    }

    if (fixed && fixed !== column.fixed) {
      column.fixed = fixed
      parent = column.parent
      while (parent) {
        parent.fixed = fixed
        parent = parent.parent
      }
    }

    offsetLeft += column.width
  })
}

function sortColumns(columns: Array, orderMap = {}): Array {
  let keys = Object.keys(orderMap)
  if (keys.length) {
    const orders = keys.map(key => orderMap[key])
    const cache = {}
    const result = []

    columns.forEach((column) => {
      const index = keys.indexOf(`${column.key}`)
      if (index >= 0) {
        cache[orders[index]] = column
        result.push(null)
      } else {
        result.push(column)
      }
    })

    Object.keys(cache).forEach((order) => {
      const column = cache[order]
      result[order] = column
      delete orderMap[column.key]
    })

    keys = Object.keys(orderMap)
    if (keys.length) {
      result.some((column) => {
        keys = Object.keys(orderMap)
        if (keys.length && column.children) {
          column.children = sortColumns(column.children, orderMap)
        }

        return keys.length === 0
      })
    }

    return result
  }

  return columns
}

export function parseColumns(
  columns: Array,
  {
    widthMap = {},
    orderMap = {},
  },
): Object {
  columns = colneColumns(columns, widthMap) // eslint-disable-line

  const leftFixedIndex = getLeftFixedEndIndex(columns)
  const rightFixedIndex = getRightFixedStartIndex(columns)

  let leftFixedColumns = leftFixedIndex >= 0
    ? columns.slice(0, leftFixedIndex + 1)
    : []
  let rightFixedColumns = rightFixedIndex > 0
    ? columns.slice(rightFixedIndex, columns.length)
    : []
  let scrollableColumns = columns.slice(
    leftFixedIndex >= 0 ? leftFixedIndex + 1 : 0,
    rightFixedIndex > 0 ? rightFixedIndex : columns.length,
  )

  const cachedOrderMap = { ...orderMap }
  leftFixedColumns = sortColumns(leftFixedColumns, cachedOrderMap)
  scrollableColumns = sortColumns(scrollableColumns, cachedOrderMap)
  rightFixedColumns = sortColumns(rightFixedColumns, cachedOrderMap)

  const leftFixedLeafColumns = flattenColumns(leftFixedColumns)
  const scrollableLeafColumns = flattenColumns(scrollableColumns)
  const rightFixedLeafColumns = flattenColumns(rightFixedColumns)

  finalCalc(leftFixedLeafColumns, 0, 'left')
  finalCalc(scrollableLeafColumns, getColumnsWidth(leftFixedColumns), null)
  finalCalc(rightFixedLeafColumns, 0, 'right')

  const depth = Math.max(
    Math.max(...leftFixedLeafColumns.map(column => column.depth)),
    Math.max(...scrollableLeafColumns.map(column => column.depth)),
    Math.max(...rightFixedLeafColumns.map(column => column.depth)),
  )

  return {
    columns,
    leftFixedColumns,
    scrollableColumns,
    rightFixedColumns,
    leftFixedLeafColumns,
    scrollableLeafColumns,
    rightFixedLeafColumns,
    leftFixedColumnsWidth: getColumnsWidth(leftFixedColumns),
    scrollableColumnsWidth: getColumnsWidth(scrollableColumns),
    rightFixedColumnsWidth: getColumnsWidth(rightFixedColumns),
    depth,
  }
}
