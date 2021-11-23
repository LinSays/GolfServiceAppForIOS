import * as React from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import { SCREEN_NAMES } from '../constants/Globals'
import { Colors } from '../constants/Colors'

import PairingsScreen from '../screens/PairingsScreen'
import GroupEditScreen from '../screens/GroupEditScreen'

const PairingsStack = createStackNavigator()

export default function PairingsNavigator({ event }) {
  return (
    <PairingsStack.Navigator initialRouteName={SCREEN_NAMES.PAIRINGS_MAIN}>
      <PairingsStack.Screen
        name={SCREEN_NAMES.PAIRINGS_MAIN}
        children={() => <PairingsScreen event={event} />}
        options={{
          title: '',
          headerShown: false,
          cardStyle: { backgroundColor: Colors.primaryLight },
        }}
      />
      <PairingsStack.Screen
        name={SCREEN_NAMES.PAIRINGS_GROUP_EDIT}
        children={() => <GroupEditScreen event={event} />}
        options={{
          title: '',
          headerShown: false,
          cardStyle: { backgroundColor: Colors.primaryLight },
        }}
      />
    </PairingsStack.Navigator>
  )
}
