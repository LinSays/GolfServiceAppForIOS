import { Actions } from '../actions'

const defaultState = {
  id: null,
  data: {},
}

export default (state = defaultState, action) => {
  switch (action.type) {
    case Actions.SET_USER_DATA: {
      return action.data
    }
    default:
      return state
  }
}
