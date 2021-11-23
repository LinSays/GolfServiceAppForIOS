import React, { useEffect, useState } from 'react'
import { Dimensions, StyleSheet, Text, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview'

import Input from '../components/Input'
import PrimaryButton from '../components/PrimaryButton'
import BottomSection from '../components/BottomSection'
import { Colors } from '../constants/Colors'
import { SCREEN_NAMES } from '../constants/Globals'
import { isset } from '../utils/Helper'
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentEvent } from '../actions'

const RulesScreen = ({ route, navigation }) => {
  const dispatch = useDispatch()
  const currentEvent = useSelector((state) => state.currentEvent)
  const [rule, setRule] = useState('')

  useEffect(() => {
    setRule(currentEvent.rule)
  }, [])

  const handleNext = () => {
    dispatch(setCurrentEvent({ ...currentEvent, rule }))
    navigation.navigate(SCREEN_NAMES.EVENT_DATETIME, {
      isEdition: isset(() => route.params.isEdition) ? true : null,
    })
  }

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.label}>Format & Rules</Text>
          <Input
            style={{ color: Colors.secondaryLight, height: 'auto' }}
            containerStyle={styles.inputContainerStyle}
            placeholderTextColor={Colors.secondaryLight}
            placeholder="Input your Rules"
            maxLength={1000}
            multiline={true}
            blurOnSubmit={false}
            value={rule}
            onChangeText={(value) => setRule(value)}
          />
        </View>
      </KeyboardAwareScrollView>
      <BottomSection>
        <PrimaryButton
          style={{ width: '100%', marginVertical: 10 }}
          title="Next"
          onPress={handleNext}
        />
      </BottomSection>
    </View>
  )
}

export default RulesScreen

const styles = StyleSheet.create({
  section: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 20,
    padding: 20,
  },
  inputContainerStyle: {
    height: 'auto',
    maxHeight: Dimensions.get('screen').height - 220,
    paddingBottom: 10,
    marginBottom: 5,
    borderBottomColor: Colors.lightGray,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
})
