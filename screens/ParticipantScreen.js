import React from 'react'
import { FlatList, StyleSheet, View } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/core'

import ListItem from '../components/ListItem'
import PrimaryButton from '../components/PrimaryButton'
import { Colors } from '../constants/Colors'
import { SCREEN_NAMES } from '../constants/Globals'
import BottomSection from '../components/BottomSection'
import { isset } from '../utils/Helper'

const PairingsScreen = ({ event }) => {
  const navigation = useNavigation()
  const route = useRoute()
  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <FlatList
          data={
            isset(() => route.params.event.participants)
              ? route.params.event.participants
              : event && event.participants
              ? event.participants
              : null
          }
          keyExtractor={(item, index) => item.recordID + index}
          renderItem={({ item }) => <ListItem item={item} />}
        />
      </View>
      <BottomSection>
        <PrimaryButton
          style={{ width: '100%', marginVertical: 10 }}
          title="Invite More Participants"
          onPress={() =>
            navigation.navigate(SCREEN_NAMES.INVITATION, { title: 'Invite Participants' })
          }
        />
      </BottomSection>
    </View>
  )
}

export default PairingsScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    flex: 1,
    backgroundColor: Colors.white,
    marginHorizontal: 15,
    marginVertical: 20,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
})
