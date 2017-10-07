import { combineReducers } from 'redux';
import { dataSourceReducer } from "./dataSourceReducer";

const reducers =
  combineReducers({
    dataSource: dataSourceReducer,
  });

export default reducers;