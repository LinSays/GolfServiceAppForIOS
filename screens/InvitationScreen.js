import React, { useContext, useEffect, useState } from 'react'
import { Alert, Dimensions, FlatList, StyleSheet, TextInput, View } from 'react-native'
import Contacts from 'react-native-contacts'
import storage from '@react-native-firebase/storage'
import { v4 as uuid } from 'uuid'
import { useSelector, useDispatch } from 'react-redux'
import * as AddCalendarEvent from 'react-native-add-calendar-event'

import ListItem from '../components/ListItem'
import LoadingModal from '../components/LoadingModal'
import PrimaryButton from '../components/PrimaryButton'
import SvgIcon from '../components/SvgIcons'
import BottomSection from '../components/BottomSection'
import { Colors } from '../constants/Colors'
import { SCREEN_NAMES } from '../constants/Globals'
import {
  addEvent,
  sendSms,
  updateEventById,
  generateToken,
  addRoom,
  updateRoom,
} from '../utils/DataUtils'
import { getEndDateTime, isset } from '../utils/Helper'
import { AuthContext } from '../context/AuthContext'
import { joinRoomWithUserAccount, leaveRoom } from '../utils/AgoraUtils'
import { RoomContext } from '../context/RoomContext'
import { setEventsData } from '../actions/events.actions'
import { setRoomsData } from '../actions/rooms.actions'

