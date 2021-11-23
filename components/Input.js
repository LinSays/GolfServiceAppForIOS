import React, { forwardRef } from 'react'

import { TEXT_INPUT_MAX_LENGTH } from '../constants/Globals'

import {
  TextInput as RNTextInput,
  StyleSheet,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native'

// import { Fonts } from '../constants/Fonts'
import { Colors } from '../constants/Colors'
import SvgIcon from './SvgIcons'

const Input = forwardRef((props, forwardedRef) => {
  const {
    style,
    iconType,
    maxLength,
    multiline,
    placeholderTextColor,
    onIconPress,
    ...otherProps
  } = props

  return (
    <View style={[styles.container, props.containerStyle]}>
      <RNTextInput
        ref={forwardedRef}
        maxLength={maxLength || TEXT_INPUT_MAX_LENGTH}
        multiline={multiline || false}
        style={[styles.textInput, { ...style, width: iconType ? '90%' : '100%' }]}
        placeholderTextColor={placeholderTextColor || Colors.black}
        {...otherProps}
      />
      {iconType ? (
        <TouchableOpacity onPress={onIconPress}>
          <SvgIcon type={iconType} style={{ marginTop: 10 }} />
        </TouchableOpacity>
      ) : null}
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
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
  },
  textInput: {
    height: Platform.OS === 'ios' ? 34 : 40,
    // fontFamily: Fonts.AvenirNextMedium,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
    color: Colors.black,
  },
})

export default Input
