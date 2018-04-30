import React from 'react'
import { Body, Icon, Right, Text, ListItem, ActionSheet } from 'native-base'
import { FormattedMessage, FormattedRelative } from 'react-intl'

const UserListItem = ({ name }) => (
  <ListItem
    icon
    onPress={() =>
      ActionSheet.show(
        {
          options: ['Call', 'Resend Notification', 'Cancel'],
          cancelButtonIndex: 2,
          title: name
        },
        buttonIndex => {
          console.log(['Call', 'Resend Notification', 'Cancel'][buttonIndex])
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
