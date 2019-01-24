import React from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'

import { Button, Grid, Col, Row, Text } from 'native-base'

const TakenEventButtons = ({ onPress }) => (
  <Grid>
    <Row style={{ marginTop: 10 }}>
      <Col>
        <Button full large block warning onPress={onPress}>
          <FormattedMessage
            id="Event.taken.button"
            defaultMessage="Event was taken already"
          >
            {txt => (
              <Text
                style={{
                  fontFamily: 'AlefBold',
                  textAlign: 'center',
                  fontSize: 23,
                  marginTop: 10
                }}
              >
                {txt}
              </Text>
            )}
          </FormattedMessage>
        </Button>
      </Col>
    </Row>
  </Grid>
)

export default injectIntl(TakenEventButtons)
