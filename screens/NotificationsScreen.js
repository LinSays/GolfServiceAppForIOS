import React, { useEffect } from 'react'
import { FlatList, View } from 'react-native'
import { useSelector, useDispatch } from 'react-redux'
import { fetchEventsData } from '../actions/events.actions'
import { getNotifications } from '../actions/notifications.actions'

import NotificationItem from '../components/NotificationItem'
import { NOTIFICATION_TYPES, SCREEN_NAMES } from '../constants/Globals'
import {
  // deleteNotificationById,
  updateNotificationById,
} from '../utils/DataUtils'
import { isset } from '../utils/Helper'

const NotificationsScreen = ({ navigation, route }) => {
  const dispatch = useDispatch()
  const userData = useSelector((state) => state.user)
  const notifications = useSelector((state) => state.notifications.notifications)

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      const userId = isset(() => route.params.userId) ? route.params.userId : userData.id
      if (userId) {
        dispatch(getNotifications(userId))
      }
    })
    return unsubscribe
  }, [navigation])

  useEffect(() => {
    if (notifications.length) {
      notifications.forEach(async (notification) => {
        if (notification.status !== 'notified') {
          await updateNotificationById(notification.notificationId, { status: 'notified' })
        }
      })
    }
  }, [notifications])

  return (
    <View style={{ flex: 1, marginHorizontal: 16, marginVertical: 20 }}>
      <FlatList
        keyExtractor={(item) => item.id}
        data={notifications}
        renderItem={({ item }) => (
          <NotificationItem
            item={item}
            onPress={async () => {
              item.type === NOTIFICATION_TYPES.EVENT
                ? navigation.navigate(SCREEN_NAMES.EVENT_VIEW, {
                    notificationId: item.notificationId,
                    event: { ...item.event, pending: true },
                  })
                : item.type === NOTIFICATION_TYPES.ALERT
                ? navigation.navigate(SCREEN_NAMES.VIEW_PROFILE_SCREEN, {
                    userId: item.createdUserId,
                  })
                : navigation.navigate(SCREEN_NAMES.VIEW_PROFILE_SCREEN, {
                    userId: item.follower,
                  })
              // await deleteNotificationById(item.id)
            }}
          />
        )}
      />
    </View>
  )
}

export default NotificationsScreen
