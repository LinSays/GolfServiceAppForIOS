import React from 'react'
import { Linking, Text, TouchableOpacity } from 'react-native'
import { Colors } from '../constants/Colors'

const LinkText = ({ text, url, style, textStyle }) => (
  <TouchableOpacity style={{ ...style, marginHorizontal: 5 }} onPress={() => Linking.openURL(url)}>
    <Text style={{ ...textStyle, color: Colors.blue }}>{text}</Text>
  </TouchableOpacity>
)

export default LinkText
