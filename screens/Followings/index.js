import React from 'react'
import { View } from 'react-native'

import FollowingsTabNavigator from '../../navigation/FollowingsTabNavigator'

const Followings = ({ route, navigation }) => {
  return (
    <View style={{ flex: 1 }}>
      <FollowingsTabNavigator />
    </View>
  )
}

export default Followings
