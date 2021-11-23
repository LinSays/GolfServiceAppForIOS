import AsyncStorage from '@react-native-async-storage/async-storage'

export async function setItem(key, value) {
  try {
    return await AsyncStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    // console.error('AsyncStorage#setItem error: '+error,message);
  }
}

export async function getItem(key) {
  const result = await AsyncStorage.getItem(key)
  if (result) {
    try {
      return JSON.parse(result)
    } catch (e) {
      // console.error('AsyncStorage#getItem error deserializing JSON for key: '+key, e.message);
    }
  }
  return result
}

export async function removeItem(key) {
  return await AsyncStorage.removeItem(key)
}
