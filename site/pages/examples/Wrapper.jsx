import React from 'react'
import Header from '../../layout/Header'
import SideBar from '../../layout/SideBar'
import { examples } from '../../data'

const Wrapper = props => (
  <div className="examples">
    <Header />
    <div className="main">
      <div className="inner">
        <SideBar
          pages={examples}
          page={props.page}
        />
        <div className="content">
          {props.children}
        </div>
      </div>
    </div>
  </div>
)

export default Wrapper
