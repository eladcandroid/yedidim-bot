import { types } from 'mobx-state-tree'

const User = types.model('User', {
  id: types.identifier(),
  name: types.string,
  phone: types.string,
  role: types.optional(
    types.enumeration('Role', ['volunteer', 'dispatcher', 'admin']),
    'volunteer'
  )
})

export default User
