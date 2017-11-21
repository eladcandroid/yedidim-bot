import React from 'react'
import styled from 'styled-components/native'
import { Col, Row, Text } from 'native-base'

const InfoItem = styled.View`
  margin: 10px 10px;
`

const BoldText = styled.Text`
  font-weight: bold;
  font-size: 16px;
  padding: 0 10px;
`

const MainText = styled.Text`
  text-align: right;
`

const TextFieldRow = ({ label, value }) =>
  value ? (
    <Row>
      <Col>
        <InfoItem>
          <MainText>
            <BoldText>{label}:</BoldText> <Text>{value}</Text>
          </MainText>
        </InfoItem>
      </Col>
    </Row>
  ) : null

export default TextFieldRow
