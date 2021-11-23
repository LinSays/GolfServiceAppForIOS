import { Actions } from '../actions'

const defaultState = {
  hasNewNotifications: false,
  notifications: [],
}

export default (state = defaultState, action) => {
  switch (action.type) {
    case Actions.SET_NOTIFICATIONS: {
      return { ...state, notifications: action.data }
    }
    case Actions.SET_HAS_NEW_NOTIFICATIONS: {
      return { ...state, hasNewNotifications: action.data }
    }
    default:
      return state
  }
}
