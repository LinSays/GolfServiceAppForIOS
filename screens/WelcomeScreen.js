import React from 'react'
import { View, Text, ScrollView, StyleSheet, Image, ImageBackground } from 'react-native'
import messaging from '@react-native-firebase/messaging'

import PrimaryButton from '../components/PrimaryButton'
import { Colors } from '../constants/Colors'
import { SCREEN_NAMES } from '../constants/Globals'

const WelcomeScreen = ({ navigation }) => {
  const handleStart = async () => {
    try {
      const authStatus = await messaging().hasPermission()
      const notificationEnabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL
      navigation.navigate(
        notificationEnabled ? SCREEN_NAMES.SETUP_USER_PROFILE : SCREEN_NAMES.LAST_STEP,
      )
    } catch (err) {
      return err
    }
  }

  return (
    <ImageBackground
      source={require('../assets/images/welcome_background.png')}
      style={{ flex: 1, resizeMode: 'cover', justifyContent: 'center' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Image source={require('../assets/images/logo_white.png')} style={styles.logo} />
          <Text style={styles.subTitle}>19th Hole Private</Text>
          <Text style={styles.subTitle}>Golf Club Team</Text>
          <Text style={styles.title}>Welcome!</Text>
          <Text style={styles.description}>
            We are grateful you are here with us and hope you feel great joining this private golf
            community.
          </Text>
          <Text style={styles.description}>
            While we plan to have the best app for you very soon we've already started gradually
            creating the most exclusive and unique features within the app. We are glad to say that
            with your arrival we are growing our private golf community.
          </Text>
          <PrimaryButton
            title="Start"
            style={styles.button}
            buttonStyle={{ backgroundColor: Colors.primaryLight }}
            buttonTextStyle={{ color: Colors.darkGray }}
            onPress={handleStart}
          />
        </View>
      </ScrollView>
    </ImageBackground>
  )
}

export default WelcomeScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 30,
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
  subTitle: {
    fontSize: 20,
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
  button: {
    width: '100%',
    marginVertical: 10,
    marginTop: 40,
  },
})
