import { Actions, setIsLoading } from '.'
import { getEventsByPhoneNumber } from '../utils/DataUtils'

export const setEventsData = (data) => ({ type: Actions.SET_EVENTS, data })
export const setHiddenEvents = (data) => ({ type: Actions.SET_HIDDEN_EVENTS, data })

export const fetchEventsData = (phoneNumber) => async (dispatch, getState) => {
  if (!phoneNumber) return false
  try {
    dispatch(setIsLoading(true))
    const { user: userData } = getState()
    const res = await getEventsByPhoneNumber(phoneNumber, userData.data.hiddenEvents || [])
    if (res.status !== 'success') return false
    dispatch(setEventsData(res.events))
    dispatch(setIsLoading(false))
  } catch (err) {
    return false
  }
}

export const fetchHiddenEvents = (phoneNumber) => async (dispatch, getState) => {
  if (!phoneNumber) return false
  try {
    dispatch(setIsLoading(true))
    const { user: userData } = getState()
    const res = await getEventsByPhoneNumber(phoneNumber, userData.data.hiddenEvents || [], true)
    if (res.status !== 'success') return false
    dispatch(setHiddenEvents(res.events))
    dispatch(setIsLoading(false))
  } catch (err) {
    return false
  }
}
