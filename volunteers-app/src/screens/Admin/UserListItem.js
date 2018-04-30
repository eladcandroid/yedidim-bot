import React from 'react'
import { Body, Icon, Right, Text, ListItem, ActionSheet } from 'native-base'
import { FormattedMessage, FormattedRelative } from 'react-intl'
import { Linking } from 'react-native'

const options = ['להתקשר', 'WhatsApp', 'לשלוח בדיקה מחדש', 'לבטל']

const UserListItem = ({ name, phone }) => (
  <ListItem
    icon
    onPress={() =>
      ActionSheet.show(
        {
          options,
          cancelButtonIndex: 3,
          title: name
        },
        buttonIndex => {
          if (buttonIndex === 0) {
            // Call
            Linking.openURL(`tel:${phone.replace(/\+972/, '0')}`)
          }
          if (buttonIndex === 1) {
            // Whatsapp
            Linking.openURL(`whatsapp://send?phone=${phone}`)
          }
          console.log(options[buttonIndex])
        }
      )}
  >
    <Body>
      <Text>{name}</Text>
    </Body>
    <Right>
      <FormattedMessage
        id="NotificationReport.status.sent"
        defaultMessage="Waiting"
      >
        {txt => (
          <FormattedRelative value={new Date().getTime() - 232223222}>
            {relative => (
              <Text note style={{ color: 'orange' }}>
                {txt} ({relative})
              </Text>
            )}
          </FormattedRelative>
        )}
      </FormattedMessage>
      <Icon name="ios-time" style={{ color: 'orange' }} />
    </Right>
  </ListItem>
)

export default UserListItem
