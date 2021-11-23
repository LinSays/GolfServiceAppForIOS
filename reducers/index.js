import { combineReducers } from 'redux'

// general
import user from './user.reducer'
import events from './events.reducer'
import rooms from './rooms.reducer'
import users from './users.reducer'
import notifications from './notifications.reducer'
import followings from './followings.reducer'
import { Actions } from '../actions'

const allReducers = combineReducers({
  user,
  events,
  rooms,
  users,
  notifications,
  followings,
  isLoading: (state = false, action) => {
    switch (action.type) {
      case Actions.SET_IS_LOADING: {
        return action.data
      }
      default:
        return state
    }
  },
  currentEvent: (state = null, action) => {
    switch (action.type) {
      case Actions.SET_CURRENT_EVENT: {
        return action.data
      }
      default:
        return state
    }
  },
})

export default allReducers
