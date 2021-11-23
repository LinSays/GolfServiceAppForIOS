import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Image from 'react-native-image-progress'

import { Colors } from '../constants/Colors'
import { NOTIFICATION_TYPES, STORAGE_URL } from '../constants/Globals'
import { getTimeDifference } from '../utils/Helper'

const NotificationItem = ({ item, onPress }) => {
  const { type, file, fullName, event, imageUrl, created, status } = item
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.container}>
        {type === NOTIFICATION_TYPES.ALERT && imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            imageStyle={{ borderRadius: 24 }}
            style={styles.avatar}
          />
        ) : type === NOTIFICATION_TYPES.EVENT || type === NOTIFICATION_TYPES.FOLLOW ? (
          file.filename ? (
            <Image
              source={{ uri: `${STORAGE_URL}/${file.filename}?alt=media` }}
              imageStyle={{ borderRadius: 24 }}
              style={styles.avatar}
            />
          ) : file.photoURL ? (
            <Image
              source={{ uri: file.photoURL }}
              imageStyle={{ borderRadius: 24 }}
              style={styles.avatar}
            />
          ) : (
            <Image
              source={require('../assets/images/avatar_small.png')}
              imageStyle={{ borderRadius: 24, width: 48, height: 48 }}
              style={styles.avatar}
            />
          )
        ) : null}

        <View style={{ flex: 1, marginLeft: 15 }}>
          {type === NOTIFICATION_TYPES.EVENT ? (
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.description}>
                {fullName} invited you to the {event.name}
              </Text>
            </View>
          ) : type === NOTIFICATION_TYPES.ALERT ? (
            <Text>{fullName} just signed up for 19th Hole.</Text>
          ) : type === NOTIFICATION_TYPES.FOLLOW ? (
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.description}>{fullName} followed you</Text>
            </View>
          ) : (
            <Text>An event is coming up</Text>
          )}
          <Text style={styles.dateTime}>
            {getTimeDifference(
              type === NOTIFICATION_TYPES.ALERT || type === NOTIFICATION_TYPES.FOLLOW
                ? created
                : event.created || 0,
            )}
          </Text>
        </View>

        {status === 'new' ? (
          <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.green }} />
        ) : null}
      </View>
    </TouchableOpacity>
  )
}

export default NotificationItem

const styles = StyleSheet.create({
  container: {
    height: 88,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
    borderRadius: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  description: {
    flex: 1,
    flexWrap: 'wrap',
    fontSize: 13,
  },
  dateTime: {
    marginTop: 5,
    fontSize: 13,
    color: Colors.extraLight,
  },
})
