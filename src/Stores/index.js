import Authentication from 'Stores/Authentication'
import { Constants } from 'expo'
import firebase from 'firebase'
import Config from '../../Config.json'

// Initialise firebase
const fbApp = firebase.initializeApp(
  Config.firebase[Constants.manifest.extra.instance]
)

export default () => ({
  Authentication: new Authentication(fbApp)
})
