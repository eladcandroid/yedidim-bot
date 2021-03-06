import dateFormat from 'dateformat'
import { EventSource, EventStatus } from '../constants/consts'
import { I18nManager } from 'react-native'
import { Constants } from 'expo'

export const getInstance = () => {
  return process.env.NODE_ENV === 'development' ? 'development' : 'production'
  //const channel = Constants.manifest.releaseChannel || 'development'
  // !/(test|development|production)/.test(channel) ? 'production' : channel
}

export const objectToArray = obj => {
  if (!obj) return []
  let arr = []
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      let item = obj[key]
      item.key = key
      arr.push(item)
    }
  }
  return arr
}

export const getTextStyle = style => {
  return [
    style,
    I18nManager.isRTL ? { textAlign: 'left' } : { textAlign: 'right' }
  ]
}

export const getEventDetailsText = (event, categories) => {
  return `*כתובת:* ${event.details['address']}\r\n*סוג רכב:* ${
    event.details['car type']
  }\r\n*בעיה:* ${formatEventCategory(categories, event, true)}`
}

export const getUserDetailsText = event => {
  return `*טלפון:* ${event.details['phone number']}\r\n *שם:* ${
    event.details['caller name']
  }`
}

export const formatEventCategory = (categories, event, includeSub) => {
  const category = categories.find(
    category => category.id === event.details.category
  )
  if (!category) {
    return 'לא ידוע'
  }
  const subCategory = category.subCategories
    ? category.subCategories.find(
        subCategory => subCategory.id === event.details.subCategory
      )
    : undefined
  return (
    category.displayName +
    (subCategory && includeSub ? ' - ' + subCategory.displayName : '')
  )
}

export const formatEventTime = event => {
  return dateFormat(new Date(event.timestamp), 'd/m HH:MM')
}

export const getEventStatus = event => {
  return event.status
}

export const getGoogleMapsUrl = (event, usePlusCode) => {
  const {
    details: { geo, plus_code }
  } = event
  return `https://www.google.com/maps/search/?api=1&query=${
    usePlusCode ? encodeURIComponent(plus_code) : `${geo.lat},${geo.lon}`
  }`
}

export const eventsToCSV = (categories, dispatchers, volunteers, events) => {
  let buffer = 'זמן, כתובת, שם, רכב, מקרה, פרטים, טלפון, מוקדן, כונן, מקור'
  buffer += '\n'
  events.map(event => {
    if (event.status === EventStatus.Completed) {
      const details = event.details
      buffer +=
        `${formatEventTime(event)},"${formatCSVCell(
          details.address
        )}",${formatCSVCell(details['caller name'])},${formatCSVCell(
          details['car type']
        )},${formatEventCategory(categories, event, true)},"${formatCSVCell(
          details['more']
        )}",${details['phone number']},` +
        `${formatCSVCell(
          getEventDispatcher(dispatchers, event)
        )},${formatCSVCell(getEventVolunteer(volunteers, event))},` +
        (event.source === EventSource.FB_BOT ? 'בוט' : 'אפליקציה') +
        '\n'
    }
  })
  return buffer
}

const formatCSVCell = data => {
  if (!data) {
    return ''
  }
  return data.replace(/(["])/g, '-').replace(/([\r\n])/g, ';')
}

const getEventDispatcher = (dispatchers, event) => {
  const dispatcher = dispatchers[event.dispatcher]
  return dispatcher ? dispatcher.name : ''
}

const getEventVolunteer = (volunteers, event) =>
  event.assignedTo ? event.assignedTo.name : ''
