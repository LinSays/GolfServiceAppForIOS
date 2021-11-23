import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'

const CircleIcon = ({ bkgColor, children, onPress, width = 42 }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={{
          ...styles.container,
          backgroundColor: bkgColor,
          width,
          flexDirection: width && 'row',
        }}>
        {children}
      </View>
    </TouchableOpacity>
  )
}

export default CircleIcon

const styles = StyleSheet.create({
  container: {
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
    marginRight: 5,
  },
})
