import React, { useRef, useContext, useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native'
import RBSheet from 'react-native-raw-bottom-sheet'
import Contacts from 'react-native-contacts'
import OptionsMenu from 'react-native-option-menu'
import { useSelector, useDispatch } from 'react-redux'

import { Colors } from '../constants/Colors'
import { RoomContext } from '../context/RoomContext'
import CircleIcon from '../components/CircleIcon'
import RoomMemberAvatar from '../components/RoomMemberAvatar'
import DockerAvatarRow from '../components/DockerAvatarRow'
import ListItem from '../components/ListItem'
import SvgIcon from '../components/SvgIcons'
import { useInitializeAgora } from '../hooks/useInitializeAgora'
import { SCREEN_NAMES } from '../constants/Globals'
import { leaveRoom } from '../utils/AgoraUtils'
import { generateRtmToken, sendSms, updateRoom } from '../utils/DataUtils'
import { deleteRoomData, setRoomsData } from '../actions/rooms.actions'
import MessagingScreen from './MessagingScreen'
import { setIsLoading } from '../actions'
import { truncateText } from '../utils/Helper'

const RoomVoiceScreen = () => {
  const dispatch = useDispatch()
  const roomContext = useContext(RoomContext)
  const {
    isVisible,
    isMute,
    setIsMute,
    setIsVisible,
    personIds,
    setChannelData,
    setPersonIds,
    channelData,
    headHeight,
    navRoom,
  } = roomContext
  const userData = useSelector((state) => state.user)
  const rooms = useSelector((state) => state.rooms.rooms)
  const { toggleIsMute } = useInitializeAgora()
  const refBottomSheet = useRef(null)
  const [contacts, setContacts] = useState([])
  const [inviteContacts, setInviteContacts] = useState([])
  const [result, setResult] = useState(null)
  const [isMessaging, setIsMessaging] = useState(false)

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

  const handleCloseSheet = () => {
    refBottomSheet.current.close()
  }

  const handleLeaveRoom = () => {
    leaveRoom()
    setChannelData(null)
    setPersonIds([])
    setIsVisible({ isFullRoom: false, isShowMembers: true })
    setIsMute(false)
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

  const handlePing = async (contact) => {
    if (userData.data) {
      const { firstName, lastName } = userData.data
      const fullName = `${firstName} ${lastName}`
      const mobile = contact.phoneNumbers.length ? contact.phoneNumbers[0].number : null
      const formattedNumber = mobile.replace(/\D/g, '')
      const phoneNumber = formattedNumber.length >= 11 ? formattedNumber : `1${formattedNumber}`

      const foundIndex = rooms.findIndex((room) => room.id === channelData.channelName)

      const updatedRooms = [...rooms]

      if (updatedRooms[foundIndex].data.hasOwnProperty('phoneNumbers')) {
        if (!updatedRooms[foundIndex].data.phoneNumbers.includes(phoneNumber)) {
          updatedRooms[foundIndex].data.phoneNumbers = [
            ...updatedRooms[foundIndex].data.phoneNumbers,
            phoneNumber,
          ]
        }
      } else {
        updatedRooms[foundIndex] = {
          ...updatedRooms[foundIndex],
          data: { ...updatedRooms[foundIndex].data, phoneNumbers: [phoneNumber] },
        }
      }

      dispatch(setRoomsData(updatedRooms))
      await updateRoom(updatedRooms[foundIndex].id, updatedRooms[foundIndex].data)
      await sendSms(phoneNumber, fullName, channelData, true)

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
  }

  const editRoom = () => {
    navRoom.navigate(SCREEN_NAMES.ROOM_DETAILS, { isEdit: true })
    setIsVisible({ ...isVisible, isShowMembers: false })
  }

  const endRoom = () => {
    Alert.alert('', 'Are you sure you want to delete this club?', [
      {
        text: 'OK',
        onPress: () => {
          dispatch(deleteRoomData(channelData.channelName))

          leaveRoom()
          setIsMute(false)
          setIsVisible({ isFullRoom: false })
        },
      },
      {
        text: 'Cancel',
      },
    ])
  }

  const handleViewProfile = (userId) => {
    setIsVisible({ ...isVisible, isShowMembers: false })
    navRoom.navigate(SCREEN_NAMES.VIEW_PROFILE_SCREEN, { userId })
  }

  return isVisible.isFullRoom ? (
    <View style={isVisible.isShowMembers ? styles.container : styles.docker}>
      <View style={{ flex: 1, display: isVisible.isShowMembers ? 'flex' : 'none' }}>
        <View style={{ ...styles.header, height: headHeight }}>
          <TouchableOpacity
            onPress={() => {
              setIsMessaging(false)
              setIsVisible({ ...isVisible, isShowMembers: false })
            }}>
            <Text style={{ marginLeft: 20, ...styles.headerButton }}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.roomTitle}>{truncateText(channelData?.title, 15)}</Text>
          <Text style={{ marginRight: 20, ...styles.headerButton }} />
        </View>
        <View style={styles.tabWrapper}>
          <TouchableWithoutFeedback onPress={() => setIsMessaging(false)}>
            <View
              style={{
                borderTopLeftRadius: 10,
                borderBottomLeftRadius: 10,
                backgroundColor: isMessaging ? Colors.primaryLight : Colors.primary,
              }}>
              <Text style={{ ...styles.tab, color: isMessaging ? Colors.primary : Colors.white }}>
                Members
              </Text>
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback
            onPress={async () => {
              dispatch(setIsLoading(true))
              const { data: rtmToken } = await generateRtmToken({ userId: userData.id })
              await roomContext.client.login(userData.id, rtmToken)
              roomContext.setChannel(channelData?.title)
              setIsMessaging(true)
              dispatch(setIsLoading(false))
            }}>
            <View
              style={{
                backgroundColor: isMessaging ? Colors.primary : Colors.primaryLight,
                borderTopRightRadius: 10,
                borderBottomRightRadius: 10,
              }}>
              <Text style={{ ...styles.tab, color: isMessaging ? Colors.white : Colors.primary }}>
                Chat
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
        {isMessaging ? (
          <MessagingScreen channelName={channelData?.title} channelID={channelData.channelName} />
        ) : (
          <View style={styles.mainContainer}>
            <View style={styles.scrollHeader}>
              {channelData ? (
                <>
                  <Text style={styles.boysRoom}>{channelData?.title}</Text>
                  <OptionsMenu
                    customButton={
                      <View style={{ paddingLeft: 15, paddingTop: 12, paddingBottom: 12 }}>
                        <SvgIcon type="three_dots" />
                      </View>
                    }
                    buttonStyle={{ width: 32, height: 8, margin: 7.5, resizeMode: 'contain' }}
                    destructiveIndex={1}
                    options={['Edit Club', 'End Club', 'Cancel']}
                    actions={[editRoom, endRoom]}
                  />
                </>
              ) : null}
            </View>
            <FlatList
              columnWrapperStyle={{ justifyContent: 'flex-end' }}
              data={personIds}
              numColumns={4}
              key={'_'}
              keyExtractor={(item) => item.created}
              renderItem={({ item, index }) => (
                <RoomMemberAvatar
                  uid={item.uid}
                  muted={item.muted}
                  key={index}
                  handleViewProfile={handleViewProfile}
                />
              )}
            />
          </View>
        )}
      </View>
      {!isMessaging ? (
        <TouchableWithoutFeedback
          onPress={() => setIsVisible({ ...isVisible, isShowMembers: true })}>
          <View style={styles.bottomBar}>
            <View style={{ display: isVisible.isShowMembers ? 'flex' : 'none' }}>
              <CircleIcon bkgColor={Colors.primaryLight} width={126} onPress={handleLeaveRoom}>
                <SvgIcon type="two_fingers" />
                <Text style={styles.leaveQuitely}>Leave Quitely</Text>
              </CircleIcon>
            </View>
            <View style={{ display: isVisible.isShowMembers ? 'none' : 'flex' }}>
              <DockerAvatarRow />
            </View>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ display: isVisible.isShowMembers ? 'none' : 'flex' }}>
                <CircleIcon bkgColor={Colors.primaryLight} onPress={handleLeaveRoom}>
                  <SvgIcon type="two_fingers" />
                </CircleIcon>
              </View>
              {/* <CircleIcon bkgColor={Colors.extraLightGray} onPress={() => {}}>
                  <SvgIcon type="raise_hand" />
                </CircleIcon> */}
              <CircleIcon
                bkgColor={Colors.primaryLight}
                onPress={() => refBottomSheet.current.open()}>
                <SvgIcon type="plus" />
              </CircleIcon>
              <CircleIcon bkgColor={isMute ? Colors.red : Colors.green} onPress={toggleIsMute}>
                <SvgIcon type={isMute ? 'mute' : 'microphone'} color={Colors.white} />
              </CircleIcon>
            </View>
          </View>
        </TouchableWithoutFeedback>
      ) : null}
      <RBSheet
        ref={refBottomSheet}
        height={Dimensions.get('window').height}
        openDuration={250}
        customStyles={{
          container: {
            justifyContent: 'center',
            alignItems: 'center',
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            paddingTop: 50,
          },
        }}>
        <View style={styles.stroke} />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: Dimensions.get('screen').width - 70,
          }}>
          <Text>Ping someone into the club</Text>
          <TouchableOpacity onPress={handleCloseSheet}>
            <Text style={{ fontSize: 20 }}>✖</Text>
          </TouchableOpacity>
        </View>
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
            style={{ marginBottom: 50 }}
            data={result || contacts}
            keyExtractor={(item, index) => item.recordID + index}
            renderItem={({ item }) => (
              <View
                style={{
                  flex: 1,
                  width: Dimensions.get('window').width - 90,
                  alignSelf: 'center',
                }}>
                <ListItem
                  item={item}
                  onPressInvite={handlePing}
                  btnTitle={item.invited ? 'pinged✓' : 'ping'}
                />
              </View>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </RBSheet>
    </View>
  ) : null
}

