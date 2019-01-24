import React from 'react'
import { AppText } from '../global-styles'

const AlignedText = ({ children, style = {}, ...props }) => {
  const alignedStyle = {
    ...style,
    textAlign: 'left'
  }
  return (
    <AppText {...props} style={alignedStyle}>
      {children}
    </AppText>
  )
}

export default AlignedText
