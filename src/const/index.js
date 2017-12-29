import { defineMessages } from 'react-intl'

const types = defineMessages({
  0: { id: 'cables', defaultMessage: 'Cables' },
  1: { id: 'puncture', defaultMessage: 'Puncture' },
  2: { id: 'compressor', defaultMessage: 'Compressor' },
  3: { id: 'lockedDoor', defaultMessage: 'Locked door' },
  4: { id: 'liquids', defaultMessage: 'Gas/Water/Oil' },
  5: { id: 'rescue', defaultMessage: 'Rescue' },
  6: { id: 'transponder', defaultMessage: 'Transponder' },
  7: {
    id: 'puncture-no-replacement',
    defaultMessage: 'Puncture w/o replacement'
  },
  8: { id: 'other', defaultMessage: 'Other' }
})

/* eslint-disable global-require */
const typesImage = [
  require('images/case0.jpg'),
  require('images/case1.jpg'),
  require('images/case2.jpg'),
  require('images/case3.jpg'),
  require('images/case4.jpg'),
  require('images/case5.jpg'),
  require('images/case6.jpg'),
  require('images/case7.jpg'),
  require('images/case8.jpg')
]
/* eslint-enable */

export const eventTypeMessage = typeId => types[typeId]

export const eventTypeImg = typeId =>
  typeof typeId !== 'number' ? typesImage : typesImage[typeId]
