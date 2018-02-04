import { AsyncStorage } from 'react-native'
import { defaultLanguage, environment } from 'config'

const LANGUAGE_STORAGE_KEY = `@YedidimNative:language:${environment()}`

export async function getLanguage() {
  return (await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)) || defaultLanguage()
}

export async function setLanguage(language) {
  return AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language)
}
