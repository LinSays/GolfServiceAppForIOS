import { Actions, setIsLoading } from '.'
import { getNotificationsByUserId } from '../utils/DataUtils'

export const setNotifications = (data) => ({ type: Actions.SET_NOTIFICATIONS, data })
export const setHasNewNotifications = (data) => ({ type: Actions.SET_HAS_NEW_NOTIFICATIONS, data })

export const getNotifications = (userId) => async (dispatch) => {
  if (!userId) return false
  try {
    dispatch(setIsLoading(true))
    const res = await getNotificationsByUserId(userId)
    dispatch(setIsLoading(false))

    if (res.status !== 'success') {
      return false
    }

    const sorted = res.notifications.sort((a, b) => b.created - a.created)

    dispatch(setNotifications(sorted))
  } catch (err) {
    dispatch(setIsLoading(false))
    return false
  }
}
