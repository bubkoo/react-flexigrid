import PrefixIntervalTree from './struct/PrefixIntervalTree'
import { clamp } from './utils'

const BUFFER_COLUMNS = 5
const NO_COLUMNS_SCROLL_RESULT = {
  index: 0,
  offset: 0,
  position: 0,
  contentWidth: 0,
}

export default class FlexiGridHorizontalScrollHelper {
  constructor(
    columnCount: Number,
    viewportWidth: Number,
    getColumnWidth: Function,
  ) {
    this.columnCount = columnCount
    this.viewportWidth = viewportWidth
    this.getColumnWidth = getColumnWidth

    this.cachedWidths = []
    for (let i = 0; i < this.columnCount; i += 1) {
      this.cachedWidths[i] = this.getColumnWidth(i)
    }

    this.columnOffsets = new PrefixIntervalTree(this.cachedWidths)
    this.contentWidth = this.cachedWidths.reduce((memo, width) => memo + width, 0)
    this.position = 0

    this.updateWidthsInViewport(0, 0)
  }

  setViewportWidth(viewportWidth: Number) {
    this.viewportWidth = viewportWidth
  }

  setColumnWidthGetter(getColumnWidth: Function) {
    this.getColumnWidth = getColumnWidth
  }

  getContentWidth() {
    return this.contentWidth
  }

  updateWidthsInViewport(firstColumnIndex: Number, firstColumnOffset: Number) {
    let width = firstColumnOffset
    let index = firstColumnIndex
    while (width <= this.viewportWidth && index < this.columnCount) {
      this.updateColumnWidth(index)
      width += this.cachedWidths[index]
      index += 1
    }
  }

  updateWidthsLeftViewport(firstColumnIndex: Number) {
    let index = firstColumnIndex - 1
    while (index >= 0 && index >= firstColumnIndex - BUFFER_COLUMNS) {
      const delta = this.updateColumnWidth(index)
      this.position += delta
      index -= 1
    }
  }

  updateColumnWidth(columnIndex: Number) {
    if (columnIndex < 0 || columnIndex >= this.columnCount) {
      return 0
    }

    const oldWidth = this.cachedWidths[columnIndex]
    const newWidth = this.getColumnWidth(columnIndex)
    if (newWidth !== oldWidth) {
      const delta = newWidth - oldWidth
      this.columnOffsets.set(columnIndex, newWidth)
      this.cachedWidths[columnIndex] = newWidth
      this.contentWidth += delta
      return delta
    }

    return 0
  }

  getColumnPosition = (columnIndex: Number) => {
    this.updateColumnWidth(columnIndex)
    return this.columnOffsets.sumUntil(columnIndex)
  }

  getColumnAtEndPosition(columnIndex: Number) {
    this.updateColumnWidth(columnIndex)
    let currentColumnIndex = columnIndex
    let width = this.cachedWidths[currentColumnIndex]
    while (width < this.viewportWidth && currentColumnIndex >= 0) {
      currentColumnIndex -= 1
      if (currentColumnIndex >= 0) {
        this.updateColumnWidth(currentColumnIndex)
        width += this.cachedWidths[currentColumnIndex]
      }
    }

    let position = this.columnOffsets.sumTo(columnIndex) - this.viewportWidth
    if (position < 0) {
      position = 0
    }

    return position
  }

  scrollTo(position) {
    if (this.columnCount === 0) {
      return NO_COLUMNS_SCROLL_RESULT
    }

    if (position <= 0) {
      // If position less than or equal to 0
      // first column should be fully visible on left.
      this.position = 0
      this.updateWidthsInViewport(0, 0)

      return {
        index: 0,
        offset: 0,
        position: this.position,
        contentWidth: this.contentWidth,
      }
    } else if (position >= this.contentWidth - this.viewportWidth) {
      // If position is equal to or greater than max scroll value, we need
      // to make sure to have bottom border of last column visible.
      const columnIndex = this.columnCount - 1
      position = this.getColumnAtEndPosition(columnIndex) // eslint-disable-line
    }

    this.position = position

    let firstColumnIndex = this.columnOffsets.greatestLowerBound(position)
    firstColumnIndex = clamp(firstColumnIndex, 0, Math.max(this.columnCount - 1, 0))

    const firstColumnPosition = this.columnOffsets.sumUntil(firstColumnIndex)
    const firstColumnOffset = firstColumnPosition - this.position

    this.updateWidthsInViewport(firstColumnIndex, firstColumnOffset)
    this.updateWidthsLeftViewport(firstColumnIndex)

    return {
      index: firstColumnIndex,
      offset: firstColumnOffset,
      position: this.position,
      contentWidth: this.contentWidth,
    }
  }

