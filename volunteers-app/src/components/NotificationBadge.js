import React from 'react'
import { Badge, Text, Button } from 'native-base'
import { View, Alert } from 'react-native'

const NotificationBadge = ({ sent, error, received, showMore }) => (
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
    {showMore && (
      <Button
        small
        primary
        onPress={() => {
          Alert.alert(
            'מידע על ההתראות',
            '\n' +
              `נשלחו: ${sent
                .map(phone => phone.replace(/(\+972)/, '0'))
                .join(', ')}` +
              '\n\n' +
              `התקבלו: ${received
                .map(phone => phone.replace(/(\+972)/, '0'))
                .join(', ')}` +
              '\n\n' +
              `שגיאה: ${error
                .map(phone => phone.replace(/(\+972)/, '0'))
                .join(', ')}`,
            [{ text: 'OK', onPress: () => {} }],
            { cancelable: false }
          )
        }}
      >
        <Text>לעוד מידע</Text>
      </Button>
    )}
  </View>
)

export default NotificationBadge
