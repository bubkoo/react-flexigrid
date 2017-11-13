import PrefixIntervalTree from './struct/PrefixIntervalTree'
import { clamp } from './utils'

const BUFFER_ROWS = 5
const NO_ROWS_SCROLL_RESULT = {
  index: 0,
  offset: 0,
  position: 0,
  contentHeight: 0,
}


export default class FlexiGridScrollHelper {
  constructor(
    rowCount: Number,
    defaultRowHeight: Number,
    viewportHeight: Number,
    rowHeightGetter: ?Function,
    defaultSubRowHeight = 0,
    subRowHeightGetter: ?Function,
  ) {
    const defaultFullRowHeight = defaultRowHeight + defaultSubRowHeight
    this.rowOffsets = PrefixIntervalTree.uniform(rowCount, defaultFullRowHeight)
    this.cachedHeights = []
    for (let i = 0; i < rowCount; i += 1) {
      this.cachedHeights[i] = defaultFullRowHeight
    }
    this.position = 0
    this.rowCount = rowCount
    this.viewportHeight = viewportHeight
    this.contentHeight = rowCount * defaultFullRowHeight

    this.rowHeightGetter = rowHeightGetter
    this.subRowHeightGetter = subRowHeightGetter
    this.fullRowHeightGetter = (rowIndex) => {
      const rowHeight = this.rowHeightGetter
        ? this.rowHeightGetter(rowIndex)
        : defaultRowHeight
      const subRowHeight = this.subRowHeightGetter
        ? this.subRowHeightGetter(rowIndex)
        : defaultSubRowHeight
      return rowHeight + subRowHeight
    }

    this.updateHeightsInViewport(0, 0)
  }

  setRowHeightGetter(rowHeightGetter: Function) {
    this.rowHeightGetter = rowHeightGetter
  }

  setSubRowHeightGetter(subRowHeightGetter: Function) {
    this.subRowHeightGetter = subRowHeightGetter
  }

  setViewportHeight(viewportHeight: Number) {
    this.viewportHeight = viewportHeight
  }

  getContentHeight() {
    return this.contentHeight
  }

  updateHeightsInViewport(firstRowIndex: Number, firstRowOffset: Number) {
    let top = firstRowOffset
    let index = firstRowIndex
    while (top <= this.viewportHeight && index < this.rowCount) {
      this.updateRowHeight(index)
      top += this.cachedHeights[index]
      index += 1
    }
  }

  updateHeightsAboveViewport(firstRowIndex: Number) {
    let index = firstRowIndex - 1
    while (index >= 0 && index >= firstRowIndex - BUFFER_ROWS) {
      const delta = this.updateRowHeight(index)
      this.position += delta
      index -= 1
    }
  }

  updateRowHeight(rowIndex: Number) {
    if (rowIndex < 0 || rowIndex >= this.rowCount) {
      return 0
    }

    const newHeight = this.fullRowHeightGetter(rowIndex)
    if (newHeight !== this.cachedHeights[rowIndex]) {
      const delta = newHeight - this.cachedHeights[rowIndex]
      this.rowOffsets.set(rowIndex, newHeight)
      this.cachedHeights[rowIndex] = newHeight
      this.contentHeight += delta
      return delta
    }

    return 0
  }

  getRowPosition = (rowIndex: Number) => {
    this.updateRowHeight(rowIndex)
    return this.rowOffsets.sumUntil(rowIndex)
  }

  getRowAtEndPosition(rowIndex: Number) {
    // We need to update enough rows above the selected one to be sure that when
    // we scroll to selected position all rows between first shown and selected
    // one have most recent heights computed and will not resize
    this.updateRowHeight(rowIndex)
    let currentRowIndex = rowIndex
    let top = this.cachedHeights[currentRowIndex]
    while (top < this.viewportHeight && currentRowIndex >= 0) {
      currentRowIndex -= 1
      if (currentRowIndex >= 0) {
        this.updateRowHeight(currentRowIndex)
        top += this.cachedHeights[currentRowIndex]
      }
    }

    let position = this.rowOffsets.sumTo(rowIndex) - this.viewportHeight
    if (position < 0) {
      position = 0
    }

    return position
  }

