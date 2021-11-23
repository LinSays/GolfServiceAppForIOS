import React from 'react'
import { ActivityIndicator, Modal, Platform, StatusBar, StyleSheet, Text, View } from 'react-native'
import { Colors } from '../constants/Colors'
// import { Fonts } from '../constants/Fonts'

const LoadingModal = () => {
  return (
    <Modal transparent={true}>
      {Platform.OS === 'android' && <StatusBar backgroundColor="rgba(52, 52, 52, 0.6)" />}
      <View style={styles.container}>
        <View style={styles.modalView}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.modalText}>Loading</Text>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 52, 52, 0.6)',
  },
  modalView: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 35,
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.04)',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 5,
    shadowOpacity: 1,
  },
  modalText: {
    // fontFamily: Fonts.AvenirNextMedium,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
    color: Colors.black,
    paddingLeft: 28,
  },
})

export default LoadingModal
