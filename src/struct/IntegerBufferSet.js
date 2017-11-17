import invariant from 'invariant'
import Heap from './Heap'

export default class IntegerBufferSet {
  constructor() {
    this.size = 0
    this.smallValues = new Heap([], this.smallerComparator)
    this.largeValues = new Heap([], this.greaterComparator)
    this.valuePositionMap = {}
  }

  getSize() {
    return this.size
  }

  getPositionForValue(index) {
    const position = this.valuePositionMap[index]
    return position === undefined ? null : position
  }

  getNewPositionForValue(index) {
    invariant(
      this.valuePositionMap[index] === undefined,
      "Shouldn't try to find new position for value already stored in BufferSet",
    )

    const newPosition = this.size
    this.size += 1
    this.pushToHeaps(newPosition, index)
    this.valuePositionMap[index] = newPosition

    return newPosition
  }

  replaceFurthestValuePosition(smallIndex, bigIndex, newIndex) {
    invariant(
      this.valuePositionMap[newIndex] === undefined,
      "Shouldn't try to replace values with value already stored value in BufferSet",
    )

    this.cleanHeaps()

    if (this.smallValues.isEmpty() || this.largeValues.isEmpty()) {
      // Threre are currently no values stored.
      // We will have to create new position for this value.
      return null
    }

    const minIndex = this.smallValues.peek().value
    const maxIndex = this.largeValues.peek().value
    if (minIndex >= smallIndex && maxIndex <= bigIndex) {
      // All values currently stored are necessary, we can't reuse any of them.
      return null
    }

    let valueToReplace
    if (smallIndex - minIndex > maxIndex - bigIndex) {
      // minValue is further from provided range. We will reuse it's position.
      valueToReplace = minIndex
      this.smallValues.pop()
    } else {
      valueToReplace = maxIndex
      this.largeValues.pop()
    }

    const position = this.valuePositionMap[valueToReplace]
    delete this.valuePositionMap[valueToReplace]
    this.valuePositionMap[newIndex] = position
    this.pushToHeaps(position, newIndex)

    return position
  }

  pushToHeaps(position, value) {
    const item = {
      position,
      value,
    }

    this.smallValues.push(item)
    this.largeValues.push(item)
  }

  cleanHeaps() {
    // We not usually only remove object from one heap while moving value.
    // Here we make sure that there is no stale data on top of heaps.
    this.cleanHeap(this.smallValues)
    this.cleanHeap(this.largeValues)
    const smallHeapSize = this.smallValues.getSize()
    const largeHeapSize = this.largeValues.getSize()
    const minHeapSize = Math.min(smallHeapSize, largeHeapSize)
    const maxHeapSize = Math.max(smallHeapSize, largeHeapSize)
    if (maxHeapSize > 10 * minHeapSize) {
      // There are many old values in one of heaps. We nned to
      // get rid of them to not use too avoid memory leaks
      this.reBuildHeaps()
    }
  }

  reBuildHeaps() {
    const sourceHeap = this.smallValues.getSize() < this.largeValues.getSize()
      ? this.smallValues
      : this.largeValues

    const newSmallValues = new Heap([], this.smallerComparator)
    const newLargeValues = new Heap([], this.greaterComparator)

    while (!sourceHeap.isEmpty()) {
      const item = sourceHeap.pop()
      // push all stil valid elements to new heaps
      if (this.valuePositionMap[item.value] !== undefined) {
        newSmallValues.push(item)
        newLargeValues.push(item)
      }
    }
    this.smallValues = newSmallValues
    this.largeValues = newLargeValues
  }

  cleanHeap(heap) {
    while (!heap.isEmpty() && this.valuePositionMap[heap.peek().value] === undefined) {
      heap.pop()
    }
  }

  smallerComparator = (lhs, rhs) => lhs.value < rhs.value

  greaterComparator = (lhs, rhs) => lhs.value > rhs.value
}
