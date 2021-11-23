import { Actions } from '../actions'

const defaultState = {
  events: [],
  hiddenEvents: [],
}

export default (state = defaultState, action) => {
  switch (action.type) {
    case Actions.SET_EVENTS: {
      return { ...state, events: action.data }
    }
    case Actions.SET_HIDDEN_EVENTS: {
      return { ...state, hiddenEvents: action.data }
    }
    default:
      return state
  }
}
