import React, { useState, useContext, useEffect } from 'react'
import { StyleSheet, Text, View, Dimensions } from 'react-native'
import ToggleSwitch from 'toggle-switch-react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview'

import { RoomContext } from '../context/RoomContext'
import Input from '../components/Input'
import PrimaryButton from '../components/PrimaryButton'
import BottomSection from '../components/BottomSection'
import { Colors } from '../constants/Colors'
import { SCREEN_NAMES } from '../constants/Globals'

const RoomDetailsScreen = ({ navigation, route }) => {
  const roomContext = useContext(RoomContext)
  const { setNavRoom, channelData } = roomContext

  const { isEdit } = route.params

  useEffect(() => {
    setNavRoom(navigation)
  }, [])

  const [roomInfo, setRoomInfo] = useState({
    name: isEdit ? channelData.title : '',
    // description: '',
    isPublic: isEdit ? channelData.isPublic : false,
  })

  const handleChange = (type, value) => {
    setRoomInfo({ ...roomInfo, [type]: value })
  }

  const handleNext = () => {
    navigation.navigate(SCREEN_NAMES.INVITATION, {
      roomInfo,
      isEdit,
      back: SCREEN_NAMES.ROOM_DETAILS,
    })
  }

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView>
        <View style={styles.section}>
          <View style={styles.subItem}>
            <View>
              <Text style={styles.publicGroup}>Public Group</Text>
              <Text style={styles.anyoneText}>Anyone can join</Text>
            </View>
            <ToggleSwitch
              isOn={roomInfo.isPublic || false}
              onColor={Colors.white}
              offColor={Colors.white}
              thumbOnStyle={{ backgroundColor: Colors.green }}
              thumbOffStyle={{ backgroundColor: Colors.extraLight }}
              trackOnStyle={{ borderWidth: 1, borderColor: Colors.green }}
              trackOffStyle={{ borderWidth: 1, borderColor: Colors.extraLight }}
              size="small"
              onToggle={(isOn) => handleChange('isPublic', isOn)}
            />
          </View>
          <Text style={{ marginTop: 20 }}>Club Name</Text>
          <Input
            style={{ color: Colors.secondaryLight, height: 'auto' }}
            placeholderTextColor={Colors.secondaryLight}
            maxLength={150}
            placeholder="Enter Club Name"
            autoCapitalize="words"
            blurOnSubmit={false}
            value={roomInfo.name}
            onChangeText={(value) => handleChange('name', value)}
          />
          {/* <Text style={{ marginTop: 10 }}>Room Description</Text>
          <Input
            style={{ color: Colors.secondaryLight, height: 'auto' }}
            containerStyle={styles.inputContainerStyle}
            placeholderTextColor={Colors.secondaryLight}
            maxLength={150}
            multiline={true}
            placeholder="Enter Room Description"
            autoCapitalize="words"
            blurOnSubmit={false}
            value={roomInfo.description}
            onChangeText={(value) => handleChange('description', value)}
          /> */}
        </View>
      </KeyboardAwareScrollView>
      <BottomSection>
        <PrimaryButton
          disabled={!roomInfo.name}
          style={{ width: '100%', marginVertical: 10 }}
          title="Next"
          onPress={handleNext}
        />
      </BottomSection>
    </View>
  )
}

export default RoomDetailsScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainerStyle: {
    height: 'auto',
    maxHeight: Dimensions.get('screen').height - 450,
    paddingBottom: 10,
    marginBottom: 5,
    borderBottomColor: Colors.lightGray,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 20,
    padding: 20,
    marginBottom: 120,
    height: Dimensions.get('screen').height - 230,
  },
  subItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 15,
  },
  publicGroup: {
    color: Colors.black,
    fontSize: 15,
    fontWeight: '600',
  },
  anyoneText: {
    color: Colors.extraLight,
    fontSize: 11,
    fontWeight: '500',
  },
})
