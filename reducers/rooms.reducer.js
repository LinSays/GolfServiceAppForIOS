import { Actions } from '../actions'

const defaultState = {
  rooms: [],
  hiddenRooms: [],
  isFetched: false,
}

export default (state = defaultState, action) => {
  switch (action.type) {
    case Actions.SET_ROOMS: {
      return { ...state, rooms: action.data }
    }
    case Actions.SET_HIDDEN_ROOMS: {
      return { ...state, hiddenRooms: action.data }
    }
    case Actions.SET_IS_FETCHED: {
      return { ...state, isFetched: action.data }
    }
    default:
      return state
  }
}
