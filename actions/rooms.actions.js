import { Actions } from '.'
import { deleteRoom, getAllRooms, hideRoom } from '../utils/DataUtils'

export const setRoomsData = (data) => ({ type: Actions.SET_ROOMS, data })
export const setHiddenRooms = (data) => ({ type: Actions.SET_HIDDEN_ROOMS, data })
export const setIsFetched = (data) => ({ type: Actions.SET_IS_FETCHED, data })

export const fetchRoomsData =
  (isHiddenRoomOnly = false, cb) =>
  async (dispatch, getState) => {
    if (!getState().user.data) return false
    try {
      const { phoneNumber, hiddenRooms } = getState().user.data
      const res = await getAllRooms(
        hiddenRooms || [],
        isHiddenRoomOnly,
        phoneNumber,
        getState().user.id,
      )
      if (cb) cb()
      if (res.status !== 'success') return false

      if (!isHiddenRoomOnly) dispatch(setRoomsData(res.data))
      else dispatch(setHiddenRooms(res.data))

      dispatch(setIsFetched(true))
    } catch (err) {
      return false
    }
  }

export const deleteRoomData = (id) => async (dispatch, getState) => {
  if (!id) return false

  try {
    const res = await deleteRoom(id)
    if (res.status !== 'success') return false
    const rooms = getState().rooms.rooms.filter((room) => room.id !== id)
    const hiddenRooms = getState().rooms.hiddenRooms.filter((room) => room.id !== id)
    dispatch(setRoomsData(rooms))
    dispatch(setHiddenRooms(hiddenRooms))
  } catch (err) {
    return false
  }
}

export const updateRoomStatus = (room, status) => async (dispatch, getState) => {
  if (!room) return false

  try {
    const userData = getState().user
    const res = await hideRoom(room.id, userData.id, status === 'hidden')
    if (res.status !== 'success') return false
    const { rooms, hiddenRooms } = getState().rooms
    const updatedRooms =
      status === 'hidden' ? rooms.filter((item) => item.id !== room.id) : [...rooms, room]
    const updatedHiddenRooms =
      status === 'hidden'
        ? [...hiddenRooms, room]
        : hiddenRooms.filter((item) => item.id !== room.id)
    dispatch(setRoomsData(updatedRooms))
    dispatch(setHiddenRooms(updatedHiddenRooms))
    dispatch(
      setUserData({
        ...userData,
        data: { ...userData.data, hiddenRooms: updatedHiddenRooms.map((r) => r.id) },
      }),
    )
  } catch (err) {
    return false
  }
}
