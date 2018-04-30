import { types, applySnapshot } from 'mobx-state-tree'
import onUsersChange from 'io/users'
import User from './User'

const UserStore = types
  .model('UserStore', {
    isInitializing: true,
    users: types.optional(types.array(User), [])
  })
  .actions(self => ({
    afterCreate: () => {
      self.unsubscribe = onUsersChange(({ event, data }) => {
        if (event === 'child_added') {
          self.addUser(data)
        } else if (event === 'child_changed') {
          self.updateUser(data)
        } else if (event === 'child_removed') {
          self.removeUser(data)
        }
      })
    },
    beforeDestroy: () => {
      self.unsubscribe()
    },
    addUser: json => {
      self.users.push(json)
    },
    updateUser: json => {
      const user = self.users.find(({ id }) => id === json.id)
      if (user) {
        applySnapshot(user, json)
      }
    },
    removeUser: json => self.users.remove(json)
  }))

export default UserStore
