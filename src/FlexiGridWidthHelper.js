import React from 'react'

function getTotalWidth(columns: Array): Number {
  let totalWidth = 0
  for (let i = 0; i < columns.length; i += 1) {
    totalWidth += columns[i].props.width
  }
  return totalWidth
}

function getTotalFlexGrow(columns: Array): Number {
  let totalFlexGrow = 0
  for (let i = 0; i < columns.length; i += 1) {
    totalFlexGrow += columns[i].props.flexGrow || 0
  }
  return totalFlexGrow
}

function distributeFlexWidth(columns: Array, flexWidth: Number): Object {
  if (flexWidth <= 0) {
    return {
      columns,
      width: getTotalWidth(columns),
    }
  }
  let remainingFlexGrow = getTotalFlexGrow(columns)
  let remainingFlexWidth = flexWidth
  const newColumns = []
  let totalWidth = 0
  for (let i = 0; i < columns.length; i += 1) {
    const column = columns[i]
    if (!column.props.flexGrow) {
      totalWidth += column.props.width
      newColumns.push(column)
    } else {
      const columnFlexWidth = Math.floor(
        column.props.flexGrow / remainingFlexGrow * remainingFlexWidth,
      )
      const newColumnWidth = Math.floor(column.props.width + columnFlexWidth)
      totalWidth += newColumnWidth

      remainingFlexGrow -= column.props.flexGrow
      remainingFlexWidth -= columnFlexWidth

      newColumns.push(React.cloneElement(
        column,
        { width: newColumnWidth },
      ))
    }
  }

  return {
    columns: newColumns,
    width: totalWidth,
  }
}

function adjustColumnGroupWidths(columnGroups: Array, expectedWidth: Number): Object {
  const allColumns = []
  let i
  for (i = 0; i < columnGroups.length; i += 1) {
    React.Children.forEach(
      columnGroups[i].props.children,
      (column) => {
        allColumns.push(column)
      },
    )
  }
  const columnsWidth = getTotalWidth(allColumns)
  let remainingFlexGrow = getTotalFlexGrow(allColumns)
  let remainingFlexWidth = Math.max(expectedWidth - columnsWidth, 0)

  const newAllColumns = []
  const newColumnGroups = []

  for (i = 0; i < columnGroups.length; i += 1) {
    const columnGroup = columnGroups[i]
    const currentColumns = []

    React.Children.forEach(
      columnGroup.props.children,
      (column) => {
        currentColumns.push(column)
      },
    )

    const columnGroupFlexGrow = getTotalFlexGrow(currentColumns)
    const columnGroupFlexWidth = Math.floor(
      columnGroupFlexGrow / remainingFlexGrow * remainingFlexWidth,
    )

    const newColumnSettings = distributeFlexWidth(
      currentColumns,
      columnGroupFlexWidth,
    )

    remainingFlexGrow -= columnGroupFlexGrow
    remainingFlexWidth -= columnGroupFlexWidth

    for (let j = 0; j < newColumnSettings.columns.length; j += 1) {
      newAllColumns.push(newColumnSettings.columns[j])
    }

    newColumnGroups.push(React.cloneElement(
      columnGroup,
      { width: newColumnSettings.width },
    ))
  }

  return {
    columns: newAllColumns,
    columnGroups: newColumnGroups,
  }
}

function adjustColumnWidths(columns: Array, expectedWidth: Number): Array {
  const columnsWidth = getTotalWidth(columns)
  if (columnsWidth < expectedWidth) {
    return distributeFlexWidth(columns, expectedWidth - columnsWidth).columns
  }
  return columns
}

module.exports = {
  getTotalWidth,
  getTotalFlexGrow,
  distributeFlexWidth,
  adjustColumnWidths,
  adjustColumnGroupWidths,
}
