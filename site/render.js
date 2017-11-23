import fs from 'fs'
import path from 'path'
import glob from 'glob'     // eslint-disable-line
import mkdirp from 'mkdirp' // eslint-disable-line
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import Document from './layout/Document'
import data from './data'


function renderPage(props, callback) {
  const html = ReactDOMServer.renderToStaticMarkup(React.createElement(Document, props))
  callback(
    `<!doctype html>${html}`,
  )
}

export default function renderPages() {
  const root = path.join(process.cwd(), '.site')
  if (!fs.existsSync(root)) {
    fs.mkdirSync(root)
  }

  const resources = {
    'main.css': 'main.css',
    'main.js': 'main.js',
  }

  if (process.env.NODE_ENV === 'production') {
    Object.keys(resources).forEach((fileName) => {
      const searchPath = path.join(root, fileName.replace('.', '-*.'))
      const hashedFilename = glob.sync(searchPath)[0]
      if (!hashedFilename) {
        throw new Error(
          `Hashed file of "${fileName}" not found when searching with "${searchPath}"`,
        )
      }

      resources[fileName] = path.basename(hashedFilename)
    })
  }

  data[1].forEach((item) => {
    const { location } = item
    const props = {
      page: item,
      dev: process.env.NODE_ENV !== 'production',
      resources,
    }

    renderPage(props, (content) => {
      const dir = path.dirname(location)
      if (dir && !fs.existsSync(path.join(root, dir))) {
        mkdirp.sync(path.join(root, dir))
      }

      fs.writeFileSync(
        path.join(root, location),
        content,
      )
    })
  })
}
