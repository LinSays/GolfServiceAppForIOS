import React from 'react'
import { TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Svg, Path } from 'react-native-svg'

const HeaderLeftButton = () => {
  const navigation = useNavigation()

  return (
    <TouchableOpacity
      style={{ marginLeft: 20 }}
      onPress={() => {
        if (navigation.canGoBack()) navigation.goBack()
      }}>
      <Svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <Path
          d="M15 8H1"
          stroke="black"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <Path
          d="M8 15L1 8L8 1"
          stroke="black"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </Svg>
    </TouchableOpacity>
  )
}

export default HeaderLeftButton
