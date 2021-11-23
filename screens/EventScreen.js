import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import LoadingModal from '../components/LoadingModal'

import EventTabNavigator from '../navigation/EventTabNavigator'
import { getEventById } from '../utils/DataUtils'

const EventScreen = ({ route, navigation }) => {
  const [event, setEvent] = useState(route.params?.event || null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (route.params?.id) {
      fetchEvent()
    }
  }, [])

  const fetchEvent = async () => {
    setLoading(true)
    const fetchedEvent = await getEventById(route.params.id)
    setEvent({ ...fetchedEvent.event, pending: true })
    setLoading(false)
  }

  return (
    <>
      {loading ? (
        <LoadingModal />
      ) : (
        <View style={{ flex: 1 }}>
          {event && (
            <EventTabNavigator event={event} notificationId={route.params.notificationId} />
          )}
        </View>
      )}
    </>
  )
}

export default EventScreen
