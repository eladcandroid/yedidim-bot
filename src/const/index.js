import { defineMessages } from 'react-intl'

const types = defineMessages({
  0: { id: 'Event.type.cables', defaultMessage: 'Cables' },
  1: { id: 'Event.type.puncture', defaultMessage: 'Puncture' },
  2: { id: 'Event.type.compressor', defaultMessage: 'Compressor' },
  3: { id: 'Event.type.lockedDoor', defaultMessage: 'Locked door' },
  4: { id: 'Event.type.liquids', defaultMessage: 'Gas/Water/Oil' },
  5: { id: 'Event.type.rescue', defaultMessage: 'Rescue' },
  6: { id: 'Event.type.transponder', defaultMessage: 'Transponder' },
  7: {
    id: 'Event.type.puncture-no-replacement',
    defaultMessage: 'Puncture w/o replacement'
  },
  8: { id: 'Event.type.other', defaultMessage: 'Other' }
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

export const eventTypeMessage = typeId =>
  types[typeId] ? types[typeId] : types[8]

export const eventTypeImg = typeId => {
  if (typeof typeId !== 'number') {
    return typesImage
  }
  return typesImage[typeId] ? typesImage[typeId] : typesImage[8]
}
