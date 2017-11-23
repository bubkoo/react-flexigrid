import React from 'react'
import './SideBar.less'

const renderLink = ({ location, title }, current) => (
  <h3 key={location} className={location === current ? 'active' : null}>
    <a href={location}>
      {title}
    </a>
  </h3>
)

const renderSections = (pages, current) => (
  pages.map(page => renderLink(page, current))
)

const SideBar = props => (
  <div className="side">
    <div className="side-nav">
      {renderSections(props.pages, props.page.location)}
    </div>
  </div>
)

export default SideBar
