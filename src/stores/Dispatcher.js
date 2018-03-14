import { types, getParent } from 'mobx-state-tree'
import { trackEvent } from 'io/analytics'

export const Dispatcher = types.model('Dispatcher', {
  id: types.identifier(),
  name: types.maybe(types.string),
  phone: types.maybe(types.string)
})
