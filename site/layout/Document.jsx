import React from 'react'
import ReactDOM from 'react-dom'
import { PAGE_TITLE, isExamplePage, getComponent } from '../data'
import favicon from '../images/favicon.png'
import ExamplePage from '../pages/examples/Index'
import './Document.less'

const renderTitle = ({ page: { title } }) => (title ? `${title} - ${PAGE_TITLE}` : PAGE_TITLE)
const renderPage = ({ page }) => {
  if (isExamplePage(page.location)) {
    return <ExamplePage page={page} />
  }

  return null
}
const renderData = ({ page }) => (
  <script
    dangerouslySetInnerHTML={{ // eslint-disable-line
      __html: `window.page = '${page.location}';`,
    }}
  />)


const Document = props => (
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <title>{renderTitle(props)}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
      <link rel="stylesheet" type="text/css" href={`/${props.resources['main.css']}`} />
      <link rel="shortcut icon" type="image/png" href={`/${favicon}`} />
    </head>
    <body>
      {renderPage(props)}
      {renderData(props)}
      <script src={`/${props.resources['main.js']}`} />
    </body>
  </html>
)

try {
  if (window && window.page) {
    const Component = getComponent(window.page)
    if (Component) {
      ReactDOM.render(<Component />, document.getElementById('root'))
    }
  }
} catch (error) {
  // pass
}


export default Document
