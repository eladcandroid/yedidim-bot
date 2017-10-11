import { createStore, applyMiddleware  } from 'redux';
import thunk from 'redux-thunk';
import reducers from '../reducers';

const configureStore = createStore(
  reducers,
  {dataSource: {instance: Expo.Constants.manifest.extra.instance}},
  applyMiddleware(thunk),
);

export default configureStore;
