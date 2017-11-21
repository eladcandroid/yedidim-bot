import { AsyncStorage } from 'react-native'

const STORAGE_KEY = '@YedidimNative:events'

export async function eventIds() {
  const serialEvents = await AsyncStorage.getItem(STORAGE_KEY)
  if (!serialEvents) {
    // Set initial value, if not present
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({}))
    return []
  }
  // Parse existing and return keys
  return Object.keys(JSON.parse(serialEvents))
}

export async function addEventId(eventId) {
  const newEvent = {}
  newEvent[eventId] = true
  return AsyncStorage.mergeItem(STORAGE_KEY, JSON.stringify(newEvent))
}

export async function clear() {
  return AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({}))
}
