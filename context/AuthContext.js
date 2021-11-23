import React, { createContext, useEffect, useState } from 'react'
import auth from '@react-native-firebase/auth'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [isFromRegister, setIsFromRegister] = useState(false)
  const [user, setUser] = useState(null)

  const onAuthStateChanged = async (_user) => {
    setUser(_user)
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged)
    return subscriber
  }, [])

  return (
    <AuthContext.Provider value={{ user, isFromRegister, setIsFromRegister }}>
      {children}
    </AuthContext.Provider>
  )
}
