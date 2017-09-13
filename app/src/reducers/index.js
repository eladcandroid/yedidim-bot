import { combineReducers } from 'redux';
import { routerReducer } from "react-router-redux";
import { dataSourceReducer } from "./dataSourceReducer";

const reducers =
  combineReducers({
    routing: routerReducer,
    dataSource: dataSourceReducer
  });

export default reducers;