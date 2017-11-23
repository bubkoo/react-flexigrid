import generateDataItem from './generateDataItem'

const min = 1000
export default function getFakeData(count = min) {
  const seed = []
  const length = count <= min ? count : min
  for (let i = 0; i < length; i += 1) {
    seed.push(generateDataItem())
  }

  let result = count <= min ? seed : []

  if (count > min) {
    while (result.length < count) {
      result = result.concat(seed)
      if (count - result.length < min) {
        result = result.concat(seed.slice(0, count - result.length))
      }
    }
  }

  return result.map((item, index) => ({
    ...item,
    id: index + 1,
  }))
}

