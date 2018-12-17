import { combineReducers } from 'redux'
import { dataSourceReducer } from './dataSourceReducer'
import { sentryReducer } from './sentryReducer'

const reducers = combineReducers({
  dataSource: dataSourceReducer,
  sentry: sentryReducer
})

export default reducers
