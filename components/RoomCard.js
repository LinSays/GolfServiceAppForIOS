import React, { useRef } from 'react'
import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  TouchableWithoutFeedback,
  Image,
  TouchableOpacity,
} from 'react-native'
import { SwipeRow } from 'react-native-swipe-list-view'

import { Colors } from '../constants/Colors'
import { getAvatarInitials } from '../utils/Helper'
import Avatar from './Avatar'
import SvgIcon from './SvgIcons'

const RoomCard = ({
  title,
  // desp,
  isPublic,
  isHiddenRoom,
  participants,
  handler,
  isMyRoom,
  handlerDeleteRoom,
  handlerHideRoom,
}) => {
  const refSwipeRow = useRef(null)
  return (
    <SwipeRow rightOpenValue={-125} disableRightSwipe ref={refSwipeRow} closeOnRowPress={true}>
      <View style={styles.standaloneRowBack}>
        <View>
          <TouchableOpacity
            onPress={() => {
              handlerHideRoom()
              refSwipeRow.current.closeRow()
            }}>
            <View
              style={{
                ...styles.rightBox,
                backgroundColor: Colors.black,
              }}>
              <SvgIcon type="hide" />
              <Text style={styles.backTextWhite}>{isHiddenRoom ? 'UnHide' : 'Hide'}</Text>
            </View>
          </TouchableOpacity>
          {isMyRoom && (
            <TouchableOpacity
              onPress={() => {
                handlerDeleteRoom()
                refSwipeRow.current.closeRow()
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
          )}
        </View>
      </View>
      <TouchableWithoutFeedback onPress={handler}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <View style={{ flexDirection: 'row' }}>
              {/* <SvgIcon type="unlock" /> */}
              <Image
                source={
                  isPublic
                    ? require('./../assets/images/unlock.png')
                    : require('./../assets/images/lock.png')
                }
                style={{ width: 15, height: 15, resizeMode: 'stretch' }}
              />
              <Text style={styles.public}>{isPublic ? 'Public' : 'Private'}</Text>
            </View>
          </View>
          {/* <Text style={styles.desp}>{desp}</Text> */}
          <Text style={{ ...styles.desp, marginTop: 10, fontWeight: '600' }}>Members</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {participants &&
              participants.slice(0, 5).map((p, index) => (
                <View key={index} style={{ justifyContent: 'space-between', padding: 3 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Avatar
                      img={!p.invited && p.hasThumbnail ? { uri: p.thumbnailPath } : undefined}
                      width={32}
                      height={32}
                      placeholder={
                        p.fullName
                          ? getAvatarInitials(
                              `${p.fullName.split(' ')[0]} ${p.fullName.split(' ')[1]}`,
                            )
                          : getAvatarInitials(`${p.givenName} ${p.familyName}`)
                      }
                      roundedPlaceholder
                      roundedImage
                    />
                  </View>
                </View>
              ))}
            {participants && participants.length > 5 && (
              <View style={styles.moreParticipant}>
                <Text style={{ fontSize: 16, color: Colors.white }}>{`${
                  participants.length - 5
                }+`}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SwipeRow>
  )
}

export default RoomCard

const styles = StyleSheet.create({
  container: {
    width: Dimensions.get('window').width - 32,
    height: 200,
    justifyContent: 'center',
    alignItems: 'flex-start',
    flexDirection: 'column',
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  public: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray,
    paddingLeft: 5,
  },
  title: {
    width: Dimensions.get('window').width - 150,
    fontSize: 17,
    fontWeight: '600',
    color: Colors.black,
  },
  desp: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.black,
    paddingBottom: 20,
  },
  moreParticipant: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginLeft: 3,
    backgroundColor: Colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: { marginLeft: 5, color: Colors.extraLight, fontWeight: '600', fontSize: 12 },

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
