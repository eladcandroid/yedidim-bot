import React from 'react'
import { Text } from 'native-base'

const AlignedText = ({ children, style = {}, ...props }) => {
  const alignedStyle = {
    ...style,
    textAlign: 'left'
  }
  return (
    <Text {...props} style={alignedStyle}>
      {children}
    </Text>
  )
}

export default AlignedText