export default RoomVoiceScreen

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.lightGray,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  header: {
    flexDirection: 'row',
    backgroundColor: 'white',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: 15,
  },
  docker: {
    backgroundColor: Colors.white,
    width: Dimensions.get('window').width,
    paddingTop: 10,
  },
  mainContainer: {
    flex: 1,
    padding: 15,
    marginLeft: 15,
    marginRight: 15,
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: Colors.white,
    borderRadius: 10,
  },
  stroke: {
    width: 134,
    height: 5,
    backgroundColor: Colors.black,
    borderRadius: 100,
    marginTop: -10,
    marginBottom: 14,
  },
  options: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 50,
  },
  option: {
    alignItems: 'center',
    marginTop: 30,
  },
  optionLabel: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 20,
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
  emptyStatus: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.extraLightGray,
    textAlign: 'center',
  },
  scrollHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 30,
  },
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    width: Dimensions.get('window').width - 32,
    height: 80,
    borderRadius: 40,
    paddingTop: 19,
    paddingBottom: 19,
    paddingLeft: 14,
    paddingRight: 14,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,

    elevation: 4,
  },
  leaveQuitely: {
    fontSize: 12,
    fontWeight: '600',
    paddingLeft: 5,
  },
  newAlbany: {
    fontSize: 12,
    color: Colors.extraLight,
  },
  boysRoom: {
    fontSize: 15,
    color: Colors.black,
  },
  //

  channelInputContainer: {
    padding: 10,
  },
  joinLeaveButtonContainer: {
    padding: 10,
  },
  usersListContainer: {
    padding: 10,
  },
  floatRight: {
    position: 'absolute',
    right: 10,
    bottom: 40,
    width: 80,
  },
  floatLeft: {
    position: 'absolute',
    left: 10,
    bottom: 40,
    width: 150,
  },
  inputContainer: {
    backgroundColor: Colors.white,
    height: 70,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: Dimensions.get('screen').width - 70,
    height: 36,
    paddingLeft: 40,
    paddingRight: 10,
    borderRadius: 10,
    backgroundColor: Colors.lightGray,
  },
  section: {
    flex: 1,
    margin: 16,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    borderRadius: 10,
  },
  searchIcon: { marginLeft: 10, marginRight: -30, zIndex: 1 },
  avatar: { width: 24, height: 24, marginHorizontal: 19, borderRadius: 12 },
  tabWrapper: {
    backgroundColor: Colors.white,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
  },
  tab: {
    width: (Dimensions.get('screen').width - 40) / 2,
    paddingVertical: 8,
    fontWeight: '600',
    fontSize: 13,
    textAlign: 'center',
  },
  headerButton: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.extraLight,
  },
  roomTitle: { fontSize: 20, fontWeight: '600' },
})

