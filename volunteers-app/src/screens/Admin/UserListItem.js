import React from 'react'
import { Body, Icon, Right, ListItem, ActionSheet } from 'native-base'
import { FormattedRelative } from 'react-intl'
import { Linking, Alert } from 'react-native'
import { observer } from 'mobx-react/native'
import AlignedText from 'components/AlignedText'
import { sendTestNotification } from 'io/notifications'

const options = ['להתקשר', 'WhatsApp', 'לשלוח בדיקה מחדש', 'לבטל']

const status = {
  'not-tested': { text: 'לא נבדק', color: 'orange', icon: 'ios-help-circle' },
  pending: { text: 'מחכה למשתמש', color: 'orange', icon: 'ios-time' },
  'token-error': { text: 'טוקן לא מוגדר', color: 'red', icon: 'ios-alert' },
  'sending-error': { text: 'טוקן לא תקין', color: 'red', icon: 'md-desktop' },
  working: { text: 'עובד', color: 'green', icon: 'ios-checkmark-circle' }
}

const UserListItem = ({
  id,
  name,
  phone,
  role,
  notificationStatus,
  notificationTimestamp
}) => (
  <ListItem
    icon
    onPress={() =>
      ActionSheet.show(
        {
          options,
          cancelButtonIndex: 3,
          title: `${name} (${phone})`
        },
        async buttonIndex => {
          if (buttonIndex === 0) {
            // Call
            Linking.openURL(`tel:${phone}`)
          }
          if (buttonIndex === 1) {
            // Whatsapp
            Linking.openURL(
              `whatsapp://send?phone=${phone.replace(/^0/, '+972')}`
            )
          }
          if (buttonIndex === 2) {
            try {
              await sendTestNotification(id, role)
            } catch (error) {
              Alert.alert(
                'שגיעה',
                'אירע שגיעה, לא הצלחנו לשלוח מחדש את הבדיקה התראות למשתמש. נסה שוב מאוחר יותר.',
                [{ text: 'בסדר', onPress: () => {} }],
                { cancelable: false }
              )
            }
          }
        }
      )}
  >
    <Body>
      <AlignedText>{name}</AlignedText>
    </Body>
    <Right>
      {notificationTimestamp ? (
        <FormattedRelative value={notificationTimestamp}>
          {relative => (
            <AlignedText style={{ color: status[notificationStatus].color }}>
              {status[notificationStatus].text} ({relative})
            </AlignedText>
          )}
        </FormattedRelative>
      ) : (
        <AlignedText style={{ color: status[notificationStatus].color }}>
          {status[notificationStatus].text}
        </AlignedText>
      )}
      <Icon
        name={status[notificationStatus].icon}
        style={{ color: status[notificationStatus].color }}
      />
    </Right>
  </ListItem>
)

export default observer(UserListItem)
