import React, { useContext } from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import AuthNavigator from './AuthNavigator'
import MainNavigator from './MainNavigator'
import WelcomeNavigator from './WelcomeNavigator'
import { AuthContext } from '../context/AuthContext'
import { NAVIGATOR } from '../constants/Globals'

const RootStack = createStackNavigator()

export default function RootNavigator() {
  const authContext = useContext(AuthContext)
  const { user, isFromRegister } = authContext

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {isFromRegister ? (
        <RootStack.Screen name={NAVIGATOR.WELCOME} component={WelcomeNavigator} />
      ) : user ? (
        <RootStack.Screen name={NAVIGATOR.MAIN} component={MainNavigator} />
      ) : (
        <RootStack.Screen name={NAVIGATOR.AUTH} component={AuthNavigator} />
      )}
    </RootStack.Navigator>
  )
}
