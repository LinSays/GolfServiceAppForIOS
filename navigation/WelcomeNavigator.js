import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'

// import HeaderLeftButton from '../components/HeaderLeftButton'
import { SCREEN_NAMES } from '../constants/Globals'

// import RegistrationDoneScreen from '../screens/RegistrationDoneScreen'
import WelcomeScreen from '../screens/WelcomeScreen'
import { Colors } from '../constants/Colors'
import LastStepScreen from '../screens/LastStepScreen'
import SetupProfileScreen from '../screens/SetupProfileScreen'
// import ProfileConfirmScreen from '../screens/ProfileConfirmScreen'
import { StyleSheet } from 'react-native'

const WelcomeStack = createStackNavigator()

export default function WelcomeNavigator({ navigation }) {
  return (
    <WelcomeStack.Navigator
      initialRouteName={SCREEN_NAMES.WELCOME}
      screenOptions={{ headerTitleAlign: 'center' }}>
      <WelcomeStack.Screen
        name={SCREEN_NAMES.WELCOME}
        component={WelcomeScreen}
        options={{ headerShown: false }}
      />
      <WelcomeStack.Screen
        name={SCREEN_NAMES.LAST_STEP}
        component={LastStepScreen}
        options={{ headerShown: false }}
      />
      <WelcomeStack.Screen
        name={SCREEN_NAMES.SETUP_USER_PROFILE}
        component={SetupProfileScreen}
        options={{
          title: 'Setup User Profile',
          headerLeft: null,
          cardStyle: { backgroundColor: Colors.primaryLight },
        }}
      />
    </WelcomeStack.Navigator>
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
