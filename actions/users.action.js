import { Actions, setIsLoading } from '.'
import { getUsersByName, getUsersByOffset } from '../utils/DataUtils'

export const setUsers = (data) => ({ type: Actions.SET_USERS, data })

export const addUsers = (data) => ({ type: Actions.ADD_USERS, data })

export const setSearchResult = (data) => ({ type: Actions.SET_USERS_SEARCH_RESULT, data })

export const setOffset = (data) => ({ type: Actions.SET_OFFSET, data })

export const fetchUsers = (limit, searchTerm) => async (dispatch, getState) => {
  if (!limit) return false

  try {
    dispatch(setIsLoading(true))
    if (searchTerm) {
      const res = await getUsersByName(searchTerm, limit)
      if (res.status !== 'success') return false
      dispatch(setSearchResult(res.users))
      dispatch(setIsLoading(false))
    } else {
      const res = await getUsersByOffset(0, limit)
      if (res.status !== 'success') return false
      if (res.users.length) {
        dispatch(setUsers(res.users))
        dispatch(setOffset(Number(res.users[res.users.length - 1].created) + 1))
      }
      dispatch(setIsLoading(false))
    }
  } catch (err) {
    dispatch(setIsLoading(false))
    return err
  }
}

export const fetchMoreUsers = (limit, cb) => async (dispatch, getState) => {
  if (!limit) return false

  try {
    const { offset } = getState().users
    const res = await getUsersByOffset(offset, limit)
    if (cb) cb()
    if (res.status !== 'success') return false
    if (res.users.length) {
      dispatch(addUsers(res.users))
      dispatch(setOffset(Number(res.users[res.users.length - 1].created) + 1))
    }
  } catch (err) {
    return err
  }
}
