import React from 'react'
import { StyleSheet, View, Dimensions } from 'react-native'

import { Colors } from '../constants/Colors'

const BottomSection = ({ style, children }) => {
  return <View style={{ ...style, ...styles.bottom }}>{children}</View>
}

export default BottomSection

const styles = StyleSheet.create({
  bottom: {
    flexDirection: 'row',
    position: 'absolute',
    width: Dimensions.get('window').width,
    height: 100,
    paddingHorizontal: 16,
    paddingVertical: 22,
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 0,
    borderTopColor: Colors.lightGray,
    borderTopWidth: 1,
    backgroundColor: Colors.white,
    zIndex: 0,
  },
})
