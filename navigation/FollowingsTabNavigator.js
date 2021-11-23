import React from 'react'
import { Dimensions, StyleSheet, Text, View } from 'react-native'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler'

import { Colors } from '../constants/Colors'
import { SCREEN_NAMES } from '../constants/Globals'
import FollowingsScreen from '../screens/Followings/FollowingsScreen'
import FollowersScreen from '../screens/Followings/FollowersScreen'
import { useSelector } from 'react-redux'

const TabBar = ({ state, navigation }) => {
  const followings = useSelector((_state) => _state.followings.followings)
  const followers = useSelector((_state) => _state.followings.followers)
  const { routes, index } = state
  const focusedRoute = routes[index].name
  const followersTabIsFocused = focusedRoute === SCREEN_NAMES.FOLLOWERS_SCREEN
  const followingsTabIsFocused = focusedRoute === SCREEN_NAMES.FOLLOWINGS_SCREEN

  return (
    <View style={styles.top}>
      <TouchableWithoutFeedback onPress={() => navigation.navigate(SCREEN_NAMES.FOLLOWERS_SCREEN)}>
        <View
          style={{
            backgroundColor: followersTabIsFocused ? Colors.black : Colors.primaryLight,
          }}>
          <Text
            style={{
              ...styles.tab,
              color: followersTabIsFocused ? Colors.white : Colors.extraLight,
            }}>
            {followers.length} Followers
          </Text>
        </View>
      </TouchableWithoutFeedback>
      <TouchableWithoutFeedback onPress={() => navigation.navigate(SCREEN_NAMES.FOLLOWINGS_SCREEN)}>
        <View
          style={{
            borderLeftWidth: 1,
            borderRightWidth: 1,
            borderColor: Colors.lightGray,
            backgroundColor: followingsTabIsFocused ? Colors.black : Colors.primaryLight,
          }}>
          <Text
            style={{
              ...styles.tab,
              color: followingsTabIsFocused ? Colors.white : Colors.extraLight,
            }}>
            {followings.length} Followings
          </Text>
        </View>
      </TouchableWithoutFeedback>
    </View>
  )
}

const FollowingsTabNavigator = ({ event, notificationId }) => {
  const Tab = createMaterialTopTabNavigator()

  return (
    <Tab.Navigator
      initialRouteName={SCREEN_NAMES.FOLLOWERS_SCREEN}
      tabBarOptions={{
        labelStyle: { textTransform: 'none' },
      }}
      backBehavior="history"
      tabBar={(props) => <TabBar {...props} />}
      sceneContainerStyle={{
        backgroundColor: Colors.primaryLight,
      }}>
      <Tab.Screen name={SCREEN_NAMES.FOLLOWERS_SCREEN} children={() => <FollowersScreen />} />
      <Tab.Screen name={SCREEN_NAMES.FOLLOWINGS_SCREEN} children={() => <FollowingsScreen />} />
    </Tab.Navigator>
  )
}

export default FollowingsTabNavigator

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    padding: 16,
  },

  tab: {
    width: (Dimensions.get('screen').width - 40) / 2,
    paddingVertical: 8,
    fontWeight: '600',
    fontSize: 13,
    textAlign: 'center',
  },
})
