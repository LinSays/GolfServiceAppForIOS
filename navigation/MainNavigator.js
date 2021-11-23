import React from 'react'
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'

import { SCREEN_NAMES } from '../constants/Globals'
import { Colors } from '../constants/Colors'

import SvgIcon from '../components/SvgIcons'
import { isset } from '../utils/Helper'

import HomeScreen from '../screens/HomeScreen'
import ProfileScreen from '../screens/ProfileScreen'
import EditProfileScreen from '../screens/EditProfileScreen'
import AccountSettingsScreen from '../screens/AccountSettingsScreen'
import EventListScreen from '../screens/EventListScreen'
import EventDateTimeScreen from '../screens/EventDateTimeScreen'
import InvitationScreen from '../screens/InvitationScreen'
import EventDetailsScreen from '../screens/EventDetailsScreen'
import RulesScreen from '../screens/RulesScreen'
import EventScreen from '../screens/EventScreen'
import RoomDetailsScreen from '../screens/RoomDetailsScreen'
import RoomRulesScreen from '../screens/RoomRulesScreen'
import NotificationsScreen from '../screens/NotificationsScreen'
import WeatherForecastScreen from '../screens/WeatherForecastScreen'
import HiddenEvents from '../screens/HiddenEvents'
import { useSelector } from 'react-redux'
import HiddenRooms from '../screens/HiddenRooms'
import SearchScreen from '../screens/SearchScreen'
import ViewProfileScreen from '../screens/ViewProfileScreen'
import Followings from '../screens/Followings'

const MainStack = createStackNavigator()

