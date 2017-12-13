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
    location: '/examples/fixed-columns.html',
    title: 'Fixed Columns',
    description: 'A table example that has a columns fixed at the left and right side of the table.',
    fileName: 'FixedColumns.jsx',
    component: require('../examples/FixedColumns'),
  },
  {
    location: '/examples/resizable-columns.html',
    fileName: 'ResizableColumns.jsx',
    title: 'Resizable columns',
    description: 'Table with drag and drop column resizing and the `CompanyName` column demonstrates the ability to constrain to both a min- and max-width.',
    component: require('../examples/ResizableColumns'),
  },
  {
    location: '/examples/reorderable-columns.html',
    fileName: 'ReorderableColumns.jsx',
    title: 'Reorderable columns',
    description: 'Table with drag and drop column reordering and a dummy "store" for persistence.',
    component: require('../examples/ReorderableColumns'),
  },
  {
    location: '/examples/column-groups.html',
    title: 'Column Groups',
    description: 'Table with merged column headers',
    fileName: 'ColumnGroups.jsx',
    component: require('../examples/ColumnGroups'),
  },
  {
    location: '/examples/client-sort.html',
    title: 'Client-side Sort',
    description: 'A table example that is sortable by column.',
    fileName: 'ClientSideSort.jsx',
    component: require('../examples/ClientSideSort'),
  },
  {
    location: '/examples/fluid-column-width.html',
    fileName: 'FluidColumnWidth.js',
    title: 'Fluid column width',
    description: 'An example of a table with flexible column widths. Here, the middle two columns stretch to fill all remaining space if the table is wider than the sum of all the columns\'s default widths. Note that one column grows twice as greedily as the other, as specified by the flexGrow param.',
    component: require('../examples/FluidColumnWidth'),
  },
  {
    location: '/examples/responsive-resize.html',
    fileName: 'ResponsiveResize.js',
    title: 'Responsive Resize',
    description: 'A table example that resizes based on its parent\'s size.',
    component: require('../examples/ResponsiveResize'),
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
