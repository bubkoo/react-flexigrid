/* eslint-disable global-require */

export const PAGE_TITLE = 'FlexiGrid'
export const GITHUB_URL = 'https://github.com/bubkoo/react-flexigrid'


const EXAMPLES_LOCATION_BASE = `${GITHUB_URL}/blob/master/examples/`

export const otherPages = [
  { location: 'index.html', title: 'Home' },
]

export const docs = [
  {
    groupTitle: 'Guides',
    GETTING_STARTED: { location: 'getting-started.html', title: 'Getting Started' },
    V6_MIGRATION: { location: 'v6-migration.html', title: 'v0.6 API Migration' },
    ROADMAP: { location: 'roadmap.html', title: 'Roadmap' },
    CODEBASE_OVERVIEW: { location: 'codebase.html', title: 'Codebase Overview' },
  },
]

export const examples = [
  {
    location: '/examples/object-data.html',
    title: 'With JSON Data',
    description: 'A basic table example fed with some JSON data.',
    fileName: 'ObjectData.jsx',
    component: require('../examples/ObjectData'),
  },
  {
    location: '/examples/resizable.html',
    fileName: 'Resizable.jsx',
    title: 'Resizable columns',
    description: 'Table with drag and drop column resizing and the `CompanyName` column demonstrates the ability to constrain to both a min- and max-width.',
    component: require('../examples/Resizable'),
  },
  {
    location: '/examples/reorderable.html',
    fileName: 'Reorderable.jsx',
    title: 'Reorderable columns',
    description: 'Table with drag and drop column reordering and a dummy "store" for persistence.',
    component: require('../examples/Reorderable'),
  },
]

examples.forEach((item) => {
  item.fileUrl = EXAMPLES_LOCATION_BASE + item.fileName
})

function exist(arr, location) {
  return arr.some(item => item.location === location)
}

export function isExamplePage(location) {
  return exist(examples, location)
}

export function getComponent(location) {
  for (let i = 0, l = examples.length; i < l; i += 1) {
    if (examples[i].location === location) {
      return examples[i].component
    }
  }
  return null
}

export default [
  otherPages,
  examples,
]
