import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { FlatList, ScrollView, StyleSheet, Text, View, Alert } from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/core'

import Group from '../components/Group'
import ListItem from '../components/ListItem'
import LoadingModal from '../components/LoadingModal'
import PrimaryButton from '../components/PrimaryButton'
import BottomSection from '../components/BottomSection'
import { Colors } from '../constants/Colors'
import { updateEventById } from '../utils/DataUtils'
import { isset } from '../utils/Helper'
import { SCREEN_NAMES } from '../constants/Globals'
import { setEventsData } from '../actions/events.actions'

const PairingsScreen = ({ event }) => {
  const events = useSelector((state) => state.events.events)
  const dispatch = useDispatch()
  const route = useRoute()
  const [updatedEvent, setUpdatedEvent] = useState(
    isset(() => route.params.event) ? route.params.event : event,
  )
  const [selectedGroup, setSelectedGroup] = useState({})
  const [participants, setParticipants] = useState(updatedEvent.participants)
  const [confirmPairing, setConfirmPairing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigation = useNavigation()

  const handleSelect = (item) => {
    const updatedParticipants = participants.map((participant) =>
      participant.recordID === item.recordID
        ? {
            ...participant,
            groupNum: item.groupNum ? null : selectedGroup.id,
          }
        : participant,
    )
    setParticipants(updatedParticipants)
  }

  const handleAddToGroup = () => {
    setConfirmPairing(true)
  }

  const handleDeleteGroup = async (groupId) => {
    try {
      setIsLoading(true)

      if (confirmPairing) {
        setConfirmPairing(false)
        setSelectedGroup([])
      }
      let updatingGroups = [...updatedEvent.groups]
      updatingGroups = updatingGroups.filter((group) => group.id !== groupId)

      const res = await updateEventById(updatedEvent.id, { groups: updatingGroups })

      if (res.status !== 'success') {
        Alert.alert('Error', 'Failed to delete group! Please try again!')
        return
      }
      let updatedEvents = [...events]
      const foundIndex = updatedEvents.findIndex((event) => event.id === updatedEvent.id)
      const eventObj = { ...updatedEvent, groups: updatingGroups }
      updatedEvents[foundIndex] = eventObj

      dispatch(setEventsData(updatedEvents))
      setUpdatedEvent(eventObj)
      setIsLoading(false)
    } catch (err) {
      Alert.alert('Error', 'Something went wrong!')
      setIsLoading(false)
      console.error(err)
    }
  }

  const handleConfirm = async () => {
    setIsLoading(true)
    setConfirmPairing(false)
    setSelectedGroup([])
    await updateEventById(updatedEvent.id, { participants })
    setIsLoading(false)
  }

  const handleRemoveParticipant = (recordID) => {
    const updatedParticipants = participants.map((participant) =>
      participant.recordID === recordID ? { ...participant, groupNum: null } : participant,
    )
    setParticipants(updatedParticipants)
  }

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, marginHorizontal: 16 }}>
        {confirmPairing ? (
          <Group
            groupName={selectedGroup.name}
            teeTime={selectedGroup.teeTime}
            participants={participants.filter(
              (participant) => participant.groupNum === selectedGroup.id,
            )}
            editGroup={() => {
              navigation.navigate(SCREEN_NAMES.PAIRINGS_GROUP_EDIT, { group: selectedGroup })
            }}
            deleteGroup={() => handleDeleteGroup(selectedGroup.id)}
            onPressAdd={() => setConfirmPairing(false)}
            onPressRemove={handleRemoveParticipant}
          />
        ) : selectedGroup.id > 0 ? (
          <View style={styles.participants}>
            <FlatList
              keyExtractor={(item, index) => item.recordID + index}
              data={
                participants
                  ? participants.filter((p) => !p.groupNum || p.groupNum === selectedGroup.id)
                  : null
              }
              renderItem={({ item }) => (
                <ListItem
                  item={item}
                  disabled={
                    participants &&
                    participants.filter((p) => p.groupNum === selectedGroup.id).length > 3
                  }
                  onPressCheckbox={handleSelect}
                  checkBox
                />
              )}
            />
          </View>
        ) : (
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {updatedEvent.groups
              ? updatedEvent.groups.map((group) => (
                  <Group
                    key={group.id}
                    groupName={group.name}
                    teeTime={group.teeTime}
                    participants={participants.filter(
                      (participant) => participant.groupNum === group.id,
                    )}
                    editGroup={() => {
                      navigation.navigate(SCREEN_NAMES.PAIRINGS_GROUP_EDIT, { group })
                    }}
                    deleteGroup={() => handleDeleteGroup(group.id)}
                    onPressAdd={() => setSelectedGroup(group)}
                    onPressRemove={handleRemoveParticipant}
                  />
                ))
              : null}
          </ScrollView>
        )}
      </View>
      {confirmPairing ? (
        <BottomSection>
          <PrimaryButton
            style={{ width: '100%', marginVertical: 10 }}
            title="Confirm Pairings"
            onPress={handleConfirm}
          />
        </BottomSection>
      ) : selectedGroup.id > 0 ? (
        <BottomSection>
          <PrimaryButton
            style={{ width: '100%', marginVertical: 10 }}
            title={`Add to Group ${selectedGroup.id} (${
              participants.filter((participant) => participant.groupNum === selectedGroup.id).length
            }/4)`}
            onPress={handleAddToGroup}
          />
        </BottomSection>
      ) : null}
      {isLoading && <LoadingModal />}
    </View>
  )
}

export default PairingsScreen

const styles = StyleSheet.create({
  container: { flex: 1, marginTop: 20 },
  participants: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
})
