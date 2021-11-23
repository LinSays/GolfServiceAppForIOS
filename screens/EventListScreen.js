import React, { useEffect } from 'react'
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native'
import * as AddCalendarEvent from 'react-native-add-calendar-event'
import OptionsMenu from 'react-native-option-menu'

import EventCard from '../components/EventCard'
import LoadingModal from '../components/LoadingModal'
import SvgIcon from '../components/SvgIcons'
import { Colors } from '../constants/Colors'
import { SCREEN_NAMES } from '../constants/Globals'
import { useSelector, useDispatch } from 'react-redux'

import { updateEventById, deleteEventByID, updateUserDataById } from '../utils/DataUtils'
import { getEndDateTime } from '../utils/Helper'
import { setUserData } from '../actions'
import { setEventsData, fetchEventsData } from '../actions/events.actions'

const EventListScreen = ({ navigation }) => {
  const dispatch = useDispatch()
  const userData = useSelector((state) => state.user)
  const events = useSelector((state) => state.events.events)
  const isLoading = useSelector((state) => state.isLoading)

  useEffect(() => {
    dispatch(fetchEventsData(userData.data.phoneNumber))
  }, [userData])

  const addEventToCalendar = (event) => {
    const { name, location, date, time } = event
    AddCalendarEvent.presentEventCreatingDialog({
      title: name,
      location,
      startDate: `${date}T${time}`,
      endDate: getEndDateTime(`${date}T${time}`, 1),
    })
      .then(async ({ calendarItemIdentifier, eventIdentifier }) => {
        const updatedEvents = events.map((e) =>
          e.id === event.id ? { ...e, calendarItemIdentifier, eventIdentifier } : e,
        )
        dispatch(setEventsData(updatedEvents))
        const res = await updateEventById(event.id, { calendarItemIdentifier, eventIdentifier })
        if (res.status !== 'success') {
          Alert.alert('Error!', 'There was a problem connecting to server!')
        }
      })
      .catch((error) => {
        console.warn(error)
      })
  }

  const showHiddenEvents = () => {
    navigation.navigate(SCREEN_NAMES.HIDDEN_EVENTS)
  }

  const handleDelete = async (id) => {
    try {
      const res = await deleteEventByID(id)
      if (res.status !== 'success') {
        Alert.alert('Error', 'Failed to delete event! Please try again!')
        return
      }

      const newEvents = events.filter((event) => event.id !== id)
      dispatch(setEventsData(newEvents))
    } catch (err) {
      Alert.alert('Error', 'Something went wrong!')
      console.error(err)
    }
  }

  const handleHide = async (event) => {
    try {
      const { id } = event
      const { hiddenEvents } = userData.data
      const updatedHiddenEvents = hiddenEvents ? [...hiddenEvents, id] : [id]
      const res = await updateUserDataById(userData.id, { hiddenEvents: updatedHiddenEvents })
      if (res.status !== 'success') {
        Alert.alert('Error', 'Failed to hide event! Please try again!')
        return
      }
      dispatch(
        setUserData({ ...userData, data: { ...userData.data, hiddenEvents: updatedHiddenEvents } }),
      )
      const newEvents = events.filter((e) => e.id !== id)
      dispatch(setEventsData(newEvents))
    } catch (err) {
      Alert.alert('Error', 'Something went wrong!')
      console.error(err)
    }
  }

  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: Colors.white,
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 15,
        }}>
        <Text style={{ fontSize: 17, fontWeight: '600' }}>Events</Text>
        <OptionsMenu
          customButton={
            <View style={{ paddingLeft: 15, paddingTop: 12, paddingBottom: 12 }}>
              <SvgIcon type="three_dots" />
            </View>
          }
          buttonStyle={{ width: 32, height: 20, margin: 7.5, resizeMode: 'contain' }}
          destructiveIndex={1}
          options={['Hidden Events', 'Cancel']}
          actions={[showHiddenEvents]}
        />
      </View>
      <View style={styles.container}>
        {!isLoading ? (
          events.length ? (
            <FlatList
              data={events}
              keyExtractor={(item, index) => item.id + index}
              renderItem={({ item }) => (
                <EventCard
                  event={item}
                  onPressAddCalendar={addEventToCalendar}
                  handleDeleteCard={() => handleDelete(item.id)}
                  handleHideEvent={() => handleHide(item)}
                />
              )}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={{ marginTop: 40 }}>
              <Text style={{ fontSize: 16, textAlign: 'center', color: Colors.extraLightGray }}>
                No Upcoming Events
              </Text>
              <View style={{ marginTop: 5 }} />
              <Text style={{ fontSize: 16, textAlign: 'center', color: Colors.extraLightGray }}>
                available for the moment
              </Text>
            </View>
          )
        ) : (
          <LoadingModal />
        )}
      </View>
    </>
  )
}

export default EventListScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 16,
    marginTop: 10,
  },
})
