import { AsyncStorage } from 'react-native'

const EVENTS_STORAGE_KEY = '@YedidimNative:events'
const LANGUAGE_STORAGE_KEY = '@YedidimNative:language'

export async function eventIds() {
  const serialEvents = await AsyncStorage.getItem(EVENTS_STORAGE_KEY)
  if (!serialEvents) {
    // Set initial value, if not present
    await AsyncStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify({}))
    return []
  }
  // Parse existing and return keys
  return Object.keys(JSON.parse(serialEvents))
}

export async function addEventId(eventId) {
  const newEvent = {}
  newEvent[eventId] = true
  return AsyncStorage.mergeItem(EVENTS_STORAGE_KEY, JSON.stringify(newEvent))
}

export async function clear() {
  return AsyncStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify({}))
}

export async function getLanguage() {
  return (await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)) || 'en'
}

export async function setLanguage(language) {
  return AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language)
}