const InvitationScreen = ({ route, navigation }) => {
  const dispatch = useDispatch()
  const userData = useSelector((state) => state.user)
  const events = useSelector((state) => state.events.events)
  const rooms = useSelector((state) => state.rooms.rooms)
  const currentEvent = useSelector((state) => state.currentEvent)
  const { back, title, roomInfo, isEdit } = route.params

  const authContext = useContext(AuthContext)
  const roomContext = useContext(RoomContext)
  const { user } = authContext
  const { isVisible, setIsVisible, setChannelData, channelData, setIsMute } = roomContext
  const [contacts, setContacts] = useState([])
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [inviteContacts, setInviteContacts] = useState([])

  let btnTitle = ''

  if (back === SCREEN_NAMES.ROOM_DETAILS) {
    btnTitle = 'Save Club'
  } else {
    btnTitle =
      isset(() => route.params.title) && route.params.title === 'Invite Participants'
        ? 'Send Invitations'
        : currentEvent.id
        ? 'Update Event'
        : 'Create Event'
  }

  useEffect(() => {
    Contacts.checkPermission().then((permission) => {
      if (permission === 'undefined') {
        Contacts.requestPermission().then((perm) => {
          if (perm === 'authorized') getContacts()
        })
      }
      if (permission === 'authorized') {
        getContacts()
      }
    })
  }, [])

  const getContacts = () => {
    Contacts.getAll().then((_contacts) => {
      setContacts(_contacts)
    })
  }

  const handleCreateEvent = async () => {
    let logo, banner
    setIsLoading(true)
    if (isset(() => currentEvent.logo.fileUri) && isset(() => currentEvent.banner.fileUri)) {
      logo = await uploadImage(currentEvent.logo.fileUri)
      banner = await uploadImage(currentEvent.banner.fileUri)

      if (logo.status !== 'success' || banner.status !== 'success') {
        setIsLoading(false)
        Alert.alert('Error!', 'Error with uploading media! Please try again!')
        return
      }
    }
    const invitedContacts = inviteContacts.map((c) => {
      const mobile = c.phoneNumbers.length ? c.phoneNumbers[0].number : null
      const formattedNumber = mobile.replace(/\D/g, '')
      const phoneNumber = formattedNumber.length >= 11 ? formattedNumber : `1${formattedNumber}`
      return {
        fullName: `${c.givenName} ${c.familyName}`,
        phoneNumber,
        status: 'Pending',
        ...c,
      }
    })
    const event = {
      ...currentEvent,
      userIds: [user.uid],
      createdBy: userData.id,
      logo: {
        fileName: logo ? logo.path : currentEvent.logo,
        originalFileName: isset(() => currentEvent.logo.filePath.fileName)
          ? currentEvent.logo.filePath.fileName
          : currentEvent.originalFileName,
      },
      banner: banner ? banner.path : currentEvent.banner,
      participants: currentEvent.participants
        ? currentEvent.participants.concat(invitedContacts)
        : invitedContacts,
      groups: currentEvent.groups || [
        {
          id: 1,
          name: 'Group 1',
          teeTime: '09:00 AM',
        },
        {
          id: 2,
          name: 'Group 2',
          teeTime: '10:00 AM',
        },
      ],
    }
    event.phoneNumbers = event.participants.map((e) => e.phoneNumber)
    event.phoneNumbers.push(userData.data.phoneNumber)
    let res
    if (event.id) {
      res = await updateEventById(event.id, event)
      const newEvents = events.map((e) => (e.id === event.id ? event : e))
      dispatch(setEventsData(newEvents))
    } else {
      res = await addEvent(event)
      if (res.status !== 'success') {
        setIsLoading(false)
        Alert.alert('Error!', 'Error with creating event! Please try again!')
        return
      }
      const { room } = res
      dispatch(setRoomsData([...rooms, room]))
      dispatch(setEventsData([...events, event]))
    }

    setIsLoading(false)

    const eventId = res.event.id

    handleSendSms(invitedContacts, { title: event.name, channelName: res.event.id }, true)

    Alert.alert(
      'Success!',
      `${event.name} event successfully ${event.id ? 'updated' : 'created'}!`,
      [
        {
          text: 'OK',
          onPress: () => {
            if (!event.id) {
              const { name, location, date, time } = event
              AddCalendarEvent.presentEventCreatingDialog({
                title: name,
                location,
                startDate: `${date}T${time}`,
                endDate: getEndDateTime(`${date}T${time}`, 1),
              })
                .then(async ({ calendarItemIdentifier, eventIdentifier }) => {
                  res = await updateEventById(eventId, {
                    calendarItemIdentifier,
                    eventIdentifier,
                  })
                  if (res.status !== 'success') {
                    Alert.alert('Error!', 'There was a problem connecting to server!')
                  }
                  navigation.navigate(SCREEN_NAMES.EVENT_LIST, { event })
                })
                .catch((error) => {
                  navigation.navigate(SCREEN_NAMES.EVENT_LIST, { event })
                  console.warn(error)
                })
            } else {
              navigation.navigate(
                isset(() => route.params.title) && route.params.title === 'Invite Participants'
                  ? SCREEN_NAMES.EVENT_PARTICIPANT_TAB
                  : SCREEN_NAMES.EVENT_VIEW,
                { event },
              )
            }
          },
        },
      ],
    )
  }

  const handleCreateRoom = async () => {
    setIsLoading(true)

    const invitedContacts = inviteContacts.map((c) => {
      const mobile = c.phoneNumbers.length ? c.phoneNumbers[0].number : null
      const formattedNumber = mobile.replace(/\D/g, '')
      const phoneNumber = formattedNumber.length >= 11 ? formattedNumber : `1${formattedNumber}`
      return {
        fullName: `${c.givenName} ${c.familyName}`,
        phoneNumber,
        status: 'Pending',
        ...c,
      }
    })

    let room

    const _channelData = await generateToken({
      channelName: uuid(),
    })

    room = {
      roomId: isEdit ? channelData.channelName : _channelData.channelName,
      title: roomInfo.name,
      // desp: roomInfo.description,
      isPublic: roomInfo.isPublic,
      token: isEdit ? channelData.token : _channelData.token,
      participants: invitedContacts,
      creatorUserId: userData.id,
      phoneNumbers: invitedContacts.map((contact) => contact.phoneNumber),
    }

    if (isEdit) {
      await updateRoom(channelData.channelName, room)
    } else {
      await addRoom(room)
    }

    if (isEdit) {
      tempRoom = [...rooms]
      let foundIndex = rooms.findIndex((room) => room.id === channelData.channelName)
      tempRoom[foundIndex] = { id: channelData.channelName, data: room }
      dispatch(setRoomsData(tempRoom))
    } else {
      dispatch(setRoomsData([...rooms, { id: room.roomId, data: room }]))
    }

    if (isVisible.isFullRoom === true) {
      leaveRoom()
      setIsMute(false)
    }

    await joinRoomWithUserAccount(
      isEdit ? channelData.token : _channelData.token,
      isEdit ? channelData.channelName : _channelData.channelName,
      userData.id,
    )

    const channelObj = {
      token: isEdit ? channelData.token : _channelData.token,
      title: roomInfo.name,
      isPublic: roomInfo.isPublic,
      // desp: roomInfo.description,
      channelName: isEdit ? channelData.channelName : _channelData.channelName,
    }

    handleSendSms(invitedContacts, channelObj, true)

    setTimeout(() => {
      setIsVisible({ isFullRoom: true, isShowMembers: true })
      setIsLoading(false)
      setChannelData(channelObj)
      navigation.navigate(SCREEN_NAMES.HOME, { id: null })
    }, 2000)
  }

  const handleSendSms = (invitedContacts, data, isPing) => {
    invitedContacts.map(async (participant) => {
      const { firstName, lastName } = userData.data
      const displayName = user.displayName ? user.displayName.split(' ') : []
      const _firstName = firstName || displayName[0] || ''
      const _lastName = lastName || displayName[1] || ''
      const fullName = `${_firstName} ${_lastName}`
      await sendSms(participant.phoneNumber, fullName, data, isPing)
      // const eventId = res.event.id
      // await addUser({
      //   phoneNumber: participant.phoneNumber,
      //   nominatedBy: userData.id,
      //   eventId,
      //   status: 'pending',
      // })
    })
  }

  const uploadImage = async (uri) => {
    const filename = uri.substring(uri.lastIndexOf('/') + 1)
    const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri
    const task = storage().ref(filename).putFile(uploadUri)
    try {
      const snapshot = await task
      return { status: 'success', path: snapshot.metadata.fullPath }
    } catch (error) {
      return { status: 'failed', error }
    }
  }

  const handleInvite = async (contact) => {
    const mobile = contact.phoneNumbers.length ? contact.phoneNumbers[0].number : null
    const formattedNumber = mobile.replace(/\D/g, '')
    const phoneNumber = formattedNumber.length >= 11 ? formattedNumber : `1${formattedNumber}`
    if (mobile) {
      const isSelectedContact = inviteContacts.find((c) => c.recordID === contact.recordID)
      const _inviteContacts = isSelectedContact
        ? inviteContacts.filter((c) => c.recordID !== contact.recordID)
        : [...inviteContacts, contact]
      setInviteContacts(_inviteContacts)
      const updatedContacts = contacts.map((c) =>
        c.recordID === contact.recordID ? { ...c, invited: !c.invited, phoneNumber } : c,
      )
      setContacts(updatedContacts)
      if (result) {
        const updatedResult = result.map((c) =>
          c.recordID === contact.recordID ? { ...c, invited: !c.invited, phoneNumber } : c,
        )
        setResult(updatedResult)
      }
    }
  }

  const handleChange = (value) => {
    if (value) {
      const _result = contacts.filter((contact) => {
        const fullName = `${contact.familyName} ${contact.givenName}`
        const number = contact.phoneNumbers.find((phone) => phone.number.includes(value.toString()))
        if (fullName.includes(value) || number) {
          return contact
        }
      })
      setResult(_result)
    } else {
      setResult(null)
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.inputContainer}>
        <SvgIcon type="search" color={Colors.gray} style={styles.searchIcon} />
        <TextInput
          placeholder="Search Name Contact Number"
          style={styles.input}
          onChangeText={handleChange}
        />
      </View>
      <View style={styles.section}>
        <FlatList
          style={{ marginBottom: 70 }}
          data={result || contacts}
          keyExtractor={(item, index) => item.recordID + index}
          renderItem={({ item }) => <ListItem item={item} onPressInvite={handleInvite} />}
          showsVerticalScrollIndicator={false}
        />
      </View>
      <BottomSection>
        <PrimaryButton
          style={{ width: '100%', marginVertical: 10 }}
          title={btnTitle}
          onPress={back === SCREEN_NAMES.ROOM_DETAILS ? handleCreateRoom : handleCreateEvent}
        />
      </BottomSection>
      {isLoading && <LoadingModal />}
    </View>
  )
}

export default InvitationScreen

const styles = StyleSheet.create({
  inputContainer: {
    backgroundColor: Colors.white,
    height: 70,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: Dimensions.get('screen').width - 30,
    height: 36,
    paddingLeft: 40,
    paddingRight: 10,
    borderRadius: 10,
    backgroundColor: Colors.lightGray,
  },
  searchIcon: { marginLeft: 10, marginRight: -30, zIndex: 1 },
  section: {
    flex: 1,
    paddingBottom: 27,
    margin: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    borderRadius: 10,
  },
})
