import React from 'react'
import './Header.less'

const Header = ({ page }) => (
  <div className="example-header">
    <h1 className="title">
      <span>
        Example:
      </span>
      <a href={page.fileUrl} target="_blank">{page.title}</a>
    </h1>
    <p className="desc">
      <a className="code-link" href={page.fileUrl} target="_blank">Example code</a>
      {page.description}
    </p>
  </div>
)

export default Header
