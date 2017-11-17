import invariant from 'invariant'

const getParentIndex = index => Math.floor(index / 2)
const Int32Array = global.Int32Array || ((size: number): Array<number> => {
  const arr = []
  for (let i = size - 1; i >= 0; i -= 1) {
    arr[i] = 0
  }
  return arr
})

/**
 * Computes the next power of 2 after or equal to x.
 */
function ceilLog2(x: number): number {
  let y = 1
  while (y < x) {
    y *= 2
  }
  return y
}

/**
 * A prefix interval tree stores an numeric array and the partial sums of that
 * array. It is optimized for updating the values of the array without
 * recomputing all of the partial sums.
 *
 *   - O(ln n) update
 *   - O(1) lookup
 *   - O(ln n) compute a partial sum
 *   - O(n) space
 *
 * Note that the sequence of partial sums is one longer than the array, so that
 * the first partial sum is always 0, and the last partial sum is the sum of the
 * entire array.
 */
export default class PrefixIntervalTree {
  constructor(arr: Array<number>) {
    this.size = arr.length

    /**
     * Half the size of the heap. It is also the number of non-leaf nodes, and
     * the index of the first element in the heap. Always a power of 2.
     */
    this.half = ceilLog2(this.size)
    this.heap = new Int32Array(2 * this.half)

    // 初始化数组
    for (let i = 0; i < this.size; i += 1) {
      this.heap[this.half + i] = arr[i]
    }

    // 初始化数组和
    for (let i = this.half - 1; i > 0; i -= 1) {
      this.heap[i] = this.heap[2 * i] + this.heap[2 * i + 1]
    }
  }

  static uniform(size: number, initialValue: number): PrefixIntervalTree {
    const arr = []
    for (let i = size - 1; i >= 0; i -= 1) {
      arr[i] = initialValue
    }

    return new PrefixIntervalTree(arr)
  }

  static empty(size: number): PrefixIntervalTree {
    return PrefixIntervalTree.uniform(size, 0)
  }

  set(index: number, value: number): void {
    invariant(
      index >= 0 && index < this.size,
      'Index out of range %s',
      index,
    )

    // 更新数组项
    let nodeIndex = this.half + index
    this.heap[nodeIndex] = value

    // 更新和
    nodeIndex = getParentIndex(nodeIndex)
    while (nodeIndex) {
      this.heap[nodeIndex] = this.heap[2 * nodeIndex] + this.heap[2 * nodeIndex + 1]
      nodeIndex = getParentIndex(nodeIndex)
    }
  }

  get(index: number): number {
    invariant(
      index >= 0 && index < this.size,
      'Index out of range %s',
      index,
    )

    const nodeIndex = this.half + index
    return this.heap[nodeIndex]
  }

  getSize(): number {
    return this.size
  }

  /**
   * Returns the sum get(0) + get(1) + ... + get(end - 1).
   */
  sumUntil(end: number): number {
    invariant(
      end >= 0 && end < this.size + 1,
      'Index out of range %s',
      end,
    )

    if (end === 0) {
      return 0
    }

    let index = this.half + end - 1
    let sum = this.heap[index] // the last item

    while (index !== 1) {
      if (index % 2 === 1) {
        sum += this.heap[index - 1]
      }
      index = getParentIndex(index)
    }

    return sum
  }

  /**
   * Returns the sum get(0) + get(1) + ... + get(inclusiveEnd).
   */
  sumTo(inclusiveEnd: number): number {
    invariant(
      inclusiveEnd >= 0 && inclusiveEnd < this.size,
      'Index out of range %s',
      inclusiveEnd,
    )
    return this.sumUntil(inclusiveEnd + 1)
  }

  /**
   * Returns the sum get(begin) + get(begin + 1) + ... + get(end - 1).
   */
  sum(begin: number, end: number): number {
    invariant(begin <= end, 'Begin must precede end')
    return this.sumUntil(end) - this.sumUntil(begin)
  }

  /**
   * Returns the smallest i such that 0 <= i <= size and sumUntil(i) <= t, or
   * -1 if no such i exists.
   */
  greatestLowerBound(target: number): number {
    if (target < 0) {
      return -1
    }

    let index = 1
    if (this.heap[index] <= target) {
      return this.size
    }

    while (index < this.half) {
      const leftSum = this.heap[2 * index]
      if (target < leftSum) {
        index = 2 * index // eslint-disable-line
      } else {
        index = 2 * index + 1
        target -= leftSum // eslint-disable-line
      }
    }

    return index - this.half
  }

  /**
   * Returns the smallest i such that 0 <= i <= size and sumUntil(i) < t, or
   * -1 if no such i exists.
   */
  greatestStrictLowerBound(target: number): number {
    if (target <= 0) {
      return -1
    }

    let index = 1
    if (this.heap[index] < target) {
      return this.size
    }

    while (index < this.half) {
      const leftSum = this.heap[2 * index]
      if (target <= leftSum) {
        index = 2 * index // eslint-disable-line
      } else {
        index = 2 * index + 1
        target -= leftSum // eslint-disable-line
      }
    }

    return index - this.half
  }

  /**
   * Returns the smallest i such that 0 <= i <= size and t <= sumUntil(i), or
   * size + 1 if no such i exists.
   */
  leastUpperBound(target: number): number {
    return this.greatestStrictLowerBound(target) + 1
  }

  /**
   * Returns the smallest i such that 0 <= i <= size and t < sumUntil(i), or
   * size + 1 if no such i exists.
   */
  leastStrictUpperBound(target: number): number {
    return this.greatestLowerBound(target) + 1
  }
}
