// Custom Input tool bar for react-native-gifted-chat
import React from 'react'
import { InputToolbar } from 'react-native-gifted-chat'

const CustomInputToolbar = (props) => {
  return (
    <InputToolbar
      {...props}
      containerStyle={{
        backgroundColor: 'transparent',
        paddingLeft: 8,
        paddingRight: 17,
        borderTopWidth: 0,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    />
  )
}

export default CustomInputToolbar
