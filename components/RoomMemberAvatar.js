import React, { useState, useEffect } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import Image from 'react-native-image-progress'
import RtcEngine from 'react-native-agora'

import SvgIcon from './SvgIcons'
import { Colors } from '../constants/Colors'
import { STORAGE_URL } from '../constants/Globals'
import { getUserByQuery } from '../utils/AuthUtils'
import { getPictureBySize, isset } from '../utils/Helper'

const RoomMemberAvatar = ({ muted, uid, handleViewProfile }) => {
  const [userInfo, setUserInfo] = useState(null)

  let bkgColor = ''
  if (muted) {
    bkgColor = Colors.extraLightGray
  } else {
    bkgColor = Colors.green
  }

  useEffect(() => {
    let mounted = true

    RtcEngine.instance()
      .getUserInfoByUid(uid)
      .then((userData) => {
        if (userData) {
          getUserByQuery(userData.userAccount, '', '').then((res) => {
            if (mounted) {
              setUserInfo(res.user)
            }
          })
        }
      })

    return () => {
      mounted = false
    }
  }, [])

  const handlePress = async () => {
    RtcEngine.instance()
      .getUserInfoByUid(uid)
      .then((userData) => {
        handleViewProfile(userData.userAccount)
      })
  }

  return (
    <TouchableOpacity style={{ flex: 1 }} onPress={handlePress}>
      {userInfo ? (
        <>
          <View style={{ ...styles.container, backgroundColor: bkgColor }}>
            {isset(() => userInfo.file.filename) && userInfo.file.filename ? (
              <Image
                source={{ uri: `${STORAGE_URL}/${userInfo.file.filename}?alt=media` }}
                imageStyle={{ borderRadius: 35 }}
                style={muted ? { ...styles.image, opacity: 0.4 } : styles.image}
              />
            ) : isset(() => userInfo.file.photoURL) && userInfo.file.photoURL ? (
              <Image
                source={{ uri: getPictureBySize(userInfo.file.photoURL, 480, 480) }}
                imageStyle={{ borderRadius: 35 }}
                style={muted ? { ...styles.image, opacity: 0.4 } : styles.image}
              />
            ) : (
              <View style={{ width: 70, height: 70 }}>
                <Image
                  source={require('../assets/images/avatar_small.png')}
                  imageStyle={{ width: 70, height: 70 }}
                />
              </View>
            )}
          </View>
          <View
            style={{
              ...styles.micCircle,
              backgroundColor: muted ? Colors.extraLightGray : Colors.green,
            }}>
            <SvgIcon type="microphone" color={muted ? Colors.gray : Colors.white} />
          </View>
        </>
      ) : null}
    </TouchableOpacity>
  )
}

export default RoomMemberAvatar

const styles = StyleSheet.create({
  container: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 35,
    resizeMode: 'cover',
  },
  micCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 25,
    right: -45,
  },
})
