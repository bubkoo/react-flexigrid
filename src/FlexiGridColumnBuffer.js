import IntegerBufferSet from './struct/IntegerBufferSet'


export default class FlexiGridColumnBuffer {
  constructor(
    columnCount: Number,
    viewportWidth: Number,
    getColumnWidth: Function,
    bufferColumnCount: ?Number,
  ) {
    this.bufferSet = new IntegerBufferSet()
    this.columnCount = columnCount
    this.viewportWidth = viewportWidth
    this.getColumnWidth = getColumnWidth
    this.bufferColumnCount = bufferColumnCount > 0 ? bufferColumnCount : 2
    this.viewportStartIndex = 0
    this.viewportEndIndex = 0

    this.columns = []
  }

  getColumnsWithUpdatedBuffer() {
    let remainingBufferColumns = 2 * this.bufferColumnCount
    let bufferColumnIndex = Math.max(this.viewportStartIndex - this.bufferColumnCount, 0)

    while (bufferColumnIndex < this.viewportStartIndex) {
      this.addColumnToBuffer(
        bufferColumnIndex,
        this.viewportStartIndex,
        this.viewportEndIndex - 1,
      )
      bufferColumnIndex += 1
      remainingBufferColumns -= 1
    }

    bufferColumnIndex = this.viewportEndIndex
    while (bufferColumnIndex < this.columnCount && remainingBufferColumns > 0) {
      this.addColumnToBuffer(
        bufferColumnIndex,
        this.viewportStartIndex,
        this.viewportEndIndex - 1,
      )
      bufferColumnIndex += 1
      remainingBufferColumns -= 1
    }

    return this.columns
  }

  getLastVisibleColumnIndex(firstColumnIndex, firstColumnOffset) {
    let endIndex = firstColumnIndex
    let totalWidth = firstColumnOffset

    while (totalWidth < this.viewportWidth && endIndex < this.columnCount) {
      totalWidth += this.getColumnWidth(endIndex)
      endIndex += 1
    }

    return Math.min(endIndex, this.columnCount)
  }

  getColumns(firstColumnIndex, firstColumnOffset) {
    let columnIndex = firstColumnIndex
    let totalWidth = firstColumnOffset
    const endIndex = this.getLastVisibleColumnIndex(firstColumnIndex, firstColumnOffset)

    this.viewportStartIndex = firstColumnIndex

    while (columnIndex < endIndex ||
      (totalWidth < this.viewportWidth && columnIndex < this.columnCount)
    ) {
      this.addColumnToBuffer(columnIndex, firstColumnIndex, endIndex - 1)
      totalWidth += this.getColumnWidth(columnIndex)
      columnIndex += 1
    }

    // Store index after the last viewport column as end, to be able to
    // distinguish when there are no columns rendered in viewport
    this.viewportEndIndex = columnIndex

    return this.columns.slice().sort((a, b) => a - b)
  }

  addColumnToBuffer(columnIndex, startColumnIndex, endColumnIndex) {
    let columnPosition = this.bufferSet.getPositionForValue(columnIndex)
    const viewportColumnCount = endColumnIndex - startColumnIndex
    const allowedColumnCount = viewportColumnCount + this.bufferColumnCount * 2

    if (columnPosition === null && this.bufferSet.getSize() >= allowedColumnCount) {
      columnPosition = this.bufferSet.replaceFurthestValuePosition(
        startColumnIndex,
        endColumnIndex,
        columnIndex,
      )
    }

    if (columnPosition === null) {
      columnPosition = this.bufferSet.getNewPositionForValue(columnIndex)
      this.columns[columnPosition] = columnIndex
    } else {
      this.columns[columnPosition] = columnIndex
    }
  }
}
