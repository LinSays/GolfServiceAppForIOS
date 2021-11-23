import React from 'react'
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native'

import PrimaryButton from '../components/PrimaryButton'
import { Colors } from '../constants/Colors'
import { SCREEN_NAMES } from '../constants/Globals'

const RegistrationDoneScreen = ({ navigation }) => (
  <ScrollView contentContainerStyle={{ flex: 1, backgroundColor: Colors.white }}>
    <View style={styles.container}>
      <Image source={require('../assets/images/logo.png')} />
      <Text style={styles.title}>Registration Successful!</Text>
      <Text style={styles.description}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit
      </Text>
      <PrimaryButton
        title="Proceed"
        style={styles.button}
        onPress={() => navigation.navigate(SCREEN_NAMES.WELCOME)}
      />
    </View>
  </ScrollView>
)

export default RegistrationDoneScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginHorizontal: 16,
    paddingTop: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginTop: 58,
    marginBottom: 29,
  },
  description: {
    fontSize: 17,
    lineHeight: 22,
    textAlign: 'center',
    color: Colors.secondaryLight,
  },
  button: {
    width: '100%',
    marginTop: 40,
    position: 'absolute',
    bottom: 0,
    marginBottom: 50,
  },
})
