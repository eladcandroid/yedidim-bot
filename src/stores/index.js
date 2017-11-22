import RootStore from './Root'
import './firebase'
import { getLanguage } from './storage'

const createRootStore = async () => {
  const language = await getLanguage()
  console.log('LANGUAGE', language)
  return RootStore.create(
    {
      language
    },
    {
      logger: m => console.log(m), // eslint-disable-line
    }
  )
}

export default createRootStore
