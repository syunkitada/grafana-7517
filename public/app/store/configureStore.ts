import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import sharedReducers from 'app/core/reducers';
import alertingReducers from 'app/features/alerting/state/reducers';
import teamsReducers from 'app/features/teams/state/reducers';
import foldersReducers from 'app/features/folders/state/reducers';
import dashboardReducers from 'app/features/dashboard/state/reducers';

const rootReducer = combineReducers({
  ...sharedReducers,
  ...alertingReducers,
  ...teamsReducers,
  ...foldersReducers,
  ...dashboardReducers,
});

export let store;

export function configureStore() {
  const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

  if (process.env.NODE_ENV !== 'production') {
    // DEV builds we had the logger middleware
    store = createStore(rootReducer, {}, composeEnhancers(applyMiddleware(thunk, createLogger())));
  } else {
    store = createStore(rootReducer, {}, composeEnhancers(applyMiddleware(thunk)));
  }
}
