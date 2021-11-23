import React, { useState } from 'react'
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import auth from '@react-native-firebase/auth'

import Input from '../components/Input'
import PrimaryButton from '../components/PrimaryButton'

import { Colors } from '../constants/Colors'
import { SCREEN_NAMES } from '../constants/Globals'
import { validateEmail } from '../utils/Helper'

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const handleSend = () => {
    if (!validateEmail(email)) {
      Alert.alert('Please input a valid email!')
    } else {
      auth()
        .sendPasswordResetEmail(email)
        .then(() => {
          setEmailSent(true)
        })
        .catch((error) => {
          if (error.code === 'auth/user-not-found') {
            Alert.alert('User not found! Please input a valid email')
          }
        })
    }
  }
  return (
    <ScrollView contentContainerStyle={{ flex: 1, backgroundColor: Colors.white }}>
      <View style={styles.container}>
        <Image source={require('../assets/images/logo.png')} />
        {emailSent ? (
          <>
            <Text style={{ ...styles.title, marginTop: 100 }}>Email has been sent!</Text>
            <Text style={styles.description}>Please check your inbox and click</Text>
            <Text style={styles.description}>in the received link to reset your password.</Text>
            <View style={{ height: 30 }} />
            <PrimaryButton
              title="Login"
              style={{ width: '100%', marginTop: 36 }}
              onPress={() => navigation.navigate(SCREEN_NAMES.LOGIN)}
            />
            <View style={{ flexDirection: 'row', marginTop: 36 }}>
              <Text style={styles.description}>Didn't receive the link?</Text>
              <TouchableOpacity onPress={handleSend}>
                <Text style={styles.login}>Resend</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.description}>Enter your registered email below</Text>
            <Text style={styles.description}>to receive password reset instruction.</Text>
            <View style={{ height: 30 }} />
            <Input
              placeholder="Email"
              autoCompleteType="email"
              textContentType="emailAddress"
              autoCapitalize="words"
              returnKeyType="go"
              blurOnSubmit={false}
              value={email}
              onChangeText={setEmail}
            />
            <View style={{ flexDirection: 'row', marginTop: 47 }}>
              <Text style={styles.description}>Remember password?</Text>
              <TouchableOpacity onPress={() => navigation.navigate(SCREEN_NAMES.LOGIN)}>
                <Text style={styles.login}>Login</Text>
              </TouchableOpacity>
            </View>
            <PrimaryButton title="Send" style={styles.button} onPress={handleSend} />
          </>
        )}
      </View>
    </ScrollView>
  )
}

export default ForgotPasswordScreen

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
    marginBottom: 100,
  },
  login: { color: Colors.blue, fontSize: 17, lineHeight: 22, marginLeft: 5 },
})
