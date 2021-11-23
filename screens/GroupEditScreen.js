import React, { useState } from 'react'
import { useNavigation, useRoute } from '@react-navigation/core'
import { Keyboard, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native'
import Input from '../components/Input'
import PrimaryButton from '../components/PrimaryButton'
import { Colors } from '../constants/Colors'
import { isset } from '../utils/Helper'
import BottomSection from '../components/BottomSection'
import { updateEventById } from '../utils/DataUtils'
import LoadingModal from '../components/LoadingModal'
import { SCREEN_NAMES } from '../constants/Globals'

const GroupEditScreen = ({ event }) => {
  const route = useRoute()
  const navigation = useNavigation()
  const [data, setData] = useState({
    id: isset(() => route.params.group.id) ? route.params.group.id : -1,
    name: isset(() => route.params.group.name) ? route.params.group.name : '',
    teeTime: isset(() => route.params.group.teeTime) ? route.params.group.teeTime : '',
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (type, value) => {
    setData({ ...data, [type]: value })
  }

  const handleUpdate = async () => {
    setIsLoading(true)
    const updatedGroups = event.groups
      ? event.groups.find((g) => g.id === data.id)
        ? event.groups.map((g) => (g.id === data.id ? data : g))
        : [...event.groups, data]
      : [data]
    await updateEventById(event.id, { groups: updatedGroups })
    setIsLoading(false)
    navigation.navigate(SCREEN_NAMES.PAIRINGS_MAIN, { event: { ...event, groups: updatedGroups } })
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.label}>Group Name</Text>
          <Input
            style={{ color: Colors.secondaryLight, height: 'auto' }}
            placeholderTextColor={Colors.secondaryLight}
            placeholder="Group Name"
            blurOnSubmit={false}
            value={data.name}
            onChangeText={(value) => handleChange('name', value)}
          />
          <View style={{ marginTop: 20 }} />
          <Text style={styles.label}>Tee Time</Text>
          <Input
            style={{ color: Colors.secondaryLight, height: 'auto' }}
            placeholderTextColor={Colors.secondaryLight}
            placeholder="Tee Time"
            blurOnSubmit={false}
            value={data.teeTime}
            onChangeText={(value) => handleChange('teeTime', value)}
          />
        </View>
        <BottomSection>
          <PrimaryButton
            style={{ width: '100%', marginVertical: 10 }}
            title="Update Group"
            onPress={handleUpdate}
          />
        </BottomSection>
        {isLoading && <LoadingModal />}
      </View>
    </TouchableWithoutFeedback>
  )
}

export default GroupEditScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    flex: 1,
    marginHorizontal: 16,
    marginVertical: 20,
    marginBottom: 120,
    borderRadius: 10,
    padding: 20,
    backgroundColor: Colors.white,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
})
