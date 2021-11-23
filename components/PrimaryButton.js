import React from 'react'
import { StyleSheet, TouchableOpacity, Text, GestureResponderEvent, View } from 'react-native'

import { Colors } from '../constants/Colors'
import SvgIcon from './SvgIcons'
// import { Fonts } from '../constants/Fonts'

const PrimaryButton = ({
  style,
  onPress,
  title,
  disabled,
  alternative,
  icon,
  buttonStyle,
  buttonTextStyle,
}) => {
  const buttonStyles = [
    styles.button,
    ...(alternative ? [styles.buttonAlt] : []),
    ...(disabled ? [styles.buttonDisabled] : []),
    ...(buttonStyle ? [buttonStyle] : []),
  ]

  const buttonTextStyles = [
    styles.buttonText,
    buttonTextStyle,
    ...(alternative ? [styles.buttonTextAlt] : []),
    ...(disabled ? [styles.buttonDisabledText] : []),
  ]

  return (
    <View style={style}>
      <TouchableOpacity
        disabled={disabled}
        style={buttonStyles}
        onPress={(event: GestureResponderEvent) => onPress(event)}>
        {icon ? <SvgIcon type={icon} /> : null}
        <Text style={buttonTextStyles}>{title}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    width: '100%',
    borderRadius: 10,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
  },
  buttonAlt: {
    backgroundColor: Colors.white,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'rgba(211, 215, 217, 0.40)',
  },
  buttonText: {
    height: 24,
    // fontFamily: Fonts.AvenirNextBold,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0,
    textAlign: 'center',
    color: Colors.white,
  },
  buttonTextAlt: {
    color: Colors.primary,
  },
  buttonDisabled: {
    backgroundColor: Colors.disabled,
  },
  buttonDisabledText: {
    color: Colors.extraLight,
  },
})

export default PrimaryButton