  scrollBy(delta) {
    if (this.columnCount === 0) {
      return NO_COLUMNS_SCROLL_RESULT
    }

    let firstColumnIndex = this.columnOffsets.greatestLowerBound(this.position)
    firstColumnIndex = clamp(firstColumnIndex, 0, Math.max(this.columnCount - 1, 0))
    let firstColumnPosition = this.columnOffsets.sumUntil(firstColumnIndex)
    let columnIndex = firstColumnIndex
    let position = this.position

    const columnWidthChange = this.updateColumnWidth(columnIndex)
    if (firstColumnPosition !== 0) {
      position += columnWidthChange
    }
    let visibleColumnWidth = this.cachedWidths[columnIndex] - (position - firstColumnPosition)

    if (delta >= 0) {
      while (delta > 0 && columnIndex < this.columnCount) {
        if (delta < visibleColumnWidth) {
          position += delta
          delta = 0 // eslint-disable-line
        } else {
          delta -= visibleColumnWidth // eslint-disable-line
          position += visibleColumnWidth
          columnIndex += 1
        }
        if (columnIndex < this.columnCount) {
          this.updateColumnWidth(columnIndex)
          visibleColumnWidth = this.cachedWidths[columnIndex]
        }
      }
    } else if (delta < 0) {
      delta = -delta // eslint-disable-line
      let invisibleColumnWidth = this.cachedWidths[columnIndex] - visibleColumnWidth

      while (delta > 0 && columnIndex >= 0) {
        if (delta < invisibleColumnWidth) {
          position -= delta
          delta = 0 // eslint-disable-line
        } else {
          position -= invisibleColumnWidth
          delta -= invisibleColumnWidth // eslint-disable-line
          columnIndex -= 1
        }
        if (columnIndex >= 0) {
          const change = this.updateColumnWidth(columnIndex)
          invisibleColumnWidth = this.cachedWidths[columnIndex]
          position += change
        }
      }
    }

    const maxPosition = this.contentWidth - this.viewportWidth
    position = clamp(position, 0, maxPosition)
    this.position = position
    firstColumnIndex = this.columnOffsets.greatestLowerBound(position)
    firstColumnIndex = clamp(firstColumnIndex, 0, Math.max(this.columnCount - 1, 0))
    firstColumnPosition = this.columnOffsets.sumUntil(firstColumnIndex)
    const firstColumnOffset = firstColumnPosition - position

    this.updateWidthsInViewport(firstColumnIndex, firstColumnOffset)
    this.updateWidthsLeftViewport(firstColumnIndex)

    return {
      index: firstColumnIndex,
      offset: firstColumnOffset,
      position: this.position,
      contentWidth: this.contentWidth,
    }
  }

  scrollToColumn(columnIndex, offset = 0) {
    const targetIndex = clamp(columnIndex, 0, Math.max(this.columnCount - 1, 0))
    const targetOffset = clamp(offset, -this.cachedWidths[targetIndex], 0)
    const position = this.columnOffsets.sumUntil(targetIndex)
    return this.scrollTo(position - targetOffset)
  }

  scrollColumnIntoView(columnIndex) {
    const targetIndex = clamp(columnIndex, 0, Math.max(this.columnCount - 1, 0))
    this.updateColumnWidth(targetIndex)
    const startPosition = this.columnOffsets.sumUntil(targetIndex)
    const endPosition = startPosition + this.cachedWidths[targetIndex]

    if (startPosition < this.position) {
      return this.scrollTo(startPosition)
    } else if (this.position + this.viewportWidth < endPosition) {
      const position = this.getColumnAtEndPosition(targetIndex)
      return this.scrollTo(position)
    }

    return this.scrollTo(this.position)
  }
}
