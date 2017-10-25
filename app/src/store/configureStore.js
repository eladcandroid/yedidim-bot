import { createStore, applyMiddleware  } from 'redux';
import thunk from 'redux-thunk';
import reducers from '../reducers';

const configureStore = createStore(
  reducers,
  {dataSource: {instance: Expo.Constants.manifest.extra.instance, version: Expo.Constants.manifest.version}},
  applyMiddleware(thunk),
);

export default configureStore;