//  <TouchableOpacity onPress={() => setIsVisible({ ...isVisible, isShowMembers: false })}>
//             <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 16 }}>
//               <Text style={{ paddingRight: 10 }}>All Rooms</Text>
//               <SvgIcon type="dropdown_arrow" />
//             </View>
//           </TouchableOpacity>
//           <View style={{ flexDirection: 'row' }}>
//             <TouchableOpacity
//               onPress={() => {
//                 navRoom.navigate(SCREEN_NAMES.PROFILE, { reload: false })
//                 setIsVisible({ ...isVisible, isShowMembers: false })
//               }}>
//               {file ? (
//                 file.filename ? (
//                   <Image
//                     source={{ uri: `${STORAGE_URL}/${file.filename}?alt=media` }}
//                     imageStyle={{ borderRadius: 12 }}
//                     style={styles.avatar}
//                   />
//                 ) : file.photoURL ? (
//                   <Image
//                     source={{ uri: file.photoURL }}
//                     imageStyle={{ borderRadius: 12 }}
//                     style={styles.avatar}
//                   />
//                 ) : (
//                   <Image
//                     source={require('../assets/images/avatar_small.png')}
//                     imageStyle={{ borderRadius: 12 }}
//                     style={styles.avatar}
//                   />
//                 )
//               ) : null}
//             </TouchableOpacity>
//           </View>
