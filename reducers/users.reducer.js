import { Actions } from '../actions'
import { removeDuplicates } from '../utils/Helper'

const defaultState = {
  searchResult: [],
  allUsers: [],
  offset: 0,
}

export default (state = defaultState, action) => {
  switch (action.type) {
    case Actions.SET_USERS: {
      return { ...state, allUsers: action.data }
    }
    case Actions.ADD_USERS: {
      return {
        ...state,
        allUsers: removeDuplicates([...state.allUsers, ...action.data], (it) => it.id),
      }
    }
    case Actions.SET_OFFSET: {
      return { ...state, offset: action.data }
    }
    case Actions.SET_USERS_SEARCH_RESULT: {
      return { ...state, searchResult: action.data }
    }
    default:
      return state
  }
}
