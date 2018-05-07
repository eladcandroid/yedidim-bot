import React from 'react'
import { Badge, Text } from 'native-base'
import { View } from 'react-native'

const NotificationBadge = ({ sent, error, received }) => (
  <View style={{ flexDirection: 'row', marginTop: 5 }}>
    <Badge success style={{ marginRight: 10 }}>
      <Text>{received.length}</Text>
    </Badge>
    <Badge warning style={{ marginRight: 10 }}>
      <Text>{sent.length}</Text>
    </Badge>
    <Badge danger style={{ marginRight: 10 }}>
      <Text>{error.length}</Text>
    </Badge>
  </View>
)

export default NotificationBadge
