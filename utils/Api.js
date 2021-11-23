// Dealing with GHIN api

import axios from 'axios'
import { WEATHER_APP_KEY } from '../config'
import { GHIN_API_URL, WEATHER_API_URL } from '../constants/Globals'

export const getAssociations = async (ghin, token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  }
  try {
    const response = await axios.get(`${GHIN_API_URL}/golfers/${ghin}/associations.json`, config)

    if (!response.data.Associations) {
      return { status: 'failed', error: 'Failed to get Associations' }
    }
    return response.data.Associations
  } catch (error) {
    return { error }
  }
}

export const getScores = async (ghin, page, limit, token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  }
  try {
    const response = await axios.get(
      `${GHIN_API_URL}/scores/get_all.json?golfer_id=${ghin}&page=${page}&per_page=${limit}`,
      config,
    )

    if (!response.data.Scores) {
      return { status: 'failed', error: 'Failed to get Scores' }
    }
    return response.data.Scores
  } catch (error) {
    console.error(error)
  }
}

export const getCourses = async (ghin, token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  }
  try {
    const response = await axios.get(
      `${GHIN_API_URL}/golfers/${ghin}/facility_home_courses.json`,
      config,
    )

    if (!response.data.facilities) {
      return { status: 'failed', error: 'Failed to get Scores' }
    }
    return response.data.facilities
  } catch (error) {
    console.error(error)
  }
}

export const getCurrentWeatherInfo = async (location) => {
  const { latitude, longitude } = location

  try {
    const response = await axios.get(
      `${WEATHER_API_URL}/onecall?units=metric&lat=${latitude}&lon=${longitude}&exclude=minutely&appid=${WEATHER_APP_KEY}`,
    )

    if (!response.data) {
      return { status: 'failed', error: 'Failed to get Scores' }
    }

    return response.data
  } catch (error) {
    console.error(error)
  }
}
