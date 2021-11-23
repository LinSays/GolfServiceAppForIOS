import React from 'react'
import { Modal, StyleSheet, Text, Image, TouchableOpacity, Dimensions } from 'react-native'
import { useSelector } from 'react-redux'

import { Colors } from '../constants/Colors'
import SvgIcon from './SvgIcons'
import Images from '../utils/Assets'
import { updateUserDataById } from '../utils/DataUtils'

const ProfileGuide = ({ step, setStep }) => {
  const userData = useSelector((state) => state.user)

  return (
    <Modal transparent={true}>
      <TouchableOpacity
        style={styles.next}
        onPress={async () => {
          if (step === 4) {
            setStep(-1)
            if (userData.id) {
              await updateUserDataById(userData.id, { isProfileGuided: true })
            }
          } else {
            setStep(step + 1)
          }
        }}>
        <Text style={{ color: Colors.white, fontSize: 17, marginRight: 12, fontWeight: '600' }}>
          {step === 4 ? 'Finish' : 'Next'}
        </Text>
        <SvgIcon type="arrow_right_small" style={styles.arrowRight} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.skipGuide}
        onPress={async () => {
          setStep(-1)
          if (userData.id) {
            await updateUserDataById(userData.id, { isProfileGuided: true })
          }
        }}>
        <Text style={{ color: Colors.white, textAlign: 'center', fontSize: 17, fontWeight: '600' }}>
          Skip Guide
        </Text>
      </TouchableOpacity>
      {step > 0 ? (
        <TouchableOpacity
          style={styles.back}
          onPress={() => (step === 0 ? setStep(0) : setStep(step - 1))}>
          <SvgIcon type="arrow_left_small" style={styles.arrowRight} />
          <Text style={{ color: Colors.white, fontSize: 17, marginLeft: 12, fontWeight: '600' }}>
            Back
          </Text>
        </TouchableOpacity>
      ) : null}
      {step === 0 ? (
        <Image source={Images.ProfileIntro1} style={styles.image} />
      ) : step === 1 ? (
        <Image source={Images.ProfileIntro2} style={styles.image} />
      ) : step === 2 ? (
        <Image source={Images.ProfileIntro3} style={styles.image} />
      ) : step === 3 ? (
        <Image source={Images.ProfileIntro4} style={styles.image} />
      ) : (
        <Image source={Images.ProfileIntro5} style={styles.image} />
      )}
    </Modal>
  )
}

export default ProfileGuide

const styles = StyleSheet.create({
  arrowRight: {
    borderWidth: 1,
    borderRadius: 999,
    borderColor: Colors.white,
    padding: 15,
  },
  next: {
    position: 'absolute',
    bottom: 66,
    zIndex: 1,
    right: 19,
    flexDirection: 'row',
    alignItems: 'center',
  },
  back: {
    position: 'absolute',
    bottom: 66,
    zIndex: 1,
    left: 19,
    flexDirection: 'row',
    alignItems: 'center',
  },
  skipGuide: {
    position: 'absolute',
    bottom: 20,
    width: 100,
    left: (Dimensions.get('screen').width - 100) / 2,
    zIndex: 1,
  },
  image: {
    width: Dimensions.get('screen').width,
    height: Dimensions.get('screen').height,
  },
})
