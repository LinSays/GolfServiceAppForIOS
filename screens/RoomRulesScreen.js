import React, { useState } from 'react'
import { StyleSheet, Text, View, Dimensions } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview'

import Input from '../components/Input'
import PrimaryButton from '../components/PrimaryButton'
import { Colors } from '../constants/Colors'
import { SCREEN_NAMES } from '../constants/Globals'
import BottomSection from '../components/BottomSection'

const RoomRulesScreen = ({ navigation, route }) => {
  const { roomInfo } = route.params
  const [rules, setRules] = useState('')

  const handleNext = () => {
    navigation.navigate(SCREEN_NAMES.INVITATION, {
      back: SCREEN_NAMES.ROOM_RULES,
      roomInfo,
      rules,
    })
  }

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={{ marginTop: 20 }}>Rules</Text>
          <Input
            style={{ color: Colors.secondaryLight, height: 'auto' }}
            containerStyle={styles.inputContainerStyle}
            placeholderTextColor={Colors.secondaryLight}
            maxLength={150}
            multiline
            placeholder="For the boys club"
            autoCapitalize="words"
            blurOnSubmit={false}
            value={rules}
            onChangeText={(value) => setRules(value)}
          />
        </View>
      </KeyboardAwareScrollView>
      <BottomSection>
        <PrimaryButton
          style={{ width: '100%', marginVertical: 10 }}
          title={rules.length !== 0 ? 'Next' : 'Do This Later'}
          onPress={handleNext}
        />
      </BottomSection>
    </View>
  )
}

export default RoomRulesScreen

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
