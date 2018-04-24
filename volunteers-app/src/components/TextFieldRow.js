import React from 'react'
import styled from 'styled-components/native'
import { Col, Row, Text } from 'native-base'
import AlignedText from './AlignedText'

const InfoItem = styled.View`
  margin: 10px 10px;
`

const BoldText = styled.Text`
  font-weight: bold;
  font-size: 16px;
  padding: 0 10px;
`

const TextFieldRow = ({ label, value }) =>
  value ? (
    <Row>
      <Col>
        <InfoItem>
          <AlignedText>
            <BoldText>{label}:</BoldText> <Text>{value}</Text>
          </AlignedText>
        </InfoItem>
      </Col>
    </Row>
  ) : null

export default TextFieldRow
