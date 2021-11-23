import React from 'react'
import { Dimensions, StyleSheet, Text, View } from 'react-native'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler'

import EventViewScreen from '../screens/EventViewScreen'
import ParticipantScreen from '../screens/ParticipantScreen'

import { Colors } from '../constants/Colors'
import { SCREEN_NAMES } from '../constants/Globals'
import PairingsNavigator from './PairingsNavigator'

const TabBar = ({ state, navigation }) => {
  const { routes, index } = state
  const focusedRoute = routes[index].name
  const detailsTabIsFocused = focusedRoute === SCREEN_NAMES.EVENT_DETAILS_TAB
  const participantTabIsFocused = focusedRoute === SCREEN_NAMES.EVENT_PARTICIPANT_TAB
  const pairingsTabIsFocused = focusedRoute === SCREEN_NAMES.EVENT_PAIRINGS_TAB
  return (
    <View style={styles.top}>
      <TouchableWithoutFeedback onPress={() => navigation.navigate(SCREEN_NAMES.EVENT_DETAILS_TAB)}>
        <View
          style={{
            borderTopLeftRadius: 10,
            borderBottomLeftRadius: 10,
            backgroundColor: detailsTabIsFocused ? Colors.black : Colors.primaryLight,
          }}>
          <Text
            style={{
              ...styles.tab,
              color: detailsTabIsFocused ? Colors.white : Colors.extraLight,
            }}>
            Details
          </Text>
        </View>
      </TouchableWithoutFeedback>
      <TouchableWithoutFeedback
        onPress={() => navigation.navigate(SCREEN_NAMES.EVENT_PARTICIPANT_TAB)}>
        <View
          style={{
            borderLeftWidth: 1,
            borderRightWidth: 1,
            borderColor: Colors.lightGray,
            backgroundColor: participantTabIsFocused ? Colors.black : Colors.primaryLight,
          }}>
          <Text
            style={{
              ...styles.tab,
              color: participantTabIsFocused ? Colors.white : Colors.extraLight,
            }}>
            Participant
          </Text>
        </View>
      </TouchableWithoutFeedback>
      <TouchableWithoutFeedback
        onPress={() => navigation.navigate(SCREEN_NAMES.EVENT_PAIRINGS_TAB)}>
        <View
          style={{
            borderTopRightRadius: 10,
            borderBottomRightRadius: 10,
            backgroundColor: pairingsTabIsFocused ? Colors.black : Colors.primaryLight,
          }}>
          <Text
            style={{
              ...styles.tab,
              color: pairingsTabIsFocused ? Colors.white : Colors.extraLight,
            }}>
            Pairings
          </Text>
        </View>
      </TouchableWithoutFeedback>
    </View>
  )
}

const EventTabNavigator = ({ event, notificationId }) => {
  const Tab = createMaterialTopTabNavigator()

  return (
    <Tab.Navigator
      initialRouteName={SCREEN_NAMES.EVENT_DETAILS_TAB}
      tabBarOptions={{
        labelStyle: { textTransform: 'none' },
      }}
      backBehavior="history"
      tabBar={(props) => <TabBar {...props} />}
      sceneContainerStyle={{
        backgroundColor: Colors.primaryLight,
      }}>
      <Tab.Screen
        name={SCREEN_NAMES.EVENT_DETAILS_TAB}
        children={() => <EventViewScreen event={event} notificationId={notificationId} />}
      />
      <Tab.Screen
        name={SCREEN_NAMES.EVENT_PARTICIPANT_TAB}
        children={() => <ParticipantScreen event={event} />}
      />
      <Tab.Screen
        name={SCREEN_NAMES.EVENT_PAIRINGS_TAB}
        children={() => <PairingsNavigator event={event} />}
      />
    </Tab.Navigator>
  )
}

export default EventTabNavigator

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    padding: 16,
  },

  tab: {
    width: (Dimensions.get('screen').width - 32) / 3,
    paddingVertical: 8,
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
})
