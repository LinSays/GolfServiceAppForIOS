import React, { useContext, useEffect, useRef, useState } from 'react'
import auth from '@react-native-firebase/auth'
import { View, Text, StyleSheet, Alert, Keyboard } from 'react-native'
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field'
import LoadingModal from '../components/LoadingModal'
import PrimaryButton from '../components/PrimaryButton'

import { Colors } from '../constants/Colors'
import { formatNumber, isset } from '../utils/Helper'
import { AuthContext } from '../context/AuthContext'
import { getUserByQuery } from '../utils/AuthUtils'

const OtpVerificationScreen = ({ route, navigation }) => {
  const authContext = useContext(AuthContext)
  const { setIsFromRegister } = authContext
  const [value, setValue] = useState('')
  const [confirm, setConfirm] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [disableResend, setDisableResend] = useState(true)
  const [counter, setCounter] = useState(59)
  const ref = useBlurOnFulfill({ value, cellCount: 6 })
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  })
  const id = useRef(null)
  const clear = () => {
    clearInterval(id.current)
  }

  useEffect(() => {
    id.current = setInterval(() => {
      setCounter((prev) => prev - 1)
    }, 1000)
    return () => clear()
  }, [])

  useEffect(() => {
    if (counter === 0) {
      clear()
      setDisableResend(false)
    }
  }, [counter])

  const handleOnBlur = async () => {
    let _confirm = confirm || route.params.confirm
    if (_confirm) {
      try {
        setIsLoading(true)
        const userRes = await getUserByQuery('', '', route.params.phoneNumber.substring(1))
        await _confirm.confirm(value)
        if (!userRes.users || !userRes.users.length) setIsFromRegister(true)
      } catch (error) {
        Alert.alert('Error!', 'Invalid code.')
      }
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (isset(() => route.params.phoneNumber)) {
      setDisableResend(true)
      id.current = setInterval(() => {
        setCounter((prev) => (prev === 0 ? 59 : prev - 1))
      }, 1000)
      auth()
        .signInWithPhoneNumber(route.params.phoneNumber)
        .then((_confirm) => {
          setConfirm(_confirm)
        })
    }
  }
  return (
    <View style={styles.root} onPress={Keyboard.dismiss}>
      <Text style={styles.title}>Verification Code</Text>
      <Text style={styles.description}>OTP code has been sent to</Text>
      {isset(() => route.params.phoneNumber) ? (
        <Text style={styles.description}>{route.params.phoneNumber}</Text>
      ) : null}
      <View style={{ marginTop: 54 }} />
      <CodeField
        ref={ref}
        {...props}
        // Use `caretHidden={false}` when users can't paste a text value, because context menu doesn't appear
        value={value}
        onChangeText={setValue}
        cellCount={6}
        rootStyle={styles.codeFieldRoot}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        renderCell={({ index, symbol, isFocused }) => (
          <View
            key={index}
            style={[styles.cell, isFocused && styles.focusCell]}
            onLayout={getCellOnLayoutHandler(index)}>
            <Text style={{ fontSize: 30, textAlign: 'center' }}>
              {symbol || (isFocused ? <Cursor /> : null)}
            </Text>
          </View>
        )}
        onBlur={handleOnBlur}
      />
      <Text style={styles.text}>Didn't Received the Code?</Text>
      <Text style={{ fontSize: 22, fontWeight: '600', marginTop: 5, textAlign: 'center' }}>
        00:{formatNumber(counter)}
      </Text>
      <PrimaryButton
        title="Resend Code"
        disabled={disableResend}
        style={{ marginTop: 25 }}
        onPress={handleResendCode}
      />
      {isLoading && <LoadingModal />}
    </View>
  )
}

export default OtpVerificationScreen

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 20,
    color: Colors.primary,
    textAlign: 'center',
  },
  description: {
    fontSize: 17,
    lineHeight: 22,
    textAlign: 'center',
    color: Colors.primary,
  },
  root: { flex: 1, padding: 20 },
  codeFieldRoot: { marginTop: 20 },
  cell: {
    width: 40,
    height: 40,
    lineHeight: 38,
    fontSize: 24,
    borderBottomWidth: 2,
    borderBottomColor: Colors.extraLight,
    textAlign: 'center',
  },
  focusCell: {
    borderColor: '#000',
  },
  text: {
    marginTop: 20,
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
})
