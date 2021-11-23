import React, { useContext, useEffect, useState, useCallback, useRef } from 'react'
import {
  Dimensions,
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  AppState,
} from 'react-native'
import { useFocusEffect } from '@react-navigation/core'
import { useHeaderHeight } from '@react-navigation/stack'
import messaging from '@react-native-firebase/messaging'
import Contacts from 'react-native-contacts'
import { useDispatch, useSelector } from 'react-redux'
import OptionsMenu from 'react-native-option-menu'
import Image from 'react-native-image-progress'

import { SCREEN_NAMES, STORAGE_URL } from '../constants/Globals'
import { AuthContext } from '../context/AuthContext'
import { RoomContext } from '../context/RoomContext'
import BottomSection from '../components/BottomSection'
import PrimaryButton from '../components/PrimaryButton'
import RoomCard from '../components/RoomCard'
import SvgIcon from '../components/SvgIcons'
import IntroSlide from '../components/IntroSlide'
import { isset } from '../utils/Helper'
import {
  getRoomDetails,
  updateUserDataById,
  updateContacts,
  checkNewNotifications,
} from '../utils/DataUtils'
import { joinRoomWithUserAccount, leaveRoom } from '../utils/AgoraUtils'
import { Colors } from '../constants/Colors'
import LoadingModal from '../components/LoadingModal'
import { fetchUserData, setCurrentEvent, setIsLoading } from '../actions'
import { setHasNewNotifications } from '../actions/notifications.actions'
import { deleteRoomData, fetchRoomsData, updateRoomStatus } from '../actions/rooms.actions'
import { fetchFollowingsData } from '../actions/followings.actions'

