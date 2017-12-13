
export function getColumnsWidth(columns: Array): Number {
  return columns.reduce((memo, column) => memo + column.width, 0)
}

function getContentWidth(columns: Array): Number {
  return columns.reduce((memo, { children, width }) =>
    memo + (
      children && children.length
        ? getContentWidth(children)
        : width
    ), 0)
}

function getFlexGrowCount(columns: Array): Number {
  return columns.reduce((memo, { children, flexGrow }) =>
    memo + (
      children && children.length
        ? getFlexGrowCount(children)
        : flexGrow || 0
    ), 0)
}

function getFlexColumns(columns: Array): Array {
  const result = []

  columns.forEach((column) => {
    const { children, flexGrow } = column
    if (children && children.length) {
      result.push(...getFlexColumns(children))
    } else if (flexGrow) {
      result.push(column)
    }
  })

  return result
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

export function shrinkColumnsWidth(columnData, exceedWidth) {
  const {
    growCount,
    leftFixedLeafColumns,
    scrollableLeafColumns,
    rightFixedLeafColumns,
  } = columnData
  const columnCount =
    leftFixedLeafColumns.length +
    scrollableLeafColumns.length +
    rightFixedLeafColumns.length

  const divideEqually = growCount === 0
  const factor = exceedWidth / (divideEqually ? columnCount : growCount)

  const calc = (columns, unAssignedWidth, isLast) => {
    let assigned = 0
    let unassigned = unAssignedWidth
    const length = columns.length

    columns.forEach((column, index) => {
      const grow = divideEqually ? 1 : column.flexGrow
      let growWidth = Math.round(factor * grow)
      if (unassigned - growWidth < 0) {
        growWidth = unassigned
      }

      if (isLast && index === length - 1) {
        growWidth = unassigned
      }

      if (growWidth && unassigned) {
        assigned += growWidth
        unassigned -= growWidth

        column.width -= growWidth
        let parent = column.parent
        while (parent) {
          parent.width -= growWidth
          parent = parent.parent
        }
      }
    })

    return {
      assigned,
      unassigned,
    }
  }

  let { assigned, unassigned } = calc(
    leftFixedLeafColumns,
    exceedWidth,
    scrollableLeafColumns.length === 0 && rightFixedLeafColumns.length === 0,
  )

  if (assigned > 0) {
    columnData.leftFixedColumnsWidth -= assigned
  }
  if (unassigned > 0) {
    const ret = calc(scrollableLeafColumns, unassigned, rightFixedLeafColumns.length === 0)
    assigned = ret.assigned
    unassigned = ret.unassigned
  }

  if (assigned > 0) {
    columnData.scrollableColumnsWidth -= assigned
  }
  if (unassigned) {
    const ret = calc(rightFixedLeafColumns, unassigned, true)
    assigned = ret.assigned
  }

  if (assigned > 0) {
    columnData.rightFixedColumnsWidth -= assigned
  }
}

export function parseColumns(
  columns: Array,
  {
    widthMap = {},
    orderMap = {},
    viewportWidth,
  },
): Object {
  const contentWidth = getContentWidth(columns)
  const growCount = getFlexGrowCount(columns)
  if (contentWidth < viewportWidth && growCount) {
    const flexColumns = getFlexColumns(columns)
    let unsignedWidth = viewportWidth - contentWidth
    const factor = unsignedWidth / growCount
    const flexColumnsCount = flexColumns.length

    widthMap = { ...widthMap } // eslint-disable-line

    flexColumns.forEach(({ key, dataIndex, flexGrow, width }, index) => {
      const keey = key || dataIndex
      const addWidth = index === flexColumnsCount - 1
        ? unsignedWidth
        : Math.round(factor * flexGrow)

      unsignedWidth -= addWidth

      if (!widthMap[keey]) {
        widthMap[keey] = width + addWidth
      }
    })
  }

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
    growCount,
    depth,
  }
}
