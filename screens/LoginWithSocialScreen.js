import React, { useContext, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions, Platform } from 'react-native'
import auth from '@react-native-firebase/auth'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview'
import { LoginManager, AccessToken } from 'react-native-fbsdk'
import PhoneInput from 'react-native-phone-input'
import { appleAuth } from '@invertase/react-native-apple-authentication'

import { Colors } from '../constants/Colors'
import { SCREEN_NAMES } from '../constants/Globals'

import { isset, validatePhoneNumber } from '../utils/Helper'

import SvgIcon from '../components/SvgIcons'
import PrimaryButton from '../components/PrimaryButton'
import { AuthContext } from '../context/AuthContext'
import axios from 'axios'
import { getUserByQuery } from '../utils/AuthUtils'
import LoadingModal from '../components/LoadingModal'
import { GoogleSignin } from '@react-native-google-signin/google-signin'

const LoginWithSocialScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const authContext = useContext(AuthContext)
  const { setIsFromRegister } = authContext
  const screenWidth = Dimensions.get('screen').width

  const handleSendCode = () => {
    // Request to send OTP
    if (validatePhoneNumber(phoneNumber)) {
      auth()
        .signInWithPhoneNumber(phoneNumber)
        .then((confirm) => {
          navigation.navigate(SCREEN_NAMES.OTP_SCREEN, { confirm, phoneNumber })
        })
        .catch((error) => {
          Alert.alert(error.message)
        })
    } else {
      Alert.alert('Invalid Phone Number')
    }
  }

  const onFacebookButtonPress = async () => {
    setIsLoading(true)
    try {
      const result = await LoginManager.logInWithPermissions(['public_profile', 'email'])
      if (result.isCancelled) {
        throw 'User cancelled the login process'
      }
      const data = await AccessToken.getCurrentAccessToken()
      if (!data) {
        throw 'Something went wrong obtaining access token'
      }
      const fbUserData = await axios.get(
        `https://graph.facebook.com/v9.0/me?fields=email&access_token=${data.accessToken}`,
      )
      if (isset(() => fbUserData.data.email)) {
        const userRes = await getUserByQuery('', fbUserData.data.email, '')
        if (!userRes.users || !userRes.users.length) setIsFromRegister(true)
      }
      const facebookCredential = auth.FacebookAuthProvider.credential(data.accessToken)
      auth().signInWithCredential(facebookCredential)
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
    }
  }

  const onAppleButtonPress = async () => {
    // Start the sign-in request
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.IMPLICIT,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    })

    // Ensure Apple returned a user identityToken
    if (!appleAuthRequestResponse.identityToken) {
      throw 'Apple Sign-In failed - no identify token returned'
    }

    const { identityToken, nonce } = appleAuthRequestResponse

    // Create a Firebase credential from the response
    const appleCredential = auth.AppleAuthProvider.credential(identityToken, nonce)

    // Sign the user in with the credential
    return auth().signInWithCredential(appleCredential)
  }

  const onGoogleButtonPress = async () => {
    GoogleSignin.configure({
      webClientId: '611181344656-51l2rih9k3fnpqrn780lpbrnde6klngg.apps.googleusercontent.com',
    })
    // Get the users ID token
    await GoogleSignin.signOut()
    const { idToken } = await GoogleSignin.signIn()

    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken)

    // // Sign-in the user with the credential
    return auth().signInWithCredential(googleCredential)
  }

  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
      <View style={styles.container}>
        <Text style={styles.title}>Sign In</Text>
        <Text style={styles.description}>Join the most exclusive</Text>
        <Text style={styles.description}>Golf Community</Text>
        <View style={{ marginBottom: 78 }} />
        <PhoneInput
          style={{
            width: '100%',
            flexDirection: 'row',
            borderBottomColor: Colors.extraLight,
            borderBottomWidth: 1,
            height: 48,
            paddingTop: 8,
            paddingBottom: 0,
            marginBottom: 16,
            justifyContent: 'space-between',
            backgroundColor: 'transparent',
          }}
          textStyle={{
            color: Colors.black,
          }}
          initialCountry="us"
          onChangePhoneNumber={setPhoneNumber}
        />
        <PrimaryButton
          title="Sign In"
          style={{ width: '100%', marginVertical: 10 }}
          onPress={handleSendCode}
        />
        <Text style={styles.continueWith}>Or Continue with</Text>
        <TouchableOpacity style={{ width: '100%' }} onPress={onFacebookButtonPress}>
          <View style={styles.facebook}>
            <SvgIcon
              type="facebook"
              style={{
                marginLeft: screenWidth > 400 ? -60 : -30,
                marginRight: screenWidth > 400 ? 60 : 30,
              }}
            />
            <Text style={styles.label}>Continue With Facebook</Text>
          </View>
        </TouchableOpacity>
        <View style={{ height: 15 }} />
        {Platform.OS === 'android' ? (
          <TouchableOpacity style={{ width: '100%' }} onPress={onGoogleButtonPress}>
            <View style={styles.google}>
              <View
                style={{
                  width: 45,
                  height: 45,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 2,
                  backgroundColor: Colors.white,
                  marginLeft: screenWidth > 400 ? -90 : -40,
                  marginRight: screenWidth > 400 ? 50 : 40,
                }}>
                <SvgIcon type="google" />
              </View>
              <Text style={styles.label}>Continue With Google</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={{ width: '100%' }} onPress={onAppleButtonPress}>
            <View style={styles.apple}>
              <SvgIcon
                type="apple"
                style={{
                  marginLeft: screenWidth > 400 ? -70 : -40,
                  marginRight: screenWidth > 400 ? 70 : 40,
                }}
              />
              <Text style={styles.label}>Continue With Apple</Text>
            </View>
          </TouchableOpacity>
        )}
        <View style={{ height: 15 }} />
        {isLoading && <LoadingModal />}
      </View>
    </KeyboardAwareScrollView>
  )
}

export default LoginWithSocialScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    paddingVertical: 30,
  },
  facebook: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 17,
    borderRadius: 10,
    backgroundColor: Colors.facebookBlue,
  },
  apple: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 17,
    borderRadius: 10,
    backgroundColor: Colors.black,
  },
  google: {
    flexDirection: 'row',
    width: '100%',
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: Colors.lightBlue,
  },
  label: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 20,
    color: Colors.primary,
  },
  description: {
    fontSize: 17,
    lineHeight: 22,
    textAlign: 'center',
    color: Colors.primary,
  },
  continueWith: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 78,
    color: Colors.primary,
    marginBottom: 29,
  },
})
