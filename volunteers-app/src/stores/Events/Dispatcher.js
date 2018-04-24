import { types } from 'mobx-state-tree'

export default types.model('Dispatcher', {
  id: types.identifier(),
  name: types.maybe(types.string),
  phone: types.maybe(types.string)
})
