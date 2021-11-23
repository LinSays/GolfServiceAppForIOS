import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import OptionsMenu from 'react-native-option-menu'

import { Colors } from '../constants/Colors'
import { getAvatarInitials } from '../utils/Helper'
import Avatar from './Avatar'
import SvgIcon from './SvgIcons'

const Group = ({
  groupName,
  participants,
  teeTime,
  editGroup,
  deleteGroup,
  onPressAdd,
  onPressRemove,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Text style={styles.title}>{groupName}</Text>
        <OptionsMenu
          customButton={
            <View style={{ paddingLeft: 15, paddingTop: 12, paddingBottom: 12 }}>
              <SvgIcon type="three_dots" />
            </View>
          }
          buttonStyle={{ width: 32, height: 8, margin: 7.5, resizeMode: 'contain' }}
          destructiveIndex={1}
          options={['Edit Group', 'Delete', 'Cancel']}
          actions={[editGroup, deleteGroup]}
        />
      </View>
      <View style={styles.teeTimeSection}>
        <Text style={styles.teeTimeLabel}>Tee Time</Text>
        <Text style={styles.teeTime}>{teeTime}</Text>
      </View>
      <View style={styles.body}>
        {participants
          ? participants.map((p) => (
              <View
                key={p.recordID}
                style={{ ...styles.participant, justifyContent: 'space-between', padding: 3 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Avatar
                    img={!p.invited && p.hasThumbnail ? { uri: p.thumbnailPath } : undefined}
                    width={40}
                    height={40}
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
                  <Text style={{ ...styles.name, marginLeft: 11 }}>{p.fullName}</Text>
                </View>
                <TouchableOpacity onPress={() => onPressRemove(p.recordID)}>
                  <SvgIcon type="cross" style={{ marginRight: 15 }} />
                </TouchableOpacity>
              </View>
            ))
          : null}
        {!participants || (participants && participants.length < 4) ? (
          <TouchableOpacity onPress={onPressAdd}>
            <View style={{ ...styles.participant, paddingHorizontal: 20, paddingVertical: 16 }}>
              <Text style={{ fontSize: 16 }}>+</Text>
              <Text style={styles.placeholder}>Add Participant</Text>
            </View>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  )
}

export default Group

const styles = StyleSheet.create({
  container: { backgroundColor: Colors.white, borderRadius: 10, marginBottom: 20 },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: Colors.lightGray,
    borderBottomWidth: 1,
    padding: 20,
  },
  title: { fontSize: 17, fontWeight: '600' },
  teeTimeSection: { flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
  teeTimeLabel: { fontSize: 13 },
  teeTime: { fontSize: 13, color: Colors.extraLight },
  body: {
    marginBottom: 20,
  },
  participant: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 26,
    borderColor: Colors.border,
  },
  placeholder: { color: Colors.gray, fontSize: 16, fontWeight: '600', marginLeft: 13 },
  name: { fontSize: 17 },
})
