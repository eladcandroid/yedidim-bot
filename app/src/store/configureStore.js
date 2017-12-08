import { createStore, applyMiddleware  } from 'redux';
import thunk from 'redux-thunk';
import reducers from '../reducers';
import { getInstance } from "../common/utils";

const configureStore = createStore(
  reducers,
  {dataSource: {instance: getInstance(), version: Expo.Constants.manifest.version}},
  applyMiddleware(thunk),
);

export default configureStore;
