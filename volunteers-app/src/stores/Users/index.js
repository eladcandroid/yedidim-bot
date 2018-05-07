import { types, applySnapshot, destroy } from 'mobx-state-tree'
import { reaction } from 'mobx'
import onUsersChange from 'io/users'
import User from './User'

const UserStore = types
  .model('UserStore', {
    isInitializing: true,
    users: types.optional(types.array(User), [])
  })
  .views(self => ({
    get dispatchers() {
      return self.users.filter(({ role }) => role === 'dispatcher')
    },
    get volunteers() {
      return self.users.filter(({ role }) => role === 'volunteer')
    },
    get admins() {
      return self.users.filter(({ role }) => role === 'admin')
    }
  }))
  .actions(self => ({
    afterCreate: () => {
      self.disposer = reaction(
        () => self.users.length,
        length => {
          if (length) {
            // If new users were added, set init false
            self.setInitEnded()
          }
        },
        { delay: 2000 } // Debounce to wait for whole list to load
      )
    },
    beforeDestroy: () => {
      self.disposer()
    },
    init: () => {
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
    finish: () => {
      self.unsubscribe()
      self.users.forEach(user => destroy(user))
      self.users.clear()
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
    setInitEnded: () => {
      self.isInitializing = false
    },
    removeUser: json => self.users.remove(json)
  }))

export default UserStore
