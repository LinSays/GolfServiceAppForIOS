import React from 'react'
import {
  Image,
  View,
  Modal,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  Platform,
} from 'react-native'
import { useHeaderHeight } from '@react-navigation/stack'
import { useSelector } from 'react-redux'

import PrimaryButton from '../components/PrimaryButton'
import SvgIcon from './SvgIcons'
import { Colors } from '../constants/Colors'
import { STORAGE_URL } from '../constants/Globals'
import { updateUserDataById } from '../utils/DataUtils'

const IntroSlide = ({ step, setStep, filename, photoURL }) => {
  const headerHeight = useHeaderHeight()
  const userData = useSelector((state) => state.user)

  return (
    <Modal transparent={true}>
      <View style={styles.introContainer}>
        <View
          style={{
            ...styles.introDescriptionSection,
            marginTop: headerHeight,
            opacity: step === 0 ? 1 : 0,
          }}>
          <View style={styles.introDescription}>
            <Text style={styles.introTitle}>User Profile</Text>
            <Text style={{ color: Colors.white, lineHeight: 20 }}>
              Click this picture if you want to see your profile and other useful information
              related to your GHIN number
            </Text>
          </View>
          <SvgIcon type="arrow_right" style={{ marginTop: -35, marginRight: 10 }} />
          <View style={styles.introFocusSection}>
            {filename ? (
              <Image
                source={{ uri: `${STORAGE_URL}/${filename}?alt=media` }}
                imageStyle={{ borderRadius: 12 }}
                style={styles.avatar}
              />
            ) : photoURL ? (
              <Image
                source={{ uri: photoURL }}
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
          </View>
        </View>

        <View
          style={{
            ...styles.introDescriptionSection,
            marginTop: headerHeight,
            opacity: step === 1 ? 1 : 0,
          }}>
          <View style={styles.introDescription}>
            <Text style={styles.introTitle}>Notification</Text>
            <Text style={{ color: Colors.white, lineHeight: 20 }}>
              You can see invites, activities, and other useful information about events by clicking
              this icon
            </Text>
          </View>
          <SvgIcon type="arrow_right" style={{ marginTop: -35, marginRight: 10 }} />
          <View
            style={{
              ...styles.introFocusSection,
              marginRight: 54,
              marginTop: Platform.OS === 'ios' ? -51 : -57,
            }}>
            <SvgIcon type="notification" />
          </View>
        </View>

        <View
          style={{
            ...styles.introDescriptionSection,
            flexDirection: 'column',
            alignItems: 'flex-end',
            marginTop: headerHeight,
            opacity: step === 2 ? 1 : 0,
          }}>
          <View style={{ ...styles.introFocusSection, marginRight: 105 }}>
            <SvgIcon type="calendar" />
          </View>
          <SvgIcon type="arrow_up" style={{ marginRight: 121, marginTop: 14 }} />
          <View style={{ width: 215, marginTop: 10 }}>
            <Text style={styles.introTitle}>Upcoming Events</Text>
            <Text style={{ color: Colors.white, lineHeight: 20 }}>
              You can view upcoming events that you were invited in this menu
            </Text>
          </View>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity onPress={() => setStep(step > 0 ? step - 1 : step)}>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <SvgIcon type="arrow_left_small" style={styles.arrow} />
              <Text
                style={{ color: Colors.white, fontWeight: '600', fontSize: 16, marginLeft: 10 }}>
                Back
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableWithoutFeedback
            onPress={async () => {
              setStep(-1)
              if (userData.id) {
                await updateUserDataById(userData.id, { guided: true })
              }
            }}>
            <Text
              style={{ fontSize: 16, fontWeight: '600', color: Colors.white, marginBottom: -20 }}>
              Skip Guide
            </Text>
          </TouchableWithoutFeedback>
          <TouchableOpacity
            onPress={async () => {
              setStep(step < 4 ? step + 1 : -1)
              if (userData.id && step >= 4) {
                await updateUserDataById(userData.id, { guided: true })
              }
            }}>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <Text
                style={{ color: Colors.white, fontWeight: '600', fontSize: 16, marginRight: 10 }}>
                Next
              </Text>
              <SvgIcon type="arrow_right_small" style={styles.arrow} />
            </View>
          </TouchableOpacity>
        </View>

        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            flexDirection: 'column',
            alignItems: 'flex-start',
            marginBottom: 19,
            opacity: step === 3 ? 1 : 0,
            width: Dimensions.get('screen').width - 16,
          }}>
          <View style={{ width: 215, marginBottom: 10, marginLeft: 16 }}>
            <Text style={styles.introTitle}>Create an event</Text>
            <Text style={{ color: Colors.white, lineHeight: 20 }}>
              Ready for your next game or tournament? Create an event to setup game methods and
              invite people
            </Text>
          </View>
          <SvgIcon type="arrow_down" style={{ marginLeft: 44 }} />
          <PrimaryButton
            style={{ ...styles.button, marginLeft: 22 }}
            title="Create an event"
            icon="event"
            buttonStyle={{ ...styles.buttonStyle, backgroundColor: Colors.white }}
            buttonTextStyle={{ ...styles.buttonTextStyle, color: Colors.black }}
            onPress={() => true}
          />
        </View>

        <View
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            flexDirection: 'column',
            alignItems: 'flex-end',
            marginBottom: 19,
            opacity: step === 4 ? 1 : 0,
            width: Dimensions.get('screen').width - 16,
          }}>
          <View style={{ width: 215, marginBottom: 10, marginRight: 5 }}>
            <Text style={styles.introTitle}>Start a club</Text>
            <Text style={{ color: Colors.white, lineHeight: 20 }}>
              You can create a club and invite people to start conversation or communication
            </Text>
          </View>
          <SvgIcon
            type="arrow_down"
            style={{ marginRight: (Dimensions.get('screen').width - 32) * 0.45 - 30 }}
          />
          <PrimaryButton
            style={{ ...styles.button, marginRight: 22 }}
            title="Start a club"
            icon="room"
            buttonStyle={{ ...styles.buttonStyle, backgroundColor: Colors.black }}
            buttonTextStyle={styles.buttonTextStyle}
            onPress={() => true}
          />
        </View>
      </View>
    </Modal>
  )
}

export default IntroSlide

const styles = StyleSheet.create({
  introContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.black,
    opacity: 0.7,
  },
  introDescriptionSection: {
    flexDirection: 'row',
    position: 'absolute',
    top: 0,
    right: 0,
  },
  introDescription: {
    width: 215,
    marginRight: 10,
    marginTop: -55,
  },
  arrow: {
    borderWidth: 1,
    borderColor: Colors.white,
    padding: 10,
    borderRadius: 9999,
  },
  introTitle: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: '600',
    marginBottom: 10,
  },
  introFocusSection: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
    width: 56,
    height: 56,
    marginTop: Platform.OS === 'ios' ? -50 : -57,
  },
  avatar: { width: 24, height: 24, marginHorizontal: 16, borderRadius: 12 },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: '100%',
    paddingHorizontal: 21,
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
})
