import React, { useRef } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useNavigation } from '@react-navigation/core'
import { SwipeRow } from 'react-native-swipe-list-view'

import { Colors } from '../constants/Colors'
import { SCREEN_NAMES } from '../constants/Globals'

import { formatDate, formatTime, getAvatarInitials } from '../utils/Helper'
import SvgIcon from './SvgIcons'
import Avatar from './Avatar'

const EventCard = ({ event, isHidden, onPressAddCalendar, handleHideEvent, handleDeleteCard }) => {
  const navigation = useNavigation()
  const ref = useRef(null)
  return (
    <SwipeRow rightOpenValue={-125} disableRightSwipe ref={ref} closeOnRowPress={true}>
      <View style={styles.standaloneRowBack}>
        <View>
          <TouchableOpacity
            onPress={() => {
              handleHideEvent()
              ref.current.closeRow()
            }}>
            <View
              style={{
                ...styles.rightBox,
                backgroundColor: Colors.black,
              }}>
              <SvgIcon type="hide" />
              <Text style={styles.backTextWhite}>{isHidden ? 'Unhide' : 'Hide'}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              handleDeleteCard()
              ref.current.closeRow()
            }}>
            <View
              style={{
                ...styles.rightBox,
                backgroundColor: Colors.redLight,
              }}>
              <SvgIcon type="delete" />
              <Text style={styles.backTextWhite}>{'Delete'}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.card}>
        <TouchableOpacity onPress={() => navigation.navigate(SCREEN_NAMES.EVENT_VIEW, { event })}>
          <View style={{ padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.title}>{event.name}</Text>
              {/* <SvgIcon type="notification" color={Colors.extraLight} /> */}
            </View>
            <View style={styles.item}>
              <SvgIcon type="flag" />
              <Text style={styles.extra}>{event.club}</Text>
            </View>
            <View style={styles.item}>
              <SvgIcon type="location" />
              <Text style={styles.extra}>{event.location}</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <View style={styles.dateTime}>
                <SvgIcon type="date" />
                <Text style={styles.extra}>
                  {formatDate(`${event.date}T${event.time}`, 'MMMM dd yyyy')}
                </Text>
              </View>
              <View style={styles.dateTime}>
                <SvgIcon type="time" />
                <Text style={{ ...styles.extra, flex: 1 }}>
                  {formatTime(`${event.date}T${event.time}`)}
                </Text>
              </View>
            </View>
            <Text style={{ fontSize: 12, fontWeight: '600', marginVertical: 7 }}>Participants</Text>
            <View style={{ flexDirection: 'row' }}>
              {event.participants
                ? event.participants.map((participant) => (
                    <Avatar
                      key={participant.recordID}
                      img={
                        participant.hasThumbnail ? { uri: participant.thumbnailPath } : undefined
                      }
                      width={32}
                      height={32}
                      style={{ marginRight: 5 }}
                      placeholder={getAvatarInitials(
                        `${participant.givenName} ${participant.familyName}`,
                      )}
                      roundedPlaceholder
                      roundedImage
                    />
                  ))
                : null}
            </View>
          </View>
        </TouchableOpacity>
        <View style={styles.bottom}>
          <TouchableOpacity
            style={{ flexDirection: 'row' }}
            disabled={event.calendarItemIdentifier}
            onPress={() => onPressAddCalendar(event)}>
            <SvgIcon type="date" color={Colors.primary} />
            <Text
              style={{ marginLeft: 12, fontSize: 16, fontWeight: '600', color: Colors.primary }}>
              {event.calendarItemIdentifier ? 'Added to Calendar' : 'Add to Calendar'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SwipeRow>
  )
}

export default EventCard

const styles = StyleSheet.create({
  card: {
    marginVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.white,
  },
  title: {
    marginBottom: 5,
    fontSize: 17,
    fontWeight: '600',
  },
  extra: {
    marginVertical: 5,
    marginLeft: 7,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.extraLight,
  },
  dateTime: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  item: { flexDirection: 'row', alignItems: 'center' },
  bottom: {
    paddingVertical: 13,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: Colors.lightGray,
  },
  standaloneRowBack: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    height: 200,
  },
  rightBox: {
    backgroundColor: Colors.redLight,
    width: 95,
    height: 83,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  backTextWhite: {
    color: Colors.white,
    fontSize: 16,
  },
})
