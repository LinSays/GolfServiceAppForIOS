import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Share,
  Alert,
  Dimensions,
} from 'react-native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import * as AddCalendarEvent from 'react-native-add-calendar-event'
import { useNavigation, useFocusEffect } from '@react-navigation/core'
import Image from 'react-native-image-progress'
import { useSelector, useDispatch } from 'react-redux'

import Avatar from '../components/Avatar'
import LoadingModal from '../components/LoadingModal'
import PrimaryButton from '../components/PrimaryButton'
import SvgIcon from '../components/SvgIcons'
import BottomSection from '../components/BottomSection'

import { Colors } from '../constants/Colors'
import { SCREEN_NAMES, STORAGE_URL } from '../constants/Globals'
import { AuthContext } from '../context/AuthContext'
import { RoomContext } from '../context/RoomContext'
import { getRoomDetails, updateEventById, updateRoom } from '../utils/DataUtils'
import {
  formatDate,
  formatTime,
  getAvatarInitials,
  getEndDateTime,
  truncateText,
} from '../utils/Helper'
import Images from '../utils/Assets'
import { joinRoomWithUserAccount, leaveRoom } from '../utils/AgoraUtils'
import { fetchUserData, setCurrentEvent, setIsLoading } from '../actions'
import { setEventsData } from '../actions/events.actions'
import { setRoomsData } from '../actions/rooms.actions'

