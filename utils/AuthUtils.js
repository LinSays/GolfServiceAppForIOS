import axios from 'axios'

// import * as Storage from './Storage'
// import * as Constants from '../constants/Globals'
import { BASE_URL } from '../constants/Globals'

export const verifyGhin = async (ghinNumber, lastName, remember_me) => {
  try {
    const response = await axios.get('https://api2.ghin.com/api/v1/public/login.json', {
      params: {
        ghinNumber,
        lastName,
        remember_me,
      },
    })

    if (!response.data.golfers) {
      return { error: 'Invalid GHIN Number or Last Name' }
    }

    return response.data.golfers
  } catch (error) {
    return { error }
  }
}

export const addUser = async (data) => {
  try {
    const response = await axios.post(`${BASE_URL}/users`, data)

    return response.data
  } catch (error) {
    return { error }
  }
}

export const getUserById = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/users/${id}`)
    return response.data
  } catch (error) {
    return { error }
  }
}

export const getUserByQuery = async (id, email, phoneNumber) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/users?id=${id}&email=${email}&phoneNumber=${phoneNumber}`,
    )
    return response.data
  } catch (error) {
    return { error }
  }
}
