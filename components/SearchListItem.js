import React, { useRef, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import Image from 'react-native-image-progress'
import { useDispatch, useSelector } from 'react-redux'
import RBSheet from 'react-native-raw-bottom-sheet'

import LoadingModal from './LoadingModal'
import { Colors } from '../constants/Colors'
import { STORAGE_URL } from '../constants/Globals'
import { getPictureBySize } from '../utils/Helper'
import { addFollowingData, removeFollowingData } from '../actions/followings.actions'
const SearchListItem = ({ item, showRemove, hideFollowing, onPress }) => {
  const dispatch = useDispatch()
  const userData = useSelector((state) => state.user)
  const followings = useSelector((state) => state.followings.followings)
  const [loading, setLoading] = useState(false)
  const refBottomSheet = useRef(null)

  if (!item) return false
  const { id, file, firstName, lastName } = item
  const isFollowing = followings.find((e) => e.userId === id)

  return (
    <>
      <TouchableOpacity onPress={onPress}>
        <View style={styles.container}>
          <View style={{ flexDirection: 'row' }}>
            {file ? (
              file.filename ? (
                <Image
                  source={{ uri: `${STORAGE_URL}/${file.filename}?alt=media` }}
                  imageStyle={{ borderRadius: 24 }}
                  style={styles.avatar}
                />
              ) : file.photoURL ? (
                <Image
                  source={{ uri: getPictureBySize(file.photoURL, 480, 480) }}
                  imageStyle={{ borderRadius: 24 }}
                  style={styles.avatar}
                />
              ) : (
                <Image
                  source={require('../assets/images/avatar_small.png')}
                  imageStyle={{ borderRadius: 24, width: 48, height: 48 }}
                  style={{ width: 48, height: 48 }}
                />
              )
            ) : null}
            <Text style={styles.fullName}>{`${firstName} ${lastName}`}</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            {!(hideFollowing && isFollowing) ? (
              <TouchableOpacity
                style={{ marginRight: 5 }}
                disabled={loading}
                onPress={(e) => {
                  if (isFollowing) {
                    refBottomSheet.current.open()
                  } else {
                    setLoading(true)
                    dispatch(addFollowingData(id, userData.id, () => setLoading(false)))
                  }
                }}>
                <View style={isFollowing ? styles.following : styles.follow}>
                  <Text
                    style={{ fontSize: 12, color: isFollowing ? Colors.primary : Colors.white }}>
                    {isFollowing ? 'Following' : 'Follow'}
                  </Text>
                </View>
              </TouchableOpacity>
            ) : null}
            {showRemove ? (
              <TouchableOpacity disabled={loading} onPress={() => refBottomSheet.current.open()}>
                <View style={styles.following}>
                  <Text style={{ fontSize: 12, color: Colors.primary }}>Remove</Text>
                </View>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
      <RBSheet
        ref={refBottomSheet}
        height={260}
        openDuration={250}
        customStyles={{
          container: {
            backgroundColor: 'rgba(0,0,0,0)',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 10,
            marginBottom: 20,
            marginLeft: 20,
            width: Dimensions.get('screen').width - 40,
            height: 400,
          },
        }}>
        <View
          style={{
            backgroundColor: Colors.white,
            width: '100%',
            borderRadius: 10,
          }}>
          {showRemove ? (
            <Text style={{ fontWeight: '600', fontSize: 17, textAlign: 'center', paddingTop: 20 }}>
              Remove Follower?
            </Text>
          ) : null}
          <View style={{ alignItems: 'center', marginTop: 29 }}>
            {file ? (
              file.filename ? (
                <Image
                  source={{ uri: `${STORAGE_URL}/${file.filename}?alt=media` }}
                  imageStyle={{ borderRadius: 46 }}
                  style={styles.bigAvatar}
                />
              ) : file.photoURL ? (
                <Image
                  source={{ uri: getPictureBySize(file.photoURL, 480, 480) }}
                  imageStyle={{ borderRadius: 46 }}
                  style={styles.bigAvatar}
                />
              ) : (
                <Image
                  source={require('../assets/images/avatar_small.png')}
                  imageStyle={{ borderRadius: 24, width: 92, height: 92 }}
                  style={{ width: 92, height: 92 }}
                />
              )
            ) : null}
          </View>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 15,
              marginTop: 10,
              fontWeight: '600',
            }}>{`${firstName} ${lastName}`}</Text>
          <View style={{ backgroundColor: Colors.lightGray, height: 1, marginTop: 20 }} />
          <TouchableOpacity
            style={{
              height: 56,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => {
              refBottomSheet.current.close()
              setLoading(true)
              if (showRemove) {
                dispatch(removeFollowingData(userData.id, id, () => setLoading(false), 'follower'))
              } else {
                dispatch(removeFollowingData(id, userData.id, () => setLoading(false)))
              }
            }}>
            <View>
              <Text
                style={{
                  textAlign: 'center',
                  color: showRemove ? Colors.red : Colors.black,
                  fontSize: 17,
                  fontWeight: '600',
                }}>
                {showRemove ? 'Remove' : 'Unfollow'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.bottomSheetCancel}
          onPress={() => refBottomSheet.current.close()}>
          <View>
            <Text
              style={{
                textAlign: 'center',
                fontWeight: '600',
                fontSize: 16,
                color: Colors.darkGray,
              }}>
              Cancel
            </Text>
          </View>
        </TouchableOpacity>
      </RBSheet>
      {loading && <LoadingModal />}
    </>
  )
}
export default SearchListItem

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  avatar: {
    width: 48,
    height: 48,
  },
  bigAvatar: {
    width: 92,
    height: 92,
  },
  fullName: {
    marginTop: 5,
    marginLeft: 10,
    fontWeight: '600',
  },
  follow: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  following: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  bottomSheetCancel: {
    backgroundColor: '#f3f3f3',
    bottom: 0,
    position: 'absolute',
    width: '100%',
    height: 56,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
})
