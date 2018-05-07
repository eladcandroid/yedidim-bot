import React from 'react'
import { Badge, Text } from 'native-base'
import { View } from 'react-native'

const NotificationBadge = () => (
  <View style={{ flexDirection: 'row', marginTop: 5 }}>
    <Badge success style={{ marginRight: 10 }}>
      <Text>2</Text>
    </Badge>
    <Badge warning style={{ marginRight: 10 }}>
      <Text>2</Text>
    </Badge>
    <Badge danger style={{ marginRight: 10 }}>
      <Text>2</Text>
    </Badge>
  </View>
)

export default NotificationBadge
