import Authentication from 'Stores/Authentication'

export default fbApp => ({
  Authentication: new Authentication(fbApp)
})
