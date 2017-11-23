import generateDataItem from './generateDataItem'

export default class FakeObjectDataListStore {
  constructor(size = 1000) {
    const cache = []
    const target = {}

    const getObjectAt = (index) => {
      if (index < 0 || index > size) {
        return null
      }

      if (!cache[index]) {
        cache[index] = generateDataItem(+index + 1)
      }

      return cache[index]
    }

    Object.defineProperties(target, {
      length: {
        value: size,
        writable: true,
      },

      [Symbol.iterator]: {
        value: () => {
          let index = 0
          return {
            next: () => ({
              done: index === target.length,
              value: target[index++], // eslint-disable-line
            }),
          }
        },
      },
    })

    const data = new Proxy(target, {
      get(t, property) {
        if (property === 'length') {
          return size
        }

        if (typeof property === 'symbol') {
          return t[property]
        }

        return getObjectAt(property) || t[property]
      },
    })

    return data
  }
}
