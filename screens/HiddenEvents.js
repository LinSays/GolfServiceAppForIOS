import React, { useContext, useEffect } from 'react'
import { Alert, FlatList, StyleSheet } from 'react-native'
import { View } from 'react-native'
import { useSelector, useDispatch } from 'react-redux'
import { setUserData } from '../actions'
import { fetchHiddenEvents, setHiddenEvents } from '../actions/events.actions'

import EventCard from '../components/EventCard'
import LoadingModal from '../components/LoadingModal'
import { AuthContext } from '../context/AuthContext'
import { deleteEventByID, updateEventById, updateUserDataById } from '../utils/DataUtils'

const HiddenEvents = ({ navigation }) => {
  const dispatch = useDispatch()
  const authContext = useContext(AuthContext)
  const { user } = authContext
  const userData = useSelector((state) => state.user)
  const isLoading = useSelector((state) => state.isLoading)
  const hiddenEvents = useSelector((state) => state.events.hiddenEvents)

  useEffect(() => {
    if (userData.data) {
      dispatch(fetchHiddenEvents(user.uid))
    }
  }, [])

  const addEventToCalendar = (event) => {
    const { name, location, date, time } = event
    AddCalendarEvent.presentEventCreatingDialog({
      title: name,
      location,
      startDate: `${date}T${time}`,
      endDate: getEndDateTime(`${date}T${time}`, 1),
    })
      .then(async ({ calendarItemIdentifier, eventIdentifier }) => {
        const updatedEvents = hiddenEvents.map((e) =>
          e.id === event.id ? { ...e, calendarItemIdentifier, eventIdentifier } : e,
        )
        dispatch(setHiddenEvents(updatedEvents))
        const res = await updateEventById(event.id, { calendarItemIdentifier, eventIdentifier })
        if (res.status !== 'success') {
          Alert.alert('Error!', 'There was a problem connecting to server!')
        }
      })
      .catch((error) => {
        console.warn(error)
      })
  }

  const handleDelete = async (id) => {
    try {
      const res = await deleteEventByID(id)
      if (res.status !== 'success') {
        Alert.alert('Error', 'Failed to delete event! Please try again!')
        return
      }

      const newEvents = hiddenEvents.filter((event) => event.id !== id)
      dispatch(setHiddenEvents(newEvents))
    } catch (err) {
      Alert.alert('Error', 'Something went wrong!')
      console.error(err)
    }
  }

  const handleUnHide = async (event) => {
    try {
      const { id } = event
      const updatedHiddenEvents = userData.data.hiddenEvents.filter((e) => e !== id) || []
      const res = await updateUserDataById(userData.id, { hiddenEvents: updatedHiddenEvents })

      if (res.status !== 'success') {
        Alert.alert('Error', 'Failed to hide event! Please try again!')
        return
      }
      dispatch(
        setUserData({ ...userData, data: { ...userData.data, hiddenEvents: updatedHiddenEvents } }),
      )
      const newEvents = hiddenEvents.filter((e) => e.id !== id)
      dispatch(setHiddenEvents(newEvents))
    } catch (err) {
      Alert.alert('Error', 'Something went wrong!')
      console.error(err)
    }
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={hiddenEvents}
        keyExtractor={(item, index) => item.id + index}
        renderItem={({ item }) => (
          <EventCard
            isHidden
            event={item}
            onPressAddCalendar={addEventToCalendar}
            handleDeleteCard={() => handleDelete(item.id)}
            handleHideEvent={() => handleUnHide(item)}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
      {isLoading && <LoadingModal />}
    </View>
  )
}

export default HiddenEvents

const styles = StyleSheet.create({
  container: { flex: 1, marginHorizontal: 16, marginTop: 10 },
})
