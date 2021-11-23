import { getUserByQuery } from '../utils/AuthUtils'

export const Actions = {
  // user
  SET_USER_DATA: 'SET_USER_DATA',

  // events
  SET_EVENTS: 'SET_EVENTS',
  SET_HIDDEN_EVENTS: 'SET_HIDDEN_EVENTS',

  // rooms
  SET_ROOMS: 'SET_ROOMS',
  SET_HIDDEN_ROOMS: 'SET_HIDDEN_ROOMS',
  SET_IS_FETCHED: 'SET_IS_FETCHED',

  // followings
  SET_FOLLOWINGS: 'SET_FOLLOWINGS',
  ADD_FOLLOWING: 'ADD_FOLLOWING',
  DELETE_FOLLOWING: 'DELETE_FOLLOWING',
  DELETE_FOLLOWER: 'DELETE_FOLLOWER',

  // users
  SET_USERS: 'SET_USERS',
  ADD_USERS: 'ADD_USERS',
  SET_OFFSET: 'SET_OFFSET',
  SET_USERS_SEARCH_RESULT: 'SET_USERS_SEARCH_RESULT',

  // notifications
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  SET_HAS_NEW_NOTIFICATIONS: 'SET_HAS_NEW_NOTIFICATIONS',

  // general
  SET_CURRENT_EVENT: 'SET_CURRENT_EVENTS',
  SET_IS_LOADING: 'SET_IS_LOADING',
}

export const setUserData = (data) => ({ type: Actions.SET_USER_DATA, data })

export const fetchUserData = (user, cb) => async (dispatch) => {
  try {
    if (!user) return false

    dispatch(setIsLoading(true))
    const res = user.email
      ? await getUserByQuery('', user.email.toLowerCase(), '')
      : await getUserByQuery('', '', user.phoneNumber.substring(1))

    if (res.status !== 'success') {
      if (cb) cb(null)
      return false
    }

    const userData = {
      ...res.users[0],
      data: {
        ...res.users[0].data.user,
      },
    }
    if (cb) cb(userData)
    dispatch(setUserData(userData))
    dispatch(setIsLoading(false))
  } catch (err) {
    dispatch(setIsLoading(false))
    return false
  }
}

export const setCurrentEvent = (data) => ({ type: Actions.SET_CURRENT_EVENT, data })

export const setIsLoading = (data) => ({ type: Actions.SET_IS_LOADING, data })

export const setIsHiddenRoom = (data) => ({ type: Actions.SET_IS_HIDDEN_ROOM, data })
