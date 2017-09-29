import { combineReducers } from 'redux';
import { routerReducer } from "react-router-redux";
import { dataSourceReducer } from "./dataSourceReducer";
import { messagingReducer } from "./messagingReducer";

const reducers =
  combineReducers({
    routing: routerReducer,
    dataSource: dataSourceReducer,
    messaging: messagingReducer
  });

export default reducers;