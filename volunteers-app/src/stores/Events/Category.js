import { types } from 'mobx-state-tree'

const SubCategory = types.model('SubCategory', {
  id: types.identifier(),
  displayName: types.string
})

export default types.model('Category', {
  id: types.identifier(),
  displayName: types.string,
  subCategories: types.maybe(types.array(SubCategory))
})
