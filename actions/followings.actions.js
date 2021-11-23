import { Actions } from '.'
import { createFollowing, deleteFollowing, fetchFollowings } from '../utils/DataUtils'

export const setFollowingsData = (data) => ({ type: Actions.SET_FOLLOWINGS, data })
export const addFollowing = (data) => ({ type: Actions.ADD_FOLLOWING, data })
export const removeFollowing = (data) => ({ type: Actions.DELETE_FOLLOWING, data })
export const removeFollower = (data) => ({ type: Actions.DELETE_FOLLOWER, data })

export const fetchFollowingsData = () => async (dispatch, getState) => {
  const { id: userId } = getState().user
  if (!userId) return false

  try {
    const res = await fetchFollowings(userId)
    if (res.status !== 'success') return false
    dispatch(setFollowingsData(res.data))
  } catch (err) {
    return false
  }
}

export const addFollowingData = (userId, follower, cb) => async (dispatch, getState) => {
  try {
    const res = await createFollowing(userId, follower)
    if (cb) cb()
    if (res.status !== 'success') return false
    dispatch(addFollowing(res.data))
  } catch (err) {
    return false
  }
}

export const removeFollowingData =
  (userId, follower, cb, type = 'following') =>
  async (dispatch, getState) => {
    try {
      const res = await deleteFollowing(userId, follower)
      if (cb) cb()
      if (res.status !== 'success') return false

      if (type === 'follower') dispatch(removeFollower({ userId, follower }))
      else dispatch(removeFollowing({ userId, follower }))
    } catch (err) {
      return false
    }
  }
