import { Actions } from '../actions'

const defaultState = {
  followers: [],
  followings: [],
}

export default (state = defaultState, action) => {
  switch (action.type) {
    case Actions.SET_FOLLOWINGS: {
      return { followers: action.data.followers, followings: action.data.followings }
    }
    case Actions.ADD_FOLLOWING: {
      return { ...state, followings: state.followings.concat(action.data) }
    }
    case Actions.DELETE_FOLLOWING: {
      return {
        ...state,
        followings: state.followings.filter(
          (following) =>
            following.userId !== action.data.userId || following.follower !== action.data.follower,
        ),
      }
    }
    case Actions.DELETE_FOLLOWER: {
      return {
        ...state,
        followers: state.followers.filter(
          (following) =>
            following.userId !== action.data.userId || following.follower !== action.data.follower,
        ),
      }
    }
    default:
      return state
  }
}
