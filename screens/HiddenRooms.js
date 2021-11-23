import React, { useContext, useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import RoomCard from '../components/RoomCard'
import { deleteRoomData, fetchRoomsData, updateRoomStatus } from '../actions/rooms.actions'
import { Colors } from '../constants/Colors'
import { RoomContext } from '../context/RoomContext'
import { setIsLoading } from '../actions'
import { getRoomDetails } from '../utils/DataUtils'
import { joinRoomWithUserAccount, leaveRoom } from '../utils/AgoraUtils'

const HiddenRooms = () => {
  const dispatch = useDispatch()
  const hiddenRooms = useSelector((state) => state.rooms.hiddenRooms)
  const userData = useSelector((state) => state.user)
  const [refreshing, setRefreshing] = useState(false)
  const roomContext = useContext(RoomContext)
  const { setIsVisible, channelData, setIsMute, setChannelData } = roomContext
  useEffect(() => {
    dispatch(setIsLoading(true))
    dispatch(fetchRoomsData(true, () => dispatch(setIsLoading(false))))
  }, [userData])

  const handleRoom = async (item) => {
    if (item?.id) {
      dispatch(setIsLoading(true))
      const room = await getRoomDetails(item.id)
      if (room.isExist) {
        if (channelData !== null && item.id !== channelData.channelName) {
          Alert.alert('Are you sure you want to leave current club?', '', [
            {
              text: 'Cancel',
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
      {hiddenRooms.length ? (
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
          data={hiddenRooms}
          key="_"
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <RoomCard
              title={item.data.title}
              isHiddenRoom={true}
              isMyRoom={item.data.creatorUserId === userData.id}
              isPublic={item.data.isPublic}
              participants={item.data.participants}
              handler={() => handleRoom(item)}
              handlerDeleteRoom={() => handleDeleteRoom(item)}
              handlerHideRoom={() => dispatch(updateRoomStatus(item, 'visible'))}
            />
          )}
        />
      ) : (
        <View style={{ marginTop: 80 }}>
          <Text style={styles.emptyStatus}>No clubs</Text>
          <Text style={styles.emptyStatus}>available for now</Text>
          <TouchableOpacity onPress={() => dispatch(fetchRoomsData())}>
            <Text style={{ fontSize: 30, textAlign: 'center', padding: 20 }}>{'🔄'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

export default HiddenRooms

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyStatus: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.extraLightGray,
    textAlign: 'center',
  },
})