const EventViewScreen = ({ event: eventProps, notificationId }) => {
  const authContext = useContext(AuthContext)
  const roomContext = useContext(RoomContext)
  const { isVisible, setIsVisible, setChannelData, setIsMute } = roomContext

  const dispatch = useDispatch()
  const userData = useSelector((state) => state.user)
  const events = useSelector((state) => state.events.events)
  const rooms = useSelector((state) => state.rooms.rooms)
  const isLoading = useSelector((state) => state.isLoading)

  const { user } = authContext
  const [accepted, setAccepted] = useState(false)
  const [showRuleDetails, setShowRuleDetails] = useState(false)
  const [event, setEvent] = useState(eventProps)
  const navigation = useNavigation()

  useFocusEffect(
    useCallback(() => {
      dispatch(setCurrentEvent(eventProps))
      setEvent(eventProps)
    }, [eventProps]),
  )

  useEffect(() => {
    dispatch(setCurrentEvent(event))
  }, [event])

  useEffect(() => {
    dispatch(fetchUserData(user))
  }, [])

  const {
    banner,
    logo,
    name,
    club,
    calendarItemIdentifier,
    date,
    time,
    course,
    location,
    rule,
    participants,
    id,
    roomId,
    pending = false,
    localBanner,
    localLogo,
  } = event

  const addEventToCalendar = (callback) => {
    AddCalendarEvent.presentEventCreatingDialog({
      title: name,
      location,
      startDate: `${date}T${time}`,
      endDate: getEndDateTime(`${date}T${time}`, 1),
    })
      .then(async ({ calendarItemIdentifier, eventIdentifier }) => {
        const updatedEvents = events.map((e) =>
          e.id === id
            ? {
                ...e,
                calendarItemIdentifier,
                eventIdentifier,
              }
            : e,
        )
        dispatch(setEventsData(updatedEvents))
        setEvent({
          ...event,
          calendarItemIdentifier,
          eventIdentifier,
        })
        dispatch(setIsLoading(true))
        const res = await updateEventById(id, {
          calendarItemIdentifier,
          eventIdentifier,
        })
        if (res.status !== 'success') {
          dispatch(setIsLoading(false))
          Alert.alert('Error!', 'There was a problem connecting to server!')
        }
        dispatch(setIsLoading(false))
        if (callback) callback()
      })
      .catch((error) => {
        dispatch(setIsLoading(false))
        console.warn(error)
      })
  }

  const shareEvent = async () => {
    try {
      const result = await Share.share({
        title: name,
        message: `Hi! I share with you the ${name} Event Details. 

        Club: ${club}
        Course: ${course}
        Date time: ${new Date(`${date}T${time}`).toString()}
        Location: ${location}, Rules & Format: ${rule}`,
      })
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      Alert.alert(error.message)
    }
  }

  const updateEvent = async (status) => {
    if (userData.data) {
      const { firstName, lastName, phoneNumber, file } = userData.data
      const displayName = user.displayName ? user.displayName.split(' ') : []
      const _firstName = firstName || displayName[0] || ''
      const _lastName = lastName || displayName[1] || ''
      const updatedParticipants = event.participants.map((participant) =>
        participant.phoneNumber === phoneNumber
          ? {
              ...participant,
              status,
              hasThumbnail: true,
              thumbnailPath: file.filename
                ? `${STORAGE_URL}/${file.filename}?alt=media`
                : file.photoURL
                ? file.photoURL
                : '',
              givenName: _firstName,
              familyName: _lastName,
              fullName: `${_firstName} ${_lastName}`,
            }
          : participant,
      )

      const updatedEventObj = {
        userIds:
          status === 'Accepted'
            ? [...new Set([...event.userIds, user.uid])]
            : event.userIds.filter((uid) => uid !== user.uid),
        phoneNumbers:
          status === 'Accepted'
            ? event.phoneNumbers
            : event.phoneNumbers.filter((phoneNum) => phoneNum !== phoneNumber),
        participants: updatedParticipants,
      }

      if (events.length) {
        let updatedEvents = [...events]
        updatedEvents = updatedEvents.filter((item) => item.id !== id)

        dispatch(setEventsData(updatedEvents))
      }

      const res = await updateEventById(event.id, updatedEventObj)
      if (res.status !== 'success') {
        Alert.alert('Error!', 'There was a problem accepting the invitation!')
        return
      }
      setAccepted(true)
    }
    dispatch(setIsLoading(false))
  }

  const handleAccept = async () => {
    dispatch(setIsLoading(true))
    addEventToCalendar(async () => {
      await updateEvent('Accepted')
    })
  }

  const handleDecline = async () => {
    dispatch(setIsLoading(true))
    const { phoneNumber } = userData.data
    const room = await getRoomDetails(roomId)

    let updatedRoomData

    const updatedPhoneNumbers = room.data.phoneNumbers.filter((item) => item !== phoneNumber)
    updatedRoomData = { ...room.data, phoneNumbers: updatedPhoneNumbers }

    await updateRoom(roomId, updatedRoomData)

    if (rooms.length) {
      const foundIndex = rooms.findIndex((item) => item.id === roomId)
      if (foundIndex !== -1) {
        let updatedRooms = [...rooms]
        updatedRooms = updatedRooms.filter((item) => item.id !== roomId)
        dispatch(setRoomsData(updatedRooms))
      }
    }

    await updateEvent('Declined')
    navigation.navigate(SCREEN_NAMES.EVENT_LIST)
  }

  const handleJoinRoom = async () => {
    dispatch(setIsLoading(true))
    const room = await getRoomDetails(roomId)
    if (room.isExist) {
      if (isVisible.isFullRoom === true) {
        leaveRoom()
        setIsMute(false)
      }
      await joinRoomWithUserAccount(room.data.token, roomId, userData.id)

      const channelObj = {
        token: room.data.token,
        isPublic: room.data.isPublic,
        title: name,
        channelName: roomId,
      }

      setTimeout(() => {
        setIsVisible({ isFullRoom: true, isShowMembers: true })
        setChannelData(channelObj)
        navigation.navigate(SCREEN_NAMES.HOME, { id: null })
        dispatch(setIsLoading(false))
      }, 2000)
    } else {
      Alert.alert('Error!', 'Cannot find the club!')
      dispatch(setIsLoading(false))
    }
  }

  const handleWeather = () => {
    navigation.navigate(SCREEN_NAMES.WEATHER_FORECAST_SCREEN)
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
        <View style={styles.body}>
          {localBanner ? (
            <Image
              source={Images[localBanner]}
              imageStyle={{ width: '100%', height: '100%' }}
              style={styles.banner}
            />
          ) : (
            <Image
              source={{ uri: `${STORAGE_URL}/${banner}?alt=media` }}
              imageStyle={{ width: '100%', height: '100%' }}
              style={styles.banner}
            />
          )}
          <View
            style={{
              marginTop: -100,
              marginLeft: 20,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <View style={{ flexDirection: 'row' }}>
              {localLogo ? (
                <Image
                  source={Images[localLogo]}
                  imageStyle={{ width: '100%', height: '100%', borderRadius: 31 }}
                  style={styles.logo}
                />
              ) : (
                <Image
                  source={{ uri: `${STORAGE_URL}/${logo.fileName}?alt=media` }}
                  imageStyle={{ width: '100%', height: '100%', borderRadius: 31 }}
                  style={styles.logo}
                />
              )}
              <View
                style={{
                  marginLeft: 20,
                  justifyContent: 'center',
                  width: Dimensions.get('screen').width - 200,
                }}>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.club}>{club}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleWeather}>
              <View
                style={{
                  backgroundColor: Colors.primaryLight,
                  padding: 10,
                  borderRadius: 10,
                  marginRight: 10,
                  marginTop: 20,
                }}>
                <SvgIcon type="weather" color={Colors.primary} />
              </View>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', marginTop: 40 }}>
            <TouchableOpacity
              style={styles.actionContainer}
              disabled={calendarItemIdentifier}
              onPress={addEventToCalendar}>
              <SvgIcon type="date" color={Colors.primary} />
              <Text style={styles.actionText}>
                {calendarItemIdentifier ? 'Added to Calendar' : 'Add to Calendar'}
              </Text>
            </TouchableOpacity>
            <View style={{ borderLeftColor: Colors.lightGray, borderLeftWidth: 1 }} />
            <TouchableOpacity style={styles.actionContainer} onPress={shareEvent}>
              <SvgIcon type="share" color={Colors.primary} />
              <Text style={styles.actionText}>Share Event</Text>
            </TouchableOpacity>
          </View>
          <View style={{ borderBottomColor: Colors.lightGray, borderBottomWidth: 1 }} />
          <View style={{ marginHorizontal: 20, marginBottom: 20 }}>
            <Text style={styles.label}>Date and Time</Text>
            <Text style={styles.value}>
              {formatDate(`${date}T${time}`, 'MMMM dd yyyy')} - {formatTime(`${date}T${time}`)}
            </Text>
            {/* <Text style={styles.label}>Golf Course Name</Text>
            <Text style={styles.value}>{course}</Text> */}
            <Text style={styles.label}>Location</Text>
            <Text style={styles.value}>{location}</Text>
            <Text style={styles.label}>Groups</Text>
            <Text style={styles.value}>Create parings to see your groups</Text>
            <Text style={styles.label}>Participants</Text>
            <View style={{ marginTop: 7 }} />
            <View style={{ flexDirection: 'row' }}>
              {participants && participants.length
                ? participants.map((participant) => (
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
            <Text style={styles.label}>Format & Rules</Text>
            <Text style={styles.value}>
              {showRuleDetails ? rule : truncateText(rule, 100) || ''}
            </Text>
            <View style={{ flexDirection: 'row', marginTop: 20 }}>
              <PrimaryButton
                title={showRuleDetails ? 'Hide Details' : 'Show Details'}
                buttonStyle={{ width: 107, height: 32 }}
                buttonTextStyle={{ fontSize: 12, fontWeight: '600', marginTop: 7 }}
                onPress={() => setShowRuleDetails(!showRuleDetails)}
              />
            </View>
          </View>
        </View>
      </ScrollView>
      {isLoading && <LoadingModal />}
      <BottomSection>
        {!accepted && (pending || !event.userIds.includes(user.uid)) && (
          <>
            <PrimaryButton
              style={styles.button}
              title="Accept Invitation"
              buttonStyle={styles.buttonStyle}
              buttonTextStyle={styles.buttonTextStyle}
              onPress={handleAccept}
            />
            <PrimaryButton
              style={styles.button}
              title="Decline"
              buttonStyle={{ ...styles.buttonStyle, backgroundColor: Colors.white }}
              buttonTextStyle={{ ...styles.buttonTextStyle, color: Colors.black }}
              onPress={handleDecline}
            />
          </>
        )}
        {(userData.id === event.createdBy || accepted || event.userIds.includes(user.uid)) && (
          <PrimaryButton
            style={{ width: '100%', marginVertical: 10 }}
            title="Join Club"
            onPress={handleJoinRoom}
          />
        )}
      </BottomSection>
    </View>
  )
}

export default EventViewScreen

const styles = StyleSheet.create({
  body: {
    marginVertical: 20,
    marginHorizontal: 16,
    borderRadius: 10,
    backgroundColor: Colors.white,
  },
  banner: {
    width: '100%',
    height: 230,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    opacity: 0.7,
  },
  logo: {
    width: 61,
    height: 61,
    borderRadius: 31,
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.white,
  },
  club: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.white,
  },
  formatButton: {
    width: 133,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 7,
    marginRight: 10,
    marginBottom: -47,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    zIndex: 1,
  },
  formatText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    paddingVertical: 10,
    marginLeft: 6,
  },
  actionContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  actionText: { marginLeft: 8, fontSize: 14, fontWeight: '600', color: Colors.primary },
  label: {
    marginTop: 20,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.black,
  },
  value: {
    marginTop: 5,
    fontSize: 17,
    color: Colors.secondaryLight,
  },
  button: {
    width: '45%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
  },
  buttonStyle: {
    height: 56,
    borderWidth: 1,
    borderColor: Colors.black,
  },
  buttonTextStyle: { marginLeft: 5, fontSize: 14, marginTop: 5 },
})
