import IntegerBufferSet from './struct/IntegerBufferSet'
import { clamp } from './utils'


const MIN_BUFFER_ROWS = 3
const MAX_BUFFER_ROWS = 6

export default class FlexiGridRowBuffer {
  constructor(
    rowCount: Number,
    defaultRowHeight: Number,
    viewportHeight: Number,
    rowHeightGetter: ?Function,
    bufferRowCount: ?Number,
  ) {
    this.rowCount = rowCount
    this.defaultRowHeight = defaultRowHeight
    this.viewportHeight = viewportHeight
    this.rowHeightGetter = rowHeightGetter
    this.bufferSet = new IntegerBufferSet()

    this.maxVisibleRowCount = Math.ceil(viewportHeight / defaultRowHeight) + 1
    this.bufferRowCount = bufferRowCount > 0
      ? bufferRowCount
      : clamp(Math.floor(this.maxVisibleRowCount / 2), MIN_BUFFER_ROWS, MAX_BUFFER_ROWS)
    this.viewportRowsBegin = 0
    this.viewportRowsEnd = 0
    this.rows = []
  }

  getRowsWithUpdatedBuffer() {
    let remainingBufferRows = 2 * this.bufferRowCount
    let bufferRowIndex = Math.max(this.viewportRowsBegin - this.bufferRowCount, 0)

    while (bufferRowIndex < this.viewportRowsBegin) {
      this.addRowToBuffer(
        bufferRowIndex,
        this.viewportRowsBegin,
        this.viewportRowsEnd - 1,
      )
      bufferRowIndex += 1
      remainingBufferRows -= 1
    }

    bufferRowIndex = this.viewportRowsEnd
    while (bufferRowIndex < this.rowCount && remainingBufferRows > 0) {
      this.addRowToBuffer(
        bufferRowIndex,
        this.viewportRowsBegin,
        this.viewportRowsEnd - 1,
      )
      bufferRowIndex += 1
      remainingBufferRows -= 1
    }

    return this.rows
  }

  getRows(firstRowIndex, firstRowOffset) {
    let rowIndex = firstRowIndex
    let totalHeight = firstRowOffset
    const endIndex = Math.min(firstRowIndex + this.maxVisibleRowCount, this.rowCount)

    this.viewportRowsBegin = firstRowIndex

    while (rowIndex < endIndex ||
      (totalHeight < this.viewportHeight && rowIndex < this.rowCount)) {
      this.addRowToBuffer(rowIndex, firstRowIndex, endIndex - 1)
      totalHeight += this.rowHeightGetter(rowIndex)
      rowIndex += 1
      // Store index after the last viewport row as end, to be able to
      // distinguish when there are no rows rendered in viewport
      this.viewportRowsEnd = rowIndex
    }

    return this.rows
  }

  addRowToBuffer(rowIndex, firstViewportRowIndex, lastViewportRowIndex) {
    let rowPosition = this.bufferSet.getPositionForValue(rowIndex)
    const viewportRowCount = lastViewportRowIndex - firstViewportRowIndex + 1
    const allowedRowCount = viewportRowCount + this.bufferRowCount * 2
    if (rowPosition === null && this.bufferSet.getSize() >= allowedRowCount) {
      rowPosition = this.bufferSet.replaceFurthestValuePosition(
        firstViewportRowIndex,
        lastViewportRowIndex,
        rowIndex,
      )
    }
    if (rowPosition === null) {
      // Can't reuse any of existing positions for this row.
      // So we have to create new position.
      rowPosition = this.bufferSet.getNewPositionForValue(rowIndex)
      this.rows[rowPosition] = rowIndex
    } else {
      // This row already is in the table with `rowPosition` position
      // or it can replace row that is in that position
      this.rows[rowPosition] = rowIndex
    }
  }
}
