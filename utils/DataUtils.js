// Dealing with Firestore

import axios from 'axios'
import qs from 'qs'

import { BASE_URL } from '../constants/Globals'

export const getUsersByOffset = async (offset, limit) => {
  try {
    const response = await axios.get(`${BASE_URL}/users?offset=${offset}&limit=${limit}`)
    return response.data
  } catch (error) {
    return { error }
  }
}

export const getUsersByName = async (searchTerm, limit) => {
  try {
    const response = await axios.get(`${BASE_URL}/users?limit=${limit}&searchTerm=${searchTerm}`)
    return response.data
  } catch (error) {
    return { error }
  }
}

export const updateUserDataById = async (id, data) => {
  try {
    const response = await axios.put(`${BASE_URL}/users/${id}`, data)
    return response.data
  } catch (error) {
    return { error }
  }
}

export const addEvent = async (data) => {
  try {
    const response = await axios.post(`${BASE_URL}/events`, data)
    return response.data
  } catch (error) {
    return { error }
  }
}

export const getEventsByPhoneNumber = async (
  phoneNumber,
  hiddenEvents,
  onlyHiddenEvents = false,
) => {
  try {
    const hiddenEventsStr = encodeURIComponent(JSON.stringify(hiddenEvents))
    const response = await axios.get(
      `${BASE_URL}/events/${phoneNumber}?hiddenEvents=${hiddenEventsStr}&onlyHiddenEvents=${onlyHiddenEvents}`,
    )
    return response.data
  } catch (error) {
    return { error }
  }
}

export const getEventById = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/events?id=${id}`)
    return response.data
  } catch (error) {
    return { error }
  }
}

export const updateEventById = async (id, data) => {
  try {
    const response = await axios.put(`${BASE_URL}/events/${id}`, data)
    return response.data
  } catch (error) {
    return { error }
  }
}

export const deleteEventByID = async (id) => {
  try {
    const response = await axios.delete(`${BASE_URL}/events/${id}`)
    return response.data
  } catch (error) {
    return { error }
  }
}

export const sendSms = async (number, fullName, channelData, isPing) => {
  try {
    const response = await axios.post(`${BASE_URL}/invite`, {
      number,
      fullName,
      channelData,
      isPing,
    })
    return response.data
  } catch (error) {
    return { error }
  }
}

export const addRoom = async (data) => {
  try {
    const response = await axios.post(`${BASE_URL}/rooms`, data)
    return response.data
  } catch (error) {
    return { error }
  }
}

export const updateRoom = async (id, data) => {
  try {
    const response = await axios.put(`${BASE_URL}/rooms/${id}`, data)
    return response.data
  } catch (error) {
    return { error }
  }
}

export const deleteRoom = async (roomId) => {
  try {
    const response = await axios.delete(`${BASE_URL}/rooms/${roomId}`)
    return response.data
  } catch (error) {
    return { error }
  }
}

export const getRoomDetails = async (roomId) => {
  try {
    const response = await axios.get(`${BASE_URL}/rooms/${roomId}`)
    return response.data
  } catch (error) {
    return { error }
  }
}

export const hideRoom = async (roomId, userId, isHidden) => {
  try {
    const response = await axios.put(`${BASE_URL}/users/${userId}`, { roomId, isHidden })
    return response.data
  } catch (error) {
    return { error }
  }
}

export const getAllRooms = async (hiddenRooms, isHiddenRoom, phoneNumber, ownerId) => {
  try {
    const res = await axios.get(`${BASE_URL}/rooms`, {
      params: {
        isHiddenRoom,
        hiddenRooms,
        phoneNumber,
        ownerId,
      },
      paramsSerializer: (params) => {
        return qs.stringify(params)
      },
    })
    return res.data
  } catch (error) {
    return { error }
  }
}

export const getRoomData = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/rooms?id=${id}`)
    return response.data
  } catch (error) {
    return { error }
  }
}

export const generateToken = async (data) => {
  try {
    const response = await axios.post(`${BASE_URL}/access_token`, data)
    return response.data
  } catch (error) {
    return { error }
  }
}

export const generateRtmToken = async (data) => {
  try {
    const response = await axios.post(`${BASE_URL}/rtm_token`, data)
    return response.data
  } catch (error) {
    return { error }
  }
}

export const updateContacts = async (data) => {
  try {
    const response = await axios.post(`${BASE_URL}/contacts`, data)
    return response.data
  } catch (error) {
    return { error }
  }
}

export const getNotificationsByUserId = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/notifications/${userId}`)
    return response.data
  } catch (error) {
    return { error }
  }
}

export const updateNotificationById = async (notificationId, data) => {
  try {
    const response = await axios.put(`${BASE_URL}/notifications/${notificationId}`, data)
    return response.data
  } catch (error) {
    return { error }
  }
}

export const deleteNotificationById = async (notificationId) => {
  try {
    const response = await axios.delete(`${BASE_URL}/notifications/${notificationId}`)
    return response.data
  } catch (error) {
    return { error }
  }
}

export const checkNewNotifications = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/notifications/${userId}?active=1`)
    return response.data
  } catch (error) {
    return { error }
  }
}

export const fetchFollowings = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/followings/${userId}`)
    return response.data
  } catch (error) {
    return { error }
  }
}

export const createFollowing = async (userId, follower) => {
  try {
    const response = await axios.post(`${BASE_URL}/followings`, { userId, follower })
    return response.data
  } catch (error) {
    return { error }
  }
}

export const deleteFollowing = async (userId, follower) => {
  try {
    const response = await axios.delete(`${BASE_URL}/followings`, { data: { userId, follower } })
    return response.data
  } catch (error) {
    return { error }
  }
}

export const addChatLogs = async (channelID, messages) => {
  try {
    const response = await axios.post(`${BASE_URL}/chatLogs/${channelID}`, { messages })
    return response.data
  } catch (error) {
    return { error }
  }
}

export const getChatLogs = async (channelID) => {
  try {
    const response = await axios.get(`${BASE_URL}/chatLogs/${channelID}`)
    return response.data
  } catch (error) {
    return { error }
  }
}
