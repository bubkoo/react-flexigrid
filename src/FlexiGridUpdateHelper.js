import { shallowEqual } from './utils'

export function shouldUpdateHeader(oldProps, nextProps) {
  const {
    leftFixedColumns: a,
    scrollableColumns: b,
    rightFixedColumns: c,
    leftFixedLeafColumns: d,
    scrollableLeafColumns: e,
    rightFixedLeafColumns: f,
    leftFixedColumnsWidth: g,
    scrollableColumnsWidth: h,
    rightFixedColumnsWidth: i,
    scrollableColumnsToRender: j,
    scrollableLeafColumnsToRender: k,
    ...oldOtherProps
  } = oldProps

  const {
    leftFixedColumns,
    scrollableColumns,
    rightFixedColumns,
    leftFixedLeafColumns,
    scrollableLeafColumns,
    rightFixedLeafColumns,
    leftFixedColumnsWidth,
    scrollableColumnsWidth,
    rightFixedColumnsWidth,
    scrollableColumnsToRender,
    scrollableLeafColumnsToRender,
    ...nextOtherProps
  } = nextProps

  return !shallowEqual(oldOtherProps, nextOtherProps)
}

export function shouldUpdateBody(oldProps, nextProps) {
  return shouldUpdateHeader(oldProps, nextProps)
}

export function shouldUpdateRow(oldProps, nextProps) {
  return shouldUpdateHeader(oldProps, nextProps)
}

export function shouldUpdateCellGroup(oldProps, nextProps) {
  const {
    columns: a,
    leafColumns: b,
    columnsToRender: c,
    leafColumnsToRender: d,
    ...oldOtherProps
  } = oldProps

  const {
    columns,
    leafColumns,
    columnsToRender,
    leafColumnsToRender,
    ...nextOtherProps
  } = nextProps

  return !shallowEqual(oldOtherProps, nextOtherProps)
}
