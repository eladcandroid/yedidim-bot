import dateFormat from 'dateformat';
import { EventSource, EventStatus } from "../constants/consts";
import { I18nManager } from "react-native";

export const getInstance = () => {
  return (Expo.Constants.manifest.extra && Expo.Constants.manifest.extra.instance) ?
    Expo.Constants.manifest.extra.instance :
      !Expo.Constants.manifest.releaseChannel || Expo.Constants.manifest.releaseChannel === 'default' ? 'production' : Expo.Constants.manifest.releaseChannel;
};

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

export const  getTextStyle = (style) => {
  return [style, I18nManager.isRTL ? {textAlign: 'left'} : {textAlign:'right'}]
};

export const getEventDetailsText = (event, categories) => {
  return `*עיר:* ${event.details['city']}\r\n*כתובת:* ${event.details['address']}\r\n*סוג רכב:* ${event.details['car type']}\r\n*בעיה:* ${formatEventCategory(categories, event, true)}`;
};

export const getUserDetailsText = (event) => {
  return `*טלפון:* ${event.details['phone number']}\r\n *שם:* ${event.details['caller name']}`;
};


export const formatEventCategory = (categories, event, includeSub) => {
  const category = categories.find(category => category.id === event.details.category);
  if (!category) {
    return 'לא ידוע';
  }
  const subCategory = (category.subCategories !== null) ? category.subCategories.find(subCategory => subCategory.id === event.details.subCategory) : undefined;
  return category.displayName + (subCategory && includeSub ? (' - ' + subCategory.displayName) : '');
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

export const eventsToCSV = (categories, events) => {
  let buffer = "זמן, כתובת, שם, רכב, מקרה, פרטים, טלפון, מקור";
  buffer += '\n';
  events.map(event => {
    if (event.status === EventStatus.Completed) {
      const details = event.details;
      buffer += `${formatEventTime(event)},"${formatCSVCell(details.address)}",${formatCSVCell(details['caller name'])},${formatCSVCell(details['car type'])},${formatEventCategory(categories, event, true)},"${formatCSVCell(details['more'])}",${details['phone number']},` +
        (event.source === EventSource.FB_BOT ? 'בוט' : 'אפליקציה') + '\n';
    }
  });
  return buffer;
};

const formatCSVCell = (data) => {
  if (!data){
    return '';
  }
  return data.replace(/(["])/g, "-").replace(/([\r\n])/g, ";");
};
