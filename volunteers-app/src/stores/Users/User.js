import { types } from 'mobx-state-tree'

const User = types.model('User', {
  id: types.identifier(),
  name: types.string,
  phone: types.string,
  role: types.optional(
    types.enumeration('Role', ['volunteer', 'dispatcher', 'admin']),
    'volunteer'
  ),
  notificationStatus: types.optional(
    types.enumeration('NotificationStatus', [
      'not-tested',
      'pending',
      'token-error',
      'sending-error',
      'sent',
      'working'
    ]),
    'not-tested'
  ),
  notificationTimestamp: types.maybe(types.Date)
})

export default User
