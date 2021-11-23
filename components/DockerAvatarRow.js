import React, { useContext, useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import RtcEngine from 'react-native-agora'
import Image from 'react-native-image-progress'
import { Colors } from '../constants/Colors'
import { STORAGE_URL } from '../constants/Globals'

import { RoomContext } from '../context/RoomContext'
import { getUserByQuery } from '../utils/AuthUtils'
import { isset } from '../utils/Helper'

const DockerAvatar = ({ pId }) => {
  const [userInfo, setUserInfo] = useState(null)

  useEffect(() => {
    getUserInfo()
  }, [pId])

  const getUserInfo = async () => {
    const userData = await RtcEngine.instance().getUserInfoByUid(pId)
    const { user } = await getUserByQuery(userData?.userAccount, '', '')
    setUserInfo(user)
  }

  return (
    <View style={{ paddingRight: 5 }}>
      {isset(() => userInfo.file.filename) && userInfo.file.filename ? (
        <Image
          source={{ uri: `${STORAGE_URL}/${userInfo.file.filename}?alt=media` }}
          imageStyle={{ borderRadius: 20 }}
          style={styles.image}
        />
      ) : isset(() => userInfo.file.photoURL) && userInfo.file.photoURL ? (
        <Image
          source={{ uri: userInfo.file.photoURL }}
          imageStyle={{ borderRadius: 20 }}
          style={styles.image}
        />
      ) : (
        <View style={{ width: 40, height: 40 }}>
          <Image
            source={require('../assets/images/avatar_small.png')}
            imageStyle={{
              borderRadius: 20,
              width: 40,
              height: 40,
              resizeMode: 'cover',
            }}
          />
        </View>
      )}
    </View>
  )
}

const DockerAvatarRow = () => {
  const roomContext = useContext(RoomContext)
  const { personIds } = roomContext

  return (
    <>
      {personIds !== undefined && personIds.length ? (
        <View style={{ flexDirection: 'row' }}>
          {personIds.length > 2 ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {personIds.slice(0, 2).map((item, key) => {
                return (
                  <View key={key} style={{ flexDirection: 'row' }}>
                    <DockerAvatar pId={item.uid} />
                  </View>
                )
              })}
              <View style={styles.circle}>
                <Text style={styles.text}>{`${personIds.length - 2}+ `}</Text>
              </View>
            </View>
          ) : (
            <View style={{ flexDirection: 'row' }}>
              {personIds.map((item, key) => {
                return (
                  <View key={key} style={{ flexDirection: 'row' }}>
                    <DockerAvatar pId={item.uid} />
                  </View>
                )
              })}
            </View>
          )}
        </View>
      ) : null}
    </>
  )
}

export default DockerAvatarRow

const styles = StyleSheet.create({
  image: {
    width: 40,
    height: 40,
    borderRadius: 20,
    resizeMode: 'cover',
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    paddingLeft: 5,
    fontSize: 16,
    color: Colors.white,
  },
})