const HomeScreen = ({ navigation, route }) => {
  const dispatch = useDispatch()
  const userData = useSelector((state) => state.user)
  const isLoading = useSelector((state) => state.isLoading)
  const rooms = useSelector((state) => state.rooms.rooms)
  const isRoomDataFetched = useSelector((state) => state.rooms.isFetched)
  const hasNewNotifications = useSelector((state) => state.notifications.hasNewNotifications)
  const headerHeight = useHeaderHeight()
  const authContext = useContext(AuthContext)
  const { user, setIsFromRegister } = authContext
  const roomContext = useContext(RoomContext)
  const {
    setIsVisible,
    setHeadHeight,
    isVisible,
    setChannelData,
    setNavRoom,
    channelData,
    setIsMute,
  } = roomContext
  const [refreshing, setRefreshing] = useState(false)
  const [step, setStep] = useState(-1)
  const appState = useRef(AppState.currentState)
  const userId = useRef(null)

  useEffect(() => {
    AppState.addEventListener('change', _handleAppStateChange)
    return () => {
      AppState.removeEventListener('change', _handleAppStateChange)
    }
  }, [])

  const _handleAppStateChange = async (nextAppState) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      if (userId.current) {
        const res = await checkNewNotifications(userId.current)
        if (res.status !== 'success') return false
        dispatch(setHasNewNotifications(res.hasNewNotifications))
      }
    }
    appState.current = nextAppState
  }

  // handle notification press from background
  messaging().onNotificationOpenedApp((remoteMessage) => {
    if (remoteMessage) {
      if (remoteMessage.data.userId) {
        navigation.navigate(SCREEN_NAMES.NOTIFICATIONS_SCREEN, {
          userId: remoteMessage.data.userId,
        })
      }
    }
  })

  // handle notification press from quit status
  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage) {
        if (remoteMessage.data.userId) {
          navigation.navigate(SCREEN_NAMES.NOTIFICATIONS_SCREEN, {
            userId: remoteMessage.data.userId,
          })
        }
      }
    })

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      if (remoteMessage.data) {
        dispatch(setHasNewNotifications(true))
      }
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    setHeadHeight(headerHeight)
    setNavRoom(navigation)
    requestUserPermission()

    if (user) {
      setRefreshing(true)
      dispatch(fetchUserData(user, updateUserData))
    }
  }, [user])

  useEffect(() => {
    if (userData.id) {
      dispatch(fetchFollowingsData())
      dispatch(fetchRoomsData(false, () => setRefreshing(false)))
    }
  }, [userData])

  // handle deep linking
  useEffect(() => {
    if (rooms.length && isset(() => route.params.id)) {
      const found = rooms.find((room) => route.params.id === room.id)
      handleRoom(found)
    }
  }, [rooms])

  // check new notifications
  useFocusEffect(
    useCallback(() => {
      const checkNotifications = async () => {
        const res = await checkNewNotifications(userData.id)
        if (res.status !== 'success') return false
        dispatch(setHasNewNotifications(res.hasNewNotifications))
      }
      if (userData.data) {
        const { file } = userData.data
        navigation.setOptions({
          headerRight: () => (
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity
                onPress={() => {
                  setIsVisible({ ...isVisible, isShowMembers: false })
                  navigation.navigate(SCREEN_NAMES.EVENT_LIST)
                }}>
                <SvgIcon type="calendar" style={{ marginRight: 16 }} />
              </TouchableOpacity>
              <TouchableOpacity
                style={{ position: 'relative', marginHorizontal: 16 }}
                onPress={() => {
                  setIsVisible({ ...isVisible, isShowMembers: false })
                  navigation.navigate(SCREEN_NAMES.NOTIFICATIONS_SCREEN)
                }}>
                <SvgIcon type="notification" fill={hasNewNotifications ? 'black' : 'none'} />
                {hasNewNotifications ? <View style={styles.badge} /> : null}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setIsVisible({ ...isVisible, isShowMembers: false })
                  navigation.navigate(SCREEN_NAMES.PROFILE, { reload: false })
                }}>
                {file?.filename ? (
                  <Image
                    source={{ uri: `${STORAGE_URL}/${file.filename}?alt=media` }}
                    imageStyle={{ borderRadius: 12 }}
                    style={styles.avatar}
                  />
                ) : file?.photoURL ? (
                  <Image
                    source={{
                      uri: file.photoURL,
                    }}
                    imageStyle={{ borderRadius: 12 }}
                    style={styles.avatar}
                  />
                ) : (
                  <Image
                    source={require('../assets/images/avatar_small.png')}
                    imageStyle={{ width: '100%', height: '100%' }}
                    style={styles.avatar}
                  />
                )}
              </TouchableOpacity>
            </View>
          ),
        })
        // check notifications
        userId.current = userData.id
        checkNotifications()
      }
    }, [userData]),
  )

  const updateUserData = async (data) => {
    if (!data) {
      setIsFromRegister(true)
      return
    }
    const { id, data: _data } = data
    try {
      // update fcm token
      const fcmToken = await messaging().getToken()

      await updateUserDataById(id, { token: fcmToken })

      // update contacts list
      const contactsPerm = await Contacts.checkPermission()

      if (contactsPerm === 'undefined') {
        const perm = await Contacts.requestPermission()
        if (perm === 'authorized') {
          await uploadContacts(id)
        }
      } else if (contactsPerm === 'authorized') {
        await uploadContacts(id)
      }

      if (!_data.guided) {
        setStep(0)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const uploadContacts = async (userId) => {
    const _contacts = await Contacts.getAll()
    const phoneNumbers = []
    _contacts.length
      ? _contacts.forEach((c) => {
          if (c.phoneNumbers.length) {
            c.phoneNumbers.forEach((phone) => {
              const formattedNumber = phone.number.replace(/\D/g, '')
              const number = formattedNumber.length >= 11 ? formattedNumber : `1${formattedNumber}`
              phoneNumbers.push(number.replace(/\D/g, ''))
            })
          }
        })
      : []
    await updateContacts({ contacts: phoneNumbers, userId })
  }

  const requestUserPermission = async () => {
    let authStatus = await messaging().hasPermission()
    const notificationEnabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    if (!notificationEnabled) {
      authStatus = await messaging().requestPermission()
    }
  }

  const handleRoom = async (item) => {
    if (item?.id) {
      dispatch(setIsLoading(true))
      const room = await getRoomDetails(item.id)
      if (room.isExist) {
        if (channelData && item.id !== channelData.channelName) {
          Alert.alert('Are you sure you want to leave current room?', '', [
            {
              text: 'Cancel',
              onPress: () => {
                dispatch(setIsLoading(false))
              },
            },
            {
              text: 'OK',
              onPress: async () => {
                leaveRoom()
                setIsMute(false)
                await joinRoomWithUserAccount(item.data.token, item.id, userData.id)
                const channelObj = {
                  token: item.data.token,
                  title: item.data.title,
                  isPublic: item.data.isPublic,
                  channelName: item.id,
                }
                setTimeout(() => {
                  setChannelData(channelObj)
                  setIsVisible({ isFullRoom: true, isShowMembers: true })
                  dispatch(setIsLoading(false))
                }, 2000)
              },
            },
          ])
        } else {
          try {
            await joinRoomWithUserAccount(item.data.token, item.id, userData.id)
            const channelObj = {
              token: item.data.token,
              title: item.data.title,
              isPublic: item.data.isPublic,
              channelName: item.id,
            }
            setTimeout(() => {
              setChannelData(channelObj)
              setIsVisible({ isFullRoom: true, isShowMembers: true })
              dispatch(setIsLoading(false))
            }, 2000)
          } catch (error) {
            console.error(error)
          }
        }
      } else {
        Alert.alert('Error!', 'Current Club was deleted')
        dispatch(setIsLoading(false))
      }
    }
  }

  const handleDeleteRoom = (room) => {
    Alert.alert('', 'Are you sure you want to delete this club?', [
      {
        text: 'OK',
        onPress: () => {
          dispatch(deleteRoomData(room.id))

          if (channelData?.channelName === room.id) {
            leaveRoom()
            setIsMute(false)
            setIsVisible({ isFullRoom: false })
          }
        },
      },
      {
        text: 'Cancel',
      },
    ])
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={{ fontSize: 17, fontWeight: '600' }}>Clubs</Text>
        <OptionsMenu
          customButton={
            <View style={{ paddingLeft: 15, paddingTop: 12, paddingBottom: 12 }}>
              <SvgIcon type="three_dots" />
            </View>
          }
          buttonStyle={{ width: 32, height: 20, margin: 7.5, resizeMode: 'contain' }}
          destructiveIndex={1}
          options={['Hidden Clubs', 'Cancel']}
          actions={[
            () => {
              navigation.navigate(SCREEN_NAMES.HIDDEN_ROOMS)
            },
          ]}
        />
      </View>
      <View style={{ marginTop: 20 }} />
      {isRoomDataFetched && !rooms.length ? (
        <View style={{ marginTop: 80 }}>
          <Text style={styles.emptyStatus}>No clubs</Text>
          <Text style={styles.emptyStatus}>available for now</Text>
          <TouchableOpacity onPress={() => dispatch(fetchRoomsData())}>
            <Text style={{ fontSize: 30, textAlign: 'center', padding: 20 }}>{'🔄'}</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true)
              dispatch(fetchRoomsData(false, () => setRefreshing(false)))
            }}
          />
        }
        style={{ marginBottom: 100 }}
        data={rooms}
        key="_"
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <RoomCard
            title={item.data.title}
            isHiddenRoom={false}
            isMyRoom={item.data.creatorUserId === userData.id}
            isPublic={item.data.isPublic}
            participants={item.data.participants}
            handler={() => handleRoom(item)}
            handlerDeleteRoom={() => handleDeleteRoom(item)}
            handlerHideRoom={() => dispatch(updateRoomStatus(item, 'hidden'))}
          />
        )}
      />
      <BottomSection style={{ marginBottom: 0 }}>
        <PrimaryButton
          style={styles.button}
          title="Create an event"
          icon="event"
          buttonStyle={{ ...styles.buttonStyle, backgroundColor: Colors.white }}
          buttonTextStyle={{ ...styles.buttonTextStyle, color: Colors.black }}
          onPress={() => {
            dispatch(setCurrentEvent(null))
            navigation.navigate(SCREEN_NAMES.CREATE_EVENT)
          }}
        />
        <PrimaryButton
          style={styles.button}
          title="Start a club"
          icon="room"
          buttonStyle={styles.buttonStyle}
          buttonTextStyle={styles.buttonTextStyle}
          onPress={() => navigation.navigate(SCREEN_NAMES.ROOM_DETAILS, { isEdit: false })}
        />
      </BottomSection>
      {step > -1 ? (
        <IntroSlide
          step={step}
          setStep={setStep}
          filename={
            isset(() => userData.data.file.filename) && userData.data.file.filename
              ? userData.data.file.filename
              : null
          }
          photoURL={
            isset(() => userData.data.file.photoURL) && userData.data.file.photoURL
              ? userData.data.file.photoURL
              : null
          }
        />
      ) : null}
      {isLoading && <LoadingModal />}
    </View>
  )
}

export default HomeScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    width: '100%',
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
  buttonTextStyle: {
    marginLeft: 5,
    fontSize: Dimensions.get('screen').width < 360 ? 11 : 14,
    marginTop: Dimensions.get('screen').width < 360 ? 9 : 5,
  },
  emptyStatus: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.extraLightGray,
    textAlign: 'center',
  },
  avatar: { width: 24, height: 24, marginHorizontal: 16, borderRadius: 12 },
})
