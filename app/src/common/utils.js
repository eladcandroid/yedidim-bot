import dateFormat from 'dateformat';
import { EventCases } from "../constants/consts";

export const objectToArray = (obj) => {
  let arr = [];
  for (const key in obj){
    if (obj.hasOwnProperty(key)) {
      let item = obj[key];
      item.key = key;
      arr.push(item);
    }
  }
  return arr;
};

export const getEventDetailsText = (event) => {
  return `*עיר:* ${event.details['city']}\r\n*כתובת:* ${event.details['address']}\r\n*סוג רכב:* ${event.details['car type']}\r\n*בעיה:* ${formatEventCase(event)}`;
};

export const getUserDetailsText = (event) => {
  return `*טלפון:* ${event.details['phone number']}\r\n *שם:* ${event.details['caller name']}`;
};


export const formatEventCase = (event) => {
  if (!event.details.case && event.details.case !== 0){
    return 'לא ידוע';
  }
  return EventCases[event.details.case];
};

export const formatEventTime = (event) => {
  return dateFormat(new Date(event.timestamp), "d/m HH:MM");
};

export const getEventStatus = (event) => {
  return event.status;
};

export const getGoogleMapsUrl = (event) => {
  return 'https://www.google.com/maps/search/?api=1&query=' + event.details.geo.lat + ',' + event.details.geo.lon;
};