  scrollTo(position) {
    if (this.rowCount === 0) {
      return NO_ROWS_SCROLL_RESULT
    }

    if (position <= 0) {
      // If position less than or equal to 0 first row
      // should be fully visible on top.
      this.position = 0
      this.updateHeightsInViewport(0, 0)

      return {
        index: 0,
        offset: 0,
        position: this.position,
        contentHeight: this.contentHeight,
      }
    } else if (position >= this.contentHeight - this.viewportHeight) {
      // If position is equal to or greater than max scroll value, we need
      // to make sure to have bottom border of last row visible.
      const rowIndex = this.rowCount - 1
      position = this.getRowAtEndPosition(rowIndex) // eslint-disable-line
    }

    this.position = position

    let firstRowIndex = this.rowOffsets.greatestLowerBound(position)
    firstRowIndex = clamp(firstRowIndex, 0, Math.max(this.rowCount - 1, 0))

    const firstRowPosition = this.rowOffsets.sumUntil(firstRowIndex)
    const firstRowOffset = firstRowPosition - position

    this.updateHeightsInViewport(firstRowIndex, firstRowOffset)
    this.updateHeightsAboveViewport(firstRowIndex)

    return {
      index: firstRowIndex,
      offset: firstRowOffset,
      position: this.position,
      contentHeight: this.contentHeight,
    }
  }

  scrollBy(delta) {
    if (this.rowCount === 0) {
      return NO_ROWS_SCROLL_RESULT
    }

    let firstRow = this.rowOffsets.greatestLowerBound(this.position)
    firstRow = clamp(firstRow, 0, Math.max(this.rowCount - 1, 0))
    let firstRowPosition = this.rowOffsets.sumUntil(firstRow)
    let rowIndex = firstRow
    let position = this.position

    const rowHeightChange = this.updateRowHeight(rowIndex)
    if (firstRowPosition !== 0) {
      position += rowHeightChange
    }
    let visibleRowHeight = this.cachedHeights[rowIndex] - (position - firstRowPosition)

    if (delta >= 0) {
      while (delta > 0 && rowIndex < this.rowCount) {
        if (delta < visibleRowHeight) {
          position += delta
          delta = 0 // eslint-disable-line
        } else {
          delta -= visibleRowHeight // eslint-disable-line
          position += visibleRowHeight
          rowIndex += 1
        }
        if (rowIndex < this.rowCount) {
          this.updateRowHeight(rowIndex)
          visibleRowHeight = this.cachedHeights[rowIndex]
        }
      }
    } else if (delta < 0) {
      delta = -delta // eslint-disable-line
      let invisibleRowHeight = this.cachedHeights[rowIndex] - visibleRowHeight

      while (delta > 0 && rowIndex >= 0) {
        if (delta < invisibleRowHeight) {
          position -= delta
          delta = 0 // eslint-disable-line
        } else {
          position -= invisibleRowHeight
          delta -= invisibleRowHeight // eslint-disable-line
          rowIndex -= 1
        }
        if (rowIndex >= 0) {
          const change = this.updateRowHeight(rowIndex)
          invisibleRowHeight = this.cachedHeights[rowIndex]
          position += change
        }
      }
    }

    const maxPosition = this.contentHeight - this.viewportHeight
    position = clamp(position, 0, maxPosition)
    this.position = position
    let firstRowIndex = this.rowOffsets.greatestLowerBound(position)
    firstRowIndex = clamp(firstRowIndex, 0, Math.max(this.rowCount - 1, 0))
    firstRowPosition = this.rowOffsets.sumUntil(firstRowIndex)
    const firstRowOffset = firstRowPosition - position

    this.updateHeightsInViewport(firstRowIndex, firstRowOffset)
    this.updateHeightsAboveViewport(firstRowIndex)

    return {
      index: firstRowIndex,
      offset: firstRowOffset,
      position: this.position,
      contentHeight: this.contentHeight,
    }
  }

  /**
   * Allows to scroll to selected row with specified offset. It always
   * brings that row to top of viewport with that offset
   */
  scrollToRow(rowIndex, offset) {
    rowIndex = clamp(rowIndex, 0, Math.max(this.rowCount - 1, 0)) // eslint-disable-line
    offset = clamp(offset, -this.cachedHeights[rowIndex], 0)      // eslint-disable-line
    const firstRow = this.rowOffsets.sumUntil(rowIndex)
    return this.scrollTo(firstRow - offset)
  }

  /**
   * Allows to scroll to selected row by bringing it to viewport with minimal
   * scrolling. This that if row is fully visible, scroll will not be changed.
   * If top border of row is above top of viewport it will be scrolled to be
   * fully visible on the top of viewport. If the bottom border of row is
   * below end of viewport, it will be scrolled up to be fully visible on the
   * bottom of viewport.
   */
  scrollRowIntoView(rowIndex) {
    rowIndex = clamp(rowIndex, 0, Math.max(this.rowCount - 1, 0)) // eslint-disable-line
    this.updateRowHeight(rowIndex)
    const rowBegin = this.rowOffsets.sumUntil(rowIndex)
    const rowEnd = rowBegin + this.cachedHeights[rowIndex]
    if (rowBegin < this.position) {
      return this.scrollTo(rowBegin)
    } else if (this.position + this.viewportHeight < rowEnd) {
      const position = this.getRowAtEndPosition(rowIndex)
      return this.scrollTo(position)
    }
    return this.scrollTo(this.position)
  }
}
