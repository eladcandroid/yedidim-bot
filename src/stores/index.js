import RootStore from './Root'
import './firebase'

const createRootStore = snapshot =>
  RootStore.create(snapshot || {}, {
    logger: m => console.log(m), // eslint-disable-line
  })

export default createRootStore
