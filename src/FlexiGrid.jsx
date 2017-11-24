/* eslint-disable react/require-default-props */

import React from 'react'
import PropTypes from 'prop-types'
import invariant from 'invariant'
import classNames from 'classnames'
import propTypes from './struct/propTypes'
import WheelHandler from './dom/WheelHandler'
import TouchHandler from './dom/TouchHandler'
import Scrollbar from './Scrollbar'
import VerticalScrollHelper from './FlexiGridVerticalScrollHelper'
import HorizontalScrollHelper from './FlexiGridHorizontalScrollHelper'
import FlexiGridColumnBuffer from './FlexiGridColumnBuffer'
import FlexiGridHeader from './FlexiGridHeader'
import FlexiGridBody from './FlexiGridBody'
import FlexiGridShadowTop from './FlexiGridShadowTop'
import FlexiGridShadowLeft from './FlexiGridShadowLeft'
import FlexiGridShadowRight from './FlexiGridShadowRight'
import FlexiGridShadowBottom from './FlexiGridShadowBottom'
import FlexiGridColumnResizeKnobs from './FlexiGridColumnResizeKnobs'
import FlexiGridColumnReorderKnobs from './FlexiGridColumnReorderKnobs'
import FlexiGridColumnResizeHandler from './FlexiGridColumnResizeHandler'
import FlexiGridColumnReorderHandler from './FlexiGridColumnReorderHandler'
import { debounce, clamp, deepEqual } from './utils'
import { getColumnsWidth, parseColumns } from './FlexiGridColumnHelper'


export default class FlexiGrid extends React.Component {
  static propTypes = {
    prefixCls: PropTypes.string,
    className: PropTypes.string,

    columns: propTypes.columns.isRequired,
    data: propTypes.data.isRequired,
    rowKey: PropTypes.string.isRequired,
    bufferRowCount: PropTypes.number,
    bufferColumnCount: PropTypes.number,

    bordered: PropTypes.bool,
    borderSize: PropTypes.number,

    width: PropTypes.number.isRequired,
    height: PropTypes.number,
    maxHeight: PropTypes.number,
    ownerHeight: PropTypes.number,
    footerHeight: PropTypes.number,
    rowHeight: PropTypes.number,
    headerRowHeight: PropTypes.number,
    subRowHeight: PropTypes.number,

    getRowHeight: PropTypes.func,
    getSubRowHeight: PropTypes.func,
    getRowClassName: PropTypes.func,

    subRow: propTypes.render,
    footer: propTypes.render,

    scrollTop: PropTypes.number,
    scrollLeft: PropTypes.number,
    scrollToColumn: PropTypes.number,
    scrollToRow: PropTypes.number,
    showScrollbarX: PropTypes.bool,
    showScrollbarY: PropTypes.bool,
    touchScrollEnabled: PropTypes.bool,

    onHorizontalScroll: PropTypes.func,
    onVerticalScroll: PropTypes.func,
    onScrollStart: PropTypes.func,
    onScrollEnd: PropTypes.func,
    stopScrollPropagation: PropTypes.bool,

    onContentHeightChange: PropTypes.func,

    onRowTouchStart: PropTypes.func,
    onRowTouchEnd: PropTypes.func,
    onRowTouchMove: PropTypes.func,

    onRowClick: PropTypes.func,
    onRowDoubleClick: PropTypes.func,
    onRowMouseDown: PropTypes.func,
    onRowMouseUp: PropTypes.func,
    onRowMouseEnter: PropTypes.func,
    onRowMouseLeave: PropTypes.func,

    resizable: PropTypes.bool,
    resizeKnobSize: PropTypes.number,
    onColumnResize: PropTypes.func,
    onColumnResizing: PropTypes.func,
    onColumnResized: PropTypes.func,

    reorderable: PropTypes.bool,
    reorderKnobSize: PropTypes.number,
    reorderFactor: PropTypes.number,
    dragScrollBuffer: PropTypes.number,
    dragScrollSpeed: PropTypes.number,
    onColumnReorder: PropTypes.func,
    onColumnReordering: PropTypes.func,
    onColumnReordered: PropTypes.func,
  }

  static defaultProps = {
    prefixCls: 'flexi-grid',
    rowHeight: 32,
    headerRowHeight: 32,
    subRowHeight: 0,
    footerHeight: 0,
    bordered: true,
    borderSize: 1,
    showScrollbarX: true,
    showScrollbarY: true,
    touchScrollEnabled: false,
    stopScrollPropagation: false,

    resizable: false,
    resizeKnobSize: 13,

    reorderable: false,
    reorderKnobSize: 12,
    reorderFactor: 3 / 4,
    dragScrollBuffer: 50,
    dragScrollSpeed: 15,
  }

