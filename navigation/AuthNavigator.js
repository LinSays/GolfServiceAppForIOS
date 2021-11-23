import * as React from 'react'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/core'
import { createStackNavigator } from '@react-navigation/stack'
import LoginWithSocialScreen from '../screens/LoginWithSocialScreen'

import { SCREEN_NAMES } from '../constants/Globals'
import { Colors } from '../constants/Colors'

import OtpVerificationScreen from '../screens/OtpVerificationScreen'

const AuthStack = createStackNavigator()

export default function AuthNavigator() {
  const navigation = useNavigation()
  return (
    <AuthStack.Navigator initialRouteName={SCREEN_NAMES.LOGIN}>
      <AuthStack.Screen
        name={SCREEN_NAMES.LOGIN_SOCIAL}
        component={LoginWithSocialScreen}
        options={{
          title: '',
          headerShown: false,

          cardStyle: { backgroundColor: Colors.white },
        }}
      />
      <AuthStack.Screen
        name={SCREEN_NAMES.OTP_SCREEN}
        component={OtpVerificationScreen}
        options={{
          title: '',
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.headerText}>Back</Text>
            </TouchableOpacity>
          ),
          headerStyle: { shadowColor: 'transparent' },
          cardStyle: { backgroundColor: Colors.white },
        }}
      />
    </AuthStack.Navigator>
  )
}

const styles = StyleSheet.create({
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.extraLight,
    marginHorizontal: 16,
  },
})
