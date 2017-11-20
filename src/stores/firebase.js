import { Constants } from 'expo'
import firebase from 'firebase'
import Config from '../../Config.json'

// Initialise firebase
firebase.initializeApp(Config.firebase[Constants.manifest.extra.instance])