export default function MainNavigator({ navigation }) {
  const userData = useSelector((state) => state.user)

  return (
    <MainStack.Navigator
      initialRouteName={SCREEN_NAMES.HOME}
      screenOptions={{ headerTitleAlign: 'center' }}>
      <MainStack.Screen
        name={SCREEN_NAMES.HOME}
        component={HomeScreen}
        options={({ route }) => ({
          title: '',
          headerTitleStyle: { fontSize: 20, fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.navigate(SCREEN_NAMES.SEARCH_SCREEN)}>
              <SvgIcon type="search" style={{ marginLeft: 20 }} />
            </TouchableOpacity>
          ),
          cardStyle: { backgroundColor: Colors.primaryLight },
        })}
      />
      <MainStack.Screen
        name={SCREEN_NAMES.PROFILE}
        component={ProfileScreen}
        options={({ route }) => ({
          title: 'Profile',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                navigation.navigate(SCREEN_NAMES.HOME, { id: null })
              }}>
              <Text style={styles.headerText}>Back</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.navigate(SCREEN_NAMES.EDIT_PROFILE)}>
              <Text style={styles.headerText}>Edit</Text>
            </TouchableOpacity>
          ),
          cardStyle: { backgroundColor: Colors.primaryLight },
        })}
      />
      <MainStack.Screen
        name={SCREEN_NAMES.EDIT_PROFILE}
        component={EditProfileScreen}
        options={{
          title: 'Edit Profile',
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.headerText}>Cancel</Text>
            </TouchableOpacity>
          ),
          cardStyle: { backgroundColor: Colors.primaryLight },
        }}
      />
      <MainStack.Screen
        name={SCREEN_NAMES.ACCOUNT_SETTINGS}
        component={AccountSettingsScreen}
        options={{
          title: 'Account Settings',
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.headerText}>Back</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.navigate(SCREEN_NAMES.PROFILE)}>
              <Text style={styles.headerText}>Update</Text>
            </TouchableOpacity>
          ),
          cardStyle: { backgroundColor: Colors.primaryLight },
        }}
      />
      <MainStack.Screen
        name={SCREEN_NAMES.EVENT_LIST}
        component={EventListScreen}
        options={{
          title: 'Upcoming for you',
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.navigate(SCREEN_NAMES.HOME, { id: null })}>
              <Text style={styles.headerText}>Back</Text>
            </TouchableOpacity>
          ),
          cardStyle: { backgroundColor: Colors.primaryLight },
        }}
      />
      <MainStack.Screen
        name={SCREEN_NAMES.HIDDEN_EVENTS}
        component={HiddenEvents}
        options={{
          title: 'Hidden Events',
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.navigate(SCREEN_NAMES.EVENT_LIST)}>
              <Text style={styles.headerText}>Back</Text>
            </TouchableOpacity>
          ),
          cardStyle: { backgroundColor: Colors.primaryLight },
        }}
      />
      <MainStack.Screen
        name={SCREEN_NAMES.CREATE_EVENT}
        component={EventDetailsScreen}
        options={({ route }) => ({
          title: 'Event Details',
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.navigate(SCREEN_NAMES.HOME, { id: null })}>
              <Text style={styles.headerText}>Back</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                Alert.alert('Are you sure you want to cancel event creation?', '', [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                  {
                    text: 'OK',
                    onPress: () =>
                      navigation.navigate(
                        isset(() => route.params.isEdition)
                          ? SCREEN_NAMES.EVENT_VIEW
                          : SCREEN_NAMES.HOME,
                      ),
                  },
                ])
              }}>
              <Text style={styles.headerText}>Cancel</Text>
            </TouchableOpacity>
          ),
          cardStyle: { backgroundColor: Colors.primaryLight },
        })}
      />
      <MainStack.Screen
        name={SCREEN_NAMES.EDIT_RULES}
        component={RulesScreen}
        options={({ route }) => ({
          title: 'Format & Rules',
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.headerText}>Back</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                Alert.alert('Are you sure you want to cancel event creation?', '', [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                  {
                    text: 'OK',
                    onPress: () =>
                      navigation.navigate(
                        isset(() => route.params.isEdition)
                          ? SCREEN_NAMES.EVENT_VIEW
                          : SCREEN_NAMES.HOME,
                      ),
                  },
                ])
              }}>
              <Text style={styles.headerText}>Cancel</Text>
            </TouchableOpacity>
          ),
          cardStyle: { backgroundColor: Colors.primaryLight },
        })}
      />
      <MainStack.Screen
        name={SCREEN_NAMES.EVENT_DATETIME}
        component={EventDateTimeScreen}
        options={({ route }) => ({
          title: 'Event Date & Time',
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.headerText}>Back</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                Alert.alert('Are you sure you want to cancel event creation?', '', [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                  {
                    text: 'OK',
                    onPress: () =>
                      navigation.navigate(
                        isset(() => route.params.isEdition)
                          ? SCREEN_NAMES.EVENT_VIEW
                          : SCREEN_NAMES.HOME,
                      ),
                  },
                ])
              }}>
              <Text style={styles.headerText}>Cancel</Text>
            </TouchableOpacity>
          ),
          cardStyle: { backgroundColor: Colors.primaryLight },
        })}
      />
      <MainStack.Screen
        name={SCREEN_NAMES.INVITATION}
        component={InvitationScreen}
        options={({ route }) => ({
          title: 'Send Invitation',
          headerStyle: { shadowColor: 'transparent' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.headerText}>Back</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                Alert.alert('Are you sure you want to cancel club creation?', '', [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                  {
                    text: 'OK',
                    onPress: () =>
                      navigation.navigate(
                        isset(() => route.params.isEdition)
                          ? SCREEN_NAMES.EVENT_VIEW
                          : SCREEN_NAMES.HOME,
                      ),
                  },
                ])
              }}>
              <Text style={styles.headerText}>Cancel</Text>
            </TouchableOpacity>
          ),
          cardStyle: { backgroundColor: Colors.primaryLight },
        })}
      />
      <MainStack.Screen
        name={SCREEN_NAMES.EVENT_VIEW}
        component={EventScreen}
        options={({ route }) => ({
          title: 'Event',
          headerStyle: { shadowColor: 'transparent' },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate(
                  isset(() => route.params.event.pending)
                    ? SCREEN_NAMES.NOTIFICATIONS_SCREEN
                    : SCREEN_NAMES.EVENT_LIST,
                  { id: null },
                )
              }>
              <Text style={styles.headerText}>Back</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.navigate(SCREEN_NAMES.CREATE_EVENT)}>
              <Text style={styles.headerText}>Edit</Text>
            </TouchableOpacity>
          ),
          cardStyle: { backgroundColor: Colors.primaryLight },
        })}
      />
      <MainStack.Screen
        name={SCREEN_NAMES.NOTIFICATIONS_SCREEN}
        component={NotificationsScreen}
        options={{
          title: 'Notifications',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate(SCREEN_NAMES.HOME, { hasNewNotifications: false, id: null })
              }>
              <Text style={styles.headerText}>Back</Text>
            </TouchableOpacity>
          ),
          // headerRight: () => (
          //   <TouchableOpacity onPress={() => navigation.navigate(SCREEN_NAMES.HOME)}>
          //     <Text style={styles.headerText}>Settings</Text>
          //   </TouchableOpacity>
          // ),
          cardStyle: { backgroundColor: Colors.primaryLight },
        }}
      />
      <MainStack.Screen
        name={SCREEN_NAMES.ROOM_DETAILS}
        component={RoomDetailsScreen}
        options={{
          title: 'Club Details',
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.headerText}>Back</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                Alert.alert('Are you sure you want to cancel club creation?', '', [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                  {
                    text: 'OK',
                    onPress: () => navigation.navigate(SCREEN_NAMES.HOME, { id: null }),
                  },
                ])
              }}>
              <Text style={styles.headerText}>Cancel</Text>
            </TouchableOpacity>
          ),
          cardStyle: { backgroundColor: Colors.primaryLight },
        }}
      />
      <MainStack.Screen
        name={SCREEN_NAMES.ROOM_RULES}
        component={RoomRulesScreen}
        options={{
          title: 'Club Rules',
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.headerText}>Back</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.navigate(SCREEN_NAMES.ROOM_DETAILS)}>
              <Text style={styles.headerText}>Cancel</Text>
            </TouchableOpacity>
          ),
          cardStyle: { backgroundColor: Colors.primaryLight },
        }}
      />
      <MainStack.Screen
        name={SCREEN_NAMES.WEATHER_FORECAST_SCREEN}
        component={WeatherForecastScreen}
        options={{
          title: 'Weather Forecast',
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.headerText}>Back</Text>
            </TouchableOpacity>
          ),
          cardStyle: { backgroundColor: Colors.primaryLight },
        }}
      />
      <MainStack.Screen
        name={SCREEN_NAMES.HIDDEN_ROOMS}
        component={HiddenRooms}
        options={{
          title: 'Hidden Clubs',
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.navigate(SCREEN_NAMES.HOME, { id: null })}>
              <Text style={styles.headerText}>Back</Text>
            </TouchableOpacity>
          ),
          cardStyle: { backgroundColor: Colors.primaryLight },
        }}
      />
      <MainStack.Screen
        name={SCREEN_NAMES.SEARCH_SCREEN}
        component={SearchScreen}
        options={{
          title: 'Search',
          headerStyle: { shadowColor: 'transparent' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.headerText}>Back</Text>
            </TouchableOpacity>
          ),
          cardStyle: { backgroundColor: Colors.primaryLight },
        }}
      />
      <MainStack.Screen
        name={SCREEN_NAMES.VIEW_PROFILE_SCREEN}
        component={ViewProfileScreen}
        options={({ route }) => ({
          title: 'Profile',
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.headerText}>Back</Text>
            </TouchableOpacity>
          ),
          cardStyle: { backgroundColor: Colors.primaryLight },
        })}
      />
      <MainStack.Screen
        name={SCREEN_NAMES.FOLLOWINGS}
        component={Followings}
        options={({ route }) => ({
          title: `${userData.data?.firstName} ${userData.data?.lastName}`,
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.headerText}>Back</Text>
            </TouchableOpacity>
          ),
          cardStyle: { backgroundColor: Colors.primaryLight },
        })}
      />
    </MainStack.Navigator>
  )
}

const styles = StyleSheet.create({
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.extraLight,
    marginHorizontal: 16,
  },
  badge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.green,
    position: 'absolute',
    right: 0,
    marginTop: -3,
  },
  grayText: {
    fontSize: 16,
    color: Colors.extraLight,
    padding: 10,
  },
})