  componentWillMount() {
    this.didScrollStop = debounce(this.didScrollStopSync, 200, this)
    this.wheelHandler = new WheelHandler(
      this.onScroll,
      this.shouldHandleWheelX,
      this.shouldHandleWheelY,
      this.props.stopScrollPropagation,
    )

    this.touchHandler = new TouchHandler(
      this.onScroll,
      this.shouldHandleTouchX,
      this.shouldHandleTouchY,
      this.props.stopScrollPropagation,
    )

    this.setNextState(this.calculateState(this.props))
  }

  componentDidMount() {
    this.reportContentHeight()
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.ownerHeight !== nextProps.ownerHeight ||
      this.props.scrollTop !== nextProps.scrollTop ||
      this.props.scrollLeft !== nextProps.scrollLeft) {
      this.didScrollStart()
    }

    this.didScrollStop.reset()
    this.didScrollStopSync()

    this.setNextState(this.calculateState(nextProps, this.state))
  }

  componentDidUpdate() {
    this.reportContentHeight()
  }

  componentWillUnmount() {
    this.wheelHandler = null
    this.touchHandler = null
    // cancel any pending debounced scroll handling and handle immediately
    this.didScrollStop.reset()
    this.didScrollStopSync()
  }

  onScroll = (deltaX, deltaY) => {
    if (!this.scrolling) {
      this.didScrollStart()
    }

    if (Math.abs(deltaY) > Math.abs(deltaX) && this.state.showScrollbarY) {
      this.doVerticalScroll(deltaY, true)
    } else if (deltaX && this.state.showScrollbarX) {
      this.doHorizontalScroll(deltaX, true)
    }

    this.didScrollStop()
  }

  onHorizontalScroll = (scrollX) => {
    if (scrollX === this.state.scrollX) {
      return
    }

    if (!this.scrolling) {
      this.didScrollStart()
    }

    this.doHorizontalScroll(scrollX, false)
    this.didScrollStop()
  }

  onVerticalScroll = (scrollY) => {
    if (scrollY === this.state.scrollY) {
      return
    }

    if (!this.scrolling) {
      this.didScrollStart()
    }

    this.doVerticalScroll(scrollY, false)
    this.didScrollStop()
  }

  doHorizontalScroll(scrollX, relative) { // eslint-disable-line
    const scrollState = relative
      ? this.horizontalScrollHelper.scrollBy(Math.round(scrollX))
      : this.horizontalScrollHelper.scrollTo(Math.round(scrollX))

    const onHorizontalScroll = this.props.onHorizontalScroll
    if (onHorizontalScroll) {
      onHorizontalScroll(scrollState.position)
    }

    const columnData = this.state.columnData
    const contentWidth = columnData.leftFixedColumnsWidth +
      columnData.rightFixedColumnsWidth +
      scrollState.contentWidth
    const maxScrollX = Math.max(0, contentWidth - this.state.bodyWidth)
    const scrollableColumnsToRender = this.columnBuffer.getColumns(
      scrollState.index,
      scrollState.offset,
    )

    this.setNextState({
      firstColumnIndex: scrollState.index,
      firstColumnOffset: scrollState.offset,
      scrollX: scrollState.position,
      maxScrollX,
      scrollableColumnsToRender,
    })
  }

  doVerticalScroll(scrollY, relative) { // eslint-disable-line
    const scrollState = relative
      ? this.verticalScrollHelper.scrollBy(Math.round(scrollY))
      : this.verticalScrollHelper.scrollTo(Math.round(scrollY))

    const onVerticalScroll = this.props.onVerticalScroll
    if (onVerticalScroll) {
      onVerticalScroll(scrollState.position)
    }

    const maxScrollY = Math.max(0, scrollState.contentHeight - this.state.bodyHeight)
    this.setNextState({
      firstRowIndex: scrollState.index,
      firstRowOffset: scrollState.offset,
      contentHeight: scrollState.contentHeight,
      scrollY: scrollState.position,
      maxScrollY,
    })
  }

  didScrollStart() { // eslint-disable-line
    if (this.scrolling) {
      return
    }

    this.scrolling = true
    if (this.props.onScrollStart) {
      this.props.onScrollStart(
        this.state.scrollX,
        this.state.scrollY,
        this.state.firstRowIndex,
      )
    }
  }

  didScrollStopSync() {
    if (!this.scrolling) {
      return
    }

    this.scrolling = false
    this.setNextState({ redraw: true })
    if (this.props.onScrollEnd) {
      this.props.onScrollEnd(
        this.state.scrollX,
        this.state.scrollY,
        this.state.firstRowIndex,
      )
    }
  }

  shouldHandleWheelX = (delta) => {
    if (!this.state.showScrollbarX || delta === 0) {
      return false
    }

    delta = Math.round(delta) // eslint-disable-line
    if (delta === 0) {
      return false
    }

    return (
      (delta < 0 && this.state.scrollX > 0) ||
      (delta >= 0 && this.state.scrollX < this.state.maxScrollX)
    )
  }

  shouldHandleWheelY = (delta) => {
    if (!this.state.showScrollbarY || delta === 0) {
      return false
    }

    delta = Math.round(delta) // eslint-disable-line
    if (delta === 0) {
      return false
    }

    return (
      (delta < 0 && this.state.scrollY > 0) ||
      (delta >= 0 && this.state.scrollY < this.state.maxScrollY)
    )
  }

  shouldHandleTouchX = delta => this.props.touchScrollEnabled && this.shouldHandleWheelX(delta)

  shouldHandleTouchY = delta => this.props.touchScrollEnabled && this.shouldHandleWheelY(delta)

  reportContentHeight() {
    const requiredHeight = this.state.contentHeight + this.state.reservedHeight

    let contentHeight
    if (this.state.useMaxHeight && this.props.maxHeight > requiredHeight) {
      contentHeight = requiredHeight
    } else if (this.state.height > requiredHeight && this.props.ownerHeight) {
      contentHeight = Math.max(requiredHeight, this.props.ownerHeight)
    } else {
      contentHeight = this.state.height + this.state.maxScrollY
    }

    if (contentHeight !== this.contentHeight && this.props.onContentHeightChange) {
      this.props.onContentHeightChange(contentHeight)
    }

    this.contentHeight = contentHeight
  }

  onColumnResize = ({ column, knobSize, left, top, rtl, adjustKnob }, e) => {
    const { headerHeight, bodyHeight } = this.state
    this.columnResizingData = {
      prefixCls: this.props.prefixCls,
      rtl,
      offsetLeft: left,
      offsetTop: top,
      knobSize,
      adjustKnob,
      initialWidth: column.width,
      height: headerHeight + bodyHeight,
      minWidth: column.minWidth || 0,
      maxWidth: column.maxWidth || Number.MAX_SAFE_INTEGER,
      columnKey: column.key,
      initialEvent: {
        clientX: e.clientX,
        clientY: e.clientY,
        preventDefault: () => { },
      },
      onColumnResizing: this.onColumnResizing,
      onColumnResized: this.onColumnResized,
    }

    if (this.props.onColumnResize) {
      this.props.onColumnResize(column.key, column.width)
    }

    this.setNextState({ columnResizingKey: column.key })
  }

  onColumnResizing = (columnWidth, columnKey) => {
    if (this.props.onColumnResizing) {
      this.props.onColumnResizing(columnKey, columnWidth)
    }
  }

  onColumnResized = (columnWidth, columnKey) => {
    if (this.props.onColumnResized) {
      this.props.onColumnResized(columnKey, columnWidth)
    }

    if (!this.columnWidthMap) {
      this.columnWidthMap = {}
    }

    this.columnWidthMap[columnKey] = columnWidth
    this.columnResizingData = null

    this.setNextState({
      ...this.calculateState(this.props, this.state),
      columnResizingKey: null,
    })
  }

  onColumnReorder = ({ column }, e) => {
    this.columnReorderingData = {
      column,
      initialEvent: {
        clientX: e.clientX,
        clientY: e.clientY,
        preventDefault: () => { },
      },
      onColumnReordering: this.onColumnReordering,
      onColumnReordered: this.onColumnReordered,
    }

    if (this.props.onColumnReorder) {
      this.props.onColumnReorder(column.key)
    }

    this.setNextState({ columnReorderingKey: column.key })
  }

  onColumnReordering = ({ targetKey, movingLeft, position }) => {
    const { column } = this.columnReorderingData
    if (!column.fixed) {
      const { dragScrollSpeed, dragScrollBuffer } = this.props
      const { bodyWidth, scrollX, maxScrollX, columnData } = this.state
      const { leftFixedColumns, rightFixedColumns } = columnData

      // auto scroll on moving
      let scrollTo = scrollX
      if (movingLeft) {
        if (
          scrollX > 0 &&
          position < getColumnsWidth(leftFixedColumns) + dragScrollBuffer
        ) {
          scrollTo = Math.max(scrollX - dragScrollSpeed, 0)
        }
      } else if (
        scrollX < maxScrollX &&
        position + column.width > bodyWidth - getColumnsWidth(rightFixedColumns) - dragScrollBuffer
      ) {
        scrollTo = Math.min(scrollX + dragScrollSpeed, maxScrollX)
      }

      if (scrollTo !== scrollX) {
        this.doHorizontalScroll(scrollTo, false)
      }
    }

    if (this.props.onColumnReordering) {
      this.props.onColumnReordering(column.key, targetKey)
    }
  }

  onColumnReordered = (targetColumnKey) => {
    if (!this.columnOrderMap) {
      this.columnOrderMap = {}
    }

    const { column } = this.columnReorderingData
    const siblings = this.getColumnSiblings(column)
    const sourceColumnKey = column.key

    siblings.forEach(({ key }, index) => {
      if (key === targetColumnKey) {
        this.columnOrderMap[sourceColumnKey] = index
      } else if (key === sourceColumnKey) {
        this.columnOrderMap[targetColumnKey] = index
      }
    })

    if (this.props.onColumnReordered) {
      this.props.onColumnReordered(sourceColumnKey, targetColumnKey)
    }

    if (
      this.props.onHorizontalScroll &&
      this.columnReorderingData.scrollX !== this.state.scrollX
    ) {
      this.props.onHorizontalScroll(this.state.scrollX)
    }

    this.setNextState({
      ...this.calculateState(this.props, this.state),
      columnReorderingKey: null,
    })

    this.columnReorderingData = null
  }

  isColumnResizing() {
    return this.state.columnResizingKey != null
  }

  isColumnReordering() {
    return this.state.columnReorderingKey != null
  }

  setNextState(nextState) {
    const oldColumnData = this.state && this.state.columnData
    const { scrollableColumnsToRender, columnData } = nextState

    let leftFixedColumnsUpdated = false
    let scrollableColumnsUpdated = false
    let rightFixedColumnsUpdated = false
    let scrollableColumnsToRenderUpdated = false

    if (columnData && oldColumnData) {
      leftFixedColumnsUpdated = !(
        columnData.leftFixedColumns === oldColumnData.leftFixedColumns ||
        deepEqual(columnData.leftFixedColumns, oldColumnData.leftFixedColumns)
      )

      scrollableColumnsUpdated = !(
        columnData.scrollableColumns === oldColumnData.scrollableColumns ||
        deepEqual(columnData.scrollableColumns, oldColumnData.scrollableColumns)
      )

      rightFixedColumnsUpdated = !(
        columnData.rightFixedColumns === oldColumnData.rightFixedColumns ||
        deepEqual(columnData.rightFixedColumns, oldColumnData.rightFixedColumns)
      )
    } else if (columnData && !oldColumnData) {
      leftFixedColumnsUpdated = true
      scrollableColumnsUpdated = true
      rightFixedColumnsUpdated = true
    }

    if (this.state) {
      scrollableColumnsToRenderUpdated = !(
        scrollableColumnsToRender === this.state.scrollableColumnsToRender ||
        deepEqual(scrollableColumnsToRender, this.state.scrollableColumnsToRender)
      )
    } else {
      scrollableColumnsToRenderUpdated = true
    }


    const state = {
      ...nextState,
      leftFixedColumnsUpdated,
      scrollableColumnsUpdated,
      rightFixedColumnsUpdated,
      scrollableColumnsToRenderUpdated,
    }

    if (scrollableColumnsToRender) {
      const scrollableLeafColumns = columnData
        ? columnData.scrollableLeafColumns
        : oldColumnData.scrollableLeafColumns

      const leafColumnsToRender = scrollableColumnsToRender.map(
        index => ({
          ...scrollableLeafColumns[index],
          offsetLeft: this.horizontalScrollHelper.getColumnPosition(index),
        }),
      )
      const parents = leafColumnsToRender.map((item) => {
        let result = item
        let parent = item.parent
        while (parent) {
          result = parent
          parent = result.parent
        }

        return result
      })

      const columnsToRender = []
      parents.forEach((item) => {
        if (!columnsToRender.includes(item)) {
          columnsToRender.push(item)
        }
      })

      state.scrollableColumnsToRender = columnsToRender
      state.scrollableLeafColumnsToRender = leafColumnsToRender
    }

    this.setState(state)
  }

  calculateState(props = this.props, oldState) {
    invariant(
      props.height !== undefined || props.maxHeight !== undefined,
      'Either height or maxHeight should be specified',
    )

    const borderSize = props.bordered ? props.borderSize : 0
    const reservedBorderSize = props.bordered ? 2 * borderSize : 0
    // the width of viewport includes scrollbars
    const viewportWidth = props.width - reservedBorderSize

    const columnConfig = {
      widthMap: this.columnWidthMap || {},
      orderMap: this.columnOrderMap || {},
      viewportWidth,
    }

    if (oldState) {
      columnConfig.resizingKey = oldState.columnResizingKey
      columnConfig.reorderingKey = oldState.columnReorderingKey
    }

    const columnData = parseColumns(props.columns, columnConfig)
    const rowCount = props.data.length
    const rowHeight = props.rowHeight
    const headerRowHeight = props.headerRowHeight

    const headerHeight = columnData.depth * headerRowHeight
    const useMaxHeight = props.height === undefined
    const realUseHeight = useMaxHeight ? props.maxHeight : props.height
    // the height of viewport includes scrollbars
    const viewportHeight = realUseHeight
      - (headerHeight || 0)
      - (props.footerHeight || 0)
      - reservedBorderSize

    let firstRowIndex = (oldState && oldState.firstRowIndex) || 0
    let firstRowOffset = (oldState && oldState.firstRowOffset) || 0
    let firstColumnIndex = (oldState && oldState.firstColumnIndex) || 0
    let firstColumnOffset = (oldState && oldState.firstColumnOffset) || 0
    let scrollX = oldState ? oldState.scrollX : 0
    let scrollY = oldState ? oldState.scrollY : 0

    if (!this.verticalScrollHelper) {
      this.verticalScrollHelper = new VerticalScrollHelper(
        rowCount,
        props.rowHeight,
        viewportHeight,
        props.getRowHeight,
        props.subRowHeight,
        props.getSubRowHeight,
      )
    }

    const oldViewportHeight = this.verticalScrollHelper.viewportHeight

    if (oldState && (
      rowCount !== oldState.rowCount ||
      props.rowHeight !== oldState.rowHeight ||
      props.height !== oldState.height
    )) {
      this.verticalScrollHelper = new VerticalScrollHelper(
        rowCount,
        props.rowHeight,
        viewportHeight,
        props.getRowHeight,
        props.subRowHeight,
        props.getSubRowHeight,
      )
      const scrollState = this.verticalScrollHelper.scrollToRow(firstRowIndex, firstRowOffset)
      scrollY = scrollState.position
      firstRowIndex = scrollState.index
      firstRowOffset = scrollState.offset
    } else if (oldState) {
      if (props.getRowHeight !== oldState.getRowHeight) {
        this.verticalScrollHelper.setRowHeightGetter(props.getRowHeight)
      }
      if (props.getSubRowHeight !== oldState.getSubRowHeight) {
        this.verticalScrollHelper.setSubRowHeightGetter(props.getSubRowHeight)
      }
    }

    // scrollToRow
    const oldScrollToRow = oldState ? oldState.scrollToRow : undefined
    if (props.scrollToRow !== undefined && (
      props.scrollToRow !== oldScrollToRow ||
      viewportHeight !== oldViewportHeight
    )) {
      const scrollState = this.verticalScrollHelper.scrollRowIntoView(props.scrollToRow)
      scrollY = scrollState.position
      firstRowIndex = scrollState.index
      firstRowOffset = scrollState.offset
    }

    // scrollTop
    const oldScrollTop = oldState ? oldState.scrollTop : undefined
    if (props.scrollTop !== undefined && props.scrollTop !== oldScrollTop) {
      const scrollState = this.verticalScrollHelper.scrollTo(props.scrollTop)
      scrollY = scrollState.position
      firstRowIndex = scrollState.index
      firstRowOffset = scrollState.offset
    }

    // size for content
    const contentWidth = getColumnsWidth(columnData.columns)
    const contentHeight = this.verticalScrollHelper.getContentHeight()
    const showScrollbarX = contentWidth > viewportWidth + borderSize
    const showScrollbarY = contentHeight > viewportHeight
    const reservedHeight = props.footerHeight
      + headerHeight
      + reservedBorderSize
      + (showScrollbarX ? Scrollbar.SIZE : 0)
    const requiredHeight = contentHeight + reservedHeight
    const reservedColumnWidth = columnData.leftFixedColumnsWidth + columnData.rightFixedColumnsWidth

    let height = Math.round(realUseHeight)
    if (useMaxHeight && !showScrollbarY) {
      height = requiredHeight
    }

    // body's size excludes scrollbars
    const bodyWidth = viewportWidth - (showScrollbarY ? Scrollbar.SIZE : 0)
    const bodyHeight = height - reservedHeight

    const maxScrollX = Math.max(0, contentWidth - bodyWidth)
    const maxScrollY = Math.max(0, contentHeight - bodyHeight)
    scrollX = Math.min(scrollX, maxScrollX)
    scrollY = Math.min(scrollY, maxScrollY)

    this.verticalScrollHelper.setViewportHeight(bodyHeight)

    const getScrollableColumnWidth = index => columnData.scrollableLeafColumns[index].width
    const scrollableViewportWidth = bodyWidth - reservedColumnWidth
    if (!this.horizontalScrollHelper) {
      this.horizontalScrollHelper = new HorizontalScrollHelper(
        columnData.scrollableLeafColumns.length,
        scrollableViewportWidth,
        getScrollableColumnWidth,
      )
    } else {
      this.horizontalScrollHelper.setViewportWidth(scrollableViewportWidth)
      this.horizontalScrollHelper.setColumnWidthGetter(getScrollableColumnWidth)
    }

    // scrollToColumn
    const oldScrollToColumn = oldState ? oldState.scrollToColumn : undefined
    const scrollToColumn = props.scrollToColumn
    if (scrollToColumn !== undefined && scrollToColumn !== oldScrollToColumn) {
      const leftFixedCount = columnData.leftFixedLeafColumns.length
      const scrollableCount = columnData.scrollableLeafColumns.length
      const columnIndex = clamp(scrollToColumn - leftFixedCount, 0, scrollableCount - 1)
      const scrollState = this.horizontalScrollHelper.scrollToColumn(columnIndex)
      scrollX = scrollState.position
      firstColumnIndex = scrollState.index
      firstColumnOffset = scrollState.offset
    }

    // scrollLeft
    const oldScrollLeft = oldState ? oldState.scrollLeft : undefined
    if (props.scrollLeft !== undefined && props.scrollLeft !== oldScrollLeft) {
      const scrollState = this.horizontalScrollHelper.scrollTo(props.scrollLeft)
      scrollX = scrollState.position
      firstColumnIndex = scrollState.index
      firstColumnOffset = scrollState.offset
    }

    if (
      !this.columnBuffer ||
      !oldState ||
      !deepEqual(columnData.scrollableColumns, oldState.scrollableColumns)
    ) {
      this.columnBuffer = new FlexiGridColumnBuffer(
        columnData.scrollableLeafColumns.length,
        scrollableViewportWidth,
        getScrollableColumnWidth,
        props.bufferColumnCount,
      )
    }

    const scrollableColumnsToRender = this.columnBuffer.getColumns(
      firstColumnIndex,
      firstColumnOffset,
    )

    // The order of elements in this object metters and bringing bodyHeight,
    // height or useGroupHeader to the top can break various features
    const newState = {
      rowCount,

      columnData,
      scrollableColumnsToRender,
      columnResizingKey: oldState && oldState.columnResizingKey || null,
      columnReorderingKey: oldState && oldState.columnReorderingKey || null,

      height,
      rowHeight,
      useMaxHeight,
      headerHeight,
      reservedHeight,

      viewportWidth,
      viewportHeight,

      bodyWidth,
      bodyHeight,

      contentWidth,
      contentHeight,

      firstRowIndex,
      firstRowOffset,
      firstColumnIndex,
      firstColumnOffset,
      scrollX,
      scrollY,
      maxScrollX,
      maxScrollY,
      showScrollbarX,
      showScrollbarY,

      // store these props for next compare
      scrollTop: props.scrollTop,
      scrollLeft: props.scrollLeft,
      scrollToRow: props.scrollToRow,
      scrollToColumn: props.scrollToColumn,
      getRowHeight: props.getRowHeight,
      getSubRowHeight: props.getSubRowHeight,
    }

    return newState
  }

  getColumnReorderingData() {
    const raw = this.columnReorderingData
    if (raw) {
      const { column } = raw
      const { prefixCls, headerRowHeight, borderSize, reorderFactor, reorderKnobSize } = this.props
      const { bodyWidth, headerHeight, bodyHeight, columnData, scrollX } = this.state
      const { leftFixedColumnsWidth, rightFixedColumnsWidth } = columnData
      const maxRight = bodyWidth - rightFixedColumnsWidth

      const offsetTop = (column.depth - 1) * headerRowHeight

      let offsetLeft = column.left
      if (this.state.showScrollbarX) {
        if (!column.fixed) {
          offsetLeft -= scrollX
        } else if (column.fixed === 'right') {
          offsetLeft += bodyWidth - rightFixedColumnsWidth
        }
      }

      const siblings = this.getColumnSiblings(column)
      const targets = []
      let siblingLeft = offsetLeft
      siblings.some((item) => {
        if (item === column) {
          return true
        }
        siblingLeft -= item.width
        return false
      })


      siblings.forEach((item) => {
        targets.push({
          left: siblingLeft,
          top: offsetTop,
          height: headerHeight - offsetTop,
          width: item.width,
          key: item.key,
          leftSideVisible: siblingLeft >= leftFixedColumnsWidth,
          rightSideVisible: siblingLeft + item.width <= maxRight,
        })
        siblingLeft += item.width
      })

      return {
        ...raw,
        prefixCls,
        width: bodyWidth,
        height: headerHeight + bodyHeight,
        offsetLeft,
        offsetTop,
        targets,
        headerRowHeight,
        columnHeight: headerHeight - offsetTop,
        borderSize,
        scrollX,
        factor: reorderFactor,
        knobSize: reorderKnobSize,
      }
    }

    return raw
  }

  getColumnSiblings(column) {
    let siblings = column.depth > 1 ? column.parent.children : null
    if (!siblings) {
      const columnData = this.state.columnData
      if (column.fixed === 'left') {
        siblings = columnData.leftFixedColumns
      } else if (column.fixed === 'right') {
        siblings = columnData.rightFixedColumns
      } else {
        siblings = columnData.scrollableColumns
      }
    }

    return siblings
  }

  getHeaderAndBodyCommonProps() {
    const { prefixCls, rowHeight, bordered } = this.props
    const {
      columnData,
      scrollX,
      showScrollbarX,
      showScrollbarY,
      scrollableColumnsToRender,
      scrollableLeafColumnsToRender,
      leftFixedColumnsUpdated,
      scrollableColumnsUpdated,
      rightFixedColumnsUpdated,
      scrollableColumnsToRenderUpdated,
    } = this.state

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
    } = columnData

    return {
      prefixCls,
      rowHeight,
      bordered,
      scrollX,
      showScrollbarX,
      showScrollbarY,

      leftFixedColumns,
      scrollableColumns,
      rightFixedColumns,
      leftFixedLeafColumns,
      scrollableLeafColumns,
      rightFixedLeafColumns,
      scrollableColumnsToRender,
      scrollableLeafColumnsToRender,
      leftFixedColumnsWidth,
      scrollableColumnsWidth,
      rightFixedColumnsWidth,
      leftFixedColumnsUpdated,
      scrollableColumnsUpdated,
      rightFixedColumnsUpdated,
      scrollableColumnsToRenderUpdated,
    }
  }

  renderHeader() {
    const { viewportWidth, headerHeight } = this.state
    const props = {
      ...this.getHeaderAndBodyCommonProps(),
      rowHeight: this.props.headerRowHeight,
      scrollbarSize: Scrollbar.SIZE,
      width: viewportWidth,
      height: headerHeight,
    }
    return <FlexiGridHeader {...props} />
  }

  renderBody() {
    const props = {
      ...this.getHeaderAndBodyCommonProps(),

      width: this.state.bodyWidth,
      height: this.state.bodyHeight,
      firstRowIndex: this.state.firstRowIndex,
      firstRowOffset: this.state.firstRowOffset,

      data: this.props.data,
      rowKey: this.props.rowKey,
      scrolling: this.scrolling,
      subRow: this.props.subRow,
      bufferRowCount: this.props.bufferRowCount,
      getRowPosition: this.verticalScrollHelper.getRowPosition,
      getRowHeight: this.props.getRowHeight,
      getSubRowHeight: this.props.getSubRowHeight,
      getRowClassName: this.props.getRowClassName,

      onRowClick: this.props.onRowClick,
      onRowDoubleClick: this.props.onRowDoubleClick,
      onRowMouseDown: this.props.onRowMouseDown,
      onRowMouseUp: this.props.onRowMouseUp,
      onRowMouseEnter: this.props.onRowMouseEnter,
      onRowMouseLeave: this.props.onRowMouseLeave,

      onRowTouchStart: this.props.onRowTouchStart,
      onRowTouchEnd: this.props.onRowTouchEnd,
      onRowTouchMove: this.props.onRowTouchMove,
    }
    return <FlexiGridBody {...props} />
  }

  renderFooter() {
    const { prefixCls, footerHeight, footer } = this.props
    const { viewportWidth } = this.state
    const style = {
      width: viewportWidth,
      height: footerHeight,
    }

    return (
      <div
        className={`${prefixCls}-footer`}
        style={style}
      >
        {footer}
      </div>
    )
  }

  renderShadowTop() {
    const props = {
      prefixCls: this.props.prefixCls,
      display: this.state.showScrollbarY,
      visible: this.state.scrollY > 0,
      width: this.state.bodyWidth,
      top: this.state.headerHeight,
    }

    return <FlexiGridShadowTop {...props} />
  }

  renderShadowBottom() {
    const props = {
      prefixCls: this.props.prefixCls,
      display: this.state.showScrollbarY,
      visible: this.state.scrollY !== this.state.maxScrollY,
      width: this.state.bodyWidth,
      bottom: this.props.footerHeight,
    }

    return <FlexiGridShadowBottom {...props} />
  }

  renderShadowLeft() {
    const { leftFixedColumns, leftFixedColumnsWidth } = this.state.columnData
    const props = {
      prefixCls: this.props.prefixCls,
      display: leftFixedColumns.length > 0,
      visible: this.state.scrollX > 0,
      height: this.state.headerHeight + this.state.bodyHeight,
      left: leftFixedColumnsWidth,
    }

    return <FlexiGridShadowLeft {...props} />
  }

  renderShadowRight() {
    const { rightFixedColumns, rightFixedColumnsWidth } = this.state.columnData
    const props = {
      prefixCls: this.props.prefixCls,
      display: rightFixedColumns.length > 0,
      visible: this.state.scrollX !== this.state.maxScrollX,
      height: this.state.headerHeight + this.state.bodyHeight,
      right: rightFixedColumnsWidth + (this.state.showScrollbarY ? Scrollbar.SIZE : 0),
    }

    return <FlexiGridShadowRight {...props} />
  }

  renderResizeKnobs() {
    const { columnData } = this.state

    const props = {
      prefixCls: this.props.prefixCls,
      knobSize: this.props.resizeKnobSize,
      headerRowHeight: this.props.headerRowHeight,
      headerHeight: this.state.headerHeight,
      bodyHeight: this.state.bodyHeight,
      bodyWidth: this.state.bodyWidth,
      scrollX: this.state.scrollX,
      showScrollbarX: this.state.showScrollbarX,
      leftFixedLeafColumns: columnData.leftFixedLeafColumns,
      scrollableLeafColumns: columnData.scrollableLeafColumns,
      rightFixedLeafColumns: columnData.rightFixedLeafColumns,
      leftFixedColumnsWidth: columnData.leftFixedColumnsWidth,
      scrollableColumnsWidth: columnData.scrollableColumnsWidth,
      rightFixedColumnsWidth: columnData.rightFixedColumnsWidth,
      onColumnResize: this.onColumnResize,
    }

    return <FlexiGridColumnResizeKnobs {...props} />
  }

  renderColumnResizeHandler() {
    const props = this.columnResizingData || { prefixCls: this.props.prefixCls }
    return (<FlexiGridColumnResizeHandler {...props} visible={this.isColumnResizing()} />)
  }

  renderReorderKnobs() {
    const { columnData } = this.state

    const props = {
      prefixCls: this.props.prefixCls,
      knobSize: this.props.reorderKnobSize,
      headerHeight: this.state.headerHeight,
      headerRowHeight: this.props.headerRowHeight,
      bodyWidth: this.state.bodyWidth,
      scrollX: this.state.scrollX,
      showScrollbarX: this.state.showScrollbarX,
      leftFixedColumns: columnData.leftFixedColumns,
      scrollableColumns: columnData.scrollableColumns,
      rightFixedColumns: columnData.rightFixedColumns,
      leftFixedColumnsWidth: columnData.leftFixedColumnsWidth,
      scrollableColumnsWidth: columnData.scrollableColumnsWidth,
      rightFixedColumnsWidth: columnData.rightFixedColumnsWidth,
      onColumnReorder: this.onColumnReorder,
    }

    return <FlexiGridColumnReorderKnobs {...props} />
  }

  renderColumnReorderHandler() {
    const props = this.getColumnReorderingData() || { prefixCls: this.props.prefixCls }
    return (
      <FlexiGridColumnReorderHandler
        {...props}
        visible={this.isColumnReordering()}
      />
    )
  }

  renderScrollbar() {
    const state = this.state
    const props = this.props
    const result = {}

    if (state.showScrollbarY) {
      result.verticalScrollbar = (
        <Scrollbar
          orientation={'vertical'}
          top={state.headerHeight}
          prefixCls={props.prefixCls}
          position={state.scrollY}
          size={state.bodyHeight}
          contentSize={state.contentHeight}
          onScroll={this.onVerticalScroll}
        />
      )
    }

    if (state.showScrollbarX) {
      result.horizontalScrollbar = (
        <Scrollbar
          orientation={'horizontal'}
          prefixCls={props.prefixCls}
          position={state.scrollX}
          size={state.bodyWidth}
          contentSize={state.contentWidth}
          hasVerticalScrollbar={state.showScrollbarX}
          onScroll={this.onHorizontalScroll}
        />
      )
    }

    return result
  }

  render() {
    const state = this.state
    const props = this.props

    const { prefixCls, className, bordered, reorderable } = props
    const mainClassNames = classNames(
      prefixCls,
      className,
      { bordered, reorderable },
    )

    const { verticalScrollbar, horizontalScrollbar } = this.renderScrollbar()

    return (
      <div
        className={mainClassNames}
        onWheel={this.wheelHandler.onWheel}
        onTouchStart={this.touchHandler.onTouchStart}
        onTouchEnd={this.touchHandler.onTouchEnd}
        onTouchMove={this.touchHandler.onTouchMove}
        onTouchCancel={this.touchHandler.onTouchCancel}
        style={{ width: state.width, height: state.height }}
      >
        <div
          className={`${prefixCls}-container`}
          style={{
            width: state.viewportWidth,
            height: state.headerHeight + state.bodyHeight + props.footerHeight,
          }}
        >
          {this.renderHeader()}
          {this.renderBody()}
          {this.renderFooter()}
          {this.renderShadowTop()}
          {this.renderShadowRight()}
          {this.renderShadowBottom()}
          {this.renderShadowLeft()}
          {this.props.resizable && this.renderResizeKnobs()}
          {this.props.reorderable && this.renderReorderKnobs()}
          {this.props.resizable && this.renderColumnResizeHandler()}
          {this.props.reorderable && this.renderColumnReorderHandler()}
        </div>
        {verticalScrollbar}
        {horizontalScrollbar}
      </div>
    )
  }
}
