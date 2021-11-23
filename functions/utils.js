const axios = require('axios')

const GHIN_API_URL = 'https://api.ghin.com/api/v1'

exports.verifyGhin = async (ghinNumber, lastName, remember_me) => {
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
    console.error(error.message)
    return { error }
  }
}

exports.getAssociations = async (ghin, token) => {
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

exports.getScores = async (ghin, page, limit, token) => {
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

exports.removeDuplicates = (data, key) => {
  return [...new Map(data.map((x) => [key(x), x])).values()]
}
