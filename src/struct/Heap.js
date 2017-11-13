const defaultComparator = (a, b) => a < b

export default class Heap {
  constructor(items, comparator) {
    this.items = items || []
    this.size = this.items.length
    this.comparator = comparator || defaultComparator

    // heapify
    for (let i = Math.floor((this.size + 1) / 2); i >= 0; i -= 1) {
      this.sinkDown(i)
    }
  }

  isEmpty() {
    return this.size === 0
  }

  getSize() {
    return this.size
  }

  peek() {
    return this.size > 0 ? this.items[0] : null
  }

  pop() {
    if (this.size === 0) {
      return null
    }

    const currentItem = this.items[0]
    const lastItem = this.items.pop()

    this.size -= 1

    if (this.size > 0) {
      this.items[0] = lastItem
      this.sinkDown(0)
    }

    return currentItem
  }

  push(item) {
    this.items[this.size] = item
    this.size += 1
    this.bubbleUp(this.size - 1)
  }

  bubbleUp(index) {
    const currentItem = this.items[index]
    while (index > 0) {
      const parentIndex = Math.floor((index + 1) / 2) - 1
      const parentItem = this.items[parentIndex]

      // if parentItem < currentItem, stop
      if (this.comparator(parentItem, currentItem)) {
        return
      }

      // swap
      this.items[parentIndex] = currentItem
      this.items[index] = parentItem
      index = parentIndex // eslint-disable-line
    }
  }

  sinkDown(index) {
    const currentItem = this.items[index]

    while (true) { // eslint-disable-line
      const leftChildIndex = 2 * (index + 1) - 1
      const rightChildIndex = 2 * (index + 1)
      let swapIndex = -1

      if (leftChildIndex < this.size) {
        const leftChild = this.items[leftChildIndex]
        if (this.comparator(leftChild, currentItem)) {
          swapIndex = leftChildIndex
        }
      }

      if (rightChildIndex < this.size) {
        const rightChild = this.items[rightChildIndex]
        if (this.comparator(rightChild, currentItem)) {
          if (swapIndex === -1 || this.comparator(rightChild, this.items[swapIndex])) {
            swapIndex = rightChildIndex
          }
        }
      }

      // if we don't have a swap, stop
      if (swapIndex === -1) {
        return
      }

      this.items[index] = this.items[swapIndex]
      this.items[swapIndex] = currentItem
      index = swapIndex // eslint-disable-line
    }
  }
}
