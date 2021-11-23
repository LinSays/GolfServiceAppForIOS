import React, { useEffect } from 'react'
import { View, Text, ScrollView, StyleSheet, Image, ImageBackground } from 'react-native'
import messaging from '@react-native-firebase/messaging'

import { Colors } from '../constants/Colors'
import { SCREEN_NAMES } from '../constants/Globals'

const LastStepScreen = ({ navigation }) => {
  useEffect(() => {
    requestUserPermission()
  }, [])

  const requestUserPermission = async () => {
    let authStatus = await messaging().hasPermission()
    const notificationEnabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    if (notificationEnabled) {
      navigation.navigate(SCREEN_NAMES.SETUP_USER_PROFILE)
    } else {
      authStatus = await messaging().requestPermission()
      navigation.navigate(SCREEN_NAMES.SETUP_USER_PROFILE)
    }
  }

  return (
    <ImageBackground
      source={require('../assets/images/last_step_background.png')}
      style={{ flex: 1, resizeMode: 'cover', justifyContent: 'center' }}>
      <ScrollView contentContainerStyle={{ flex: 1 }}>
        <View style={styles.container}>
          <Image source={require('../assets/images/logo_white.png')} style={styles.logo} />
          <Text style={styles.title}>Last Important Step!</Text>
          <Text style={styles.description}>
            Enable notification to know when people are talking
          </Text>
        </View>
      </ScrollView>
    </ImageBackground>
  )
}

export default LastStepScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginHorizontal: 16,
    paddingTop: 100,
  },
  logo: {
    width: 96,
    height: 84,
    marginBottom: 10,
  },
  title: {
    fontSize: 34,
    fontWeight: '600',
    marginVertical: 42,
    color: Colors.white,
  },
  description: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 25,
    lineHeight: 22,
    textAlign: 'center',
    color: Colors.white,
  },
})
