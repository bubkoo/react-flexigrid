import React from 'react'
import Header from './Header'
import Wrapper from './Wrapper'
import './Index.less'

const Index = props => (
  <Wrapper {...props}>
    <Header {...props} />
    <div id="root" />
  </Wrapper>
)

export default Index
