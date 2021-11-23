import React from 'react'
import { Dimensions, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native'
import { Colors } from '../constants/Colors'
import { getAvatarInitials } from '../utils/Helper'
import Avatar from './Avatar'
import PrimaryButton from './PrimaryButton'
import SvgIcon from './SvgIcons'

const ListItem = ({
  item,
  checkBox,
  disabled,
  onPressCheckbox,
  onPressInvite,
  btnTitle = 'Invite',
}) => {
  let itemName = ''
  if (item.fullName) {
    itemName = item.fullName.length > 15 ? `${item.fullName.slice(0, 15)}...` : `${item.fullName}`
  } else {
    itemName =
      (item.givenName + item.familyName).length > 15
        ? `${item.givenName}`
        : `${item.givenName} ${item.familyName}`
  }

  return (
    <View style={{ ...styles.container, opacity: disabled && !item.groupNum ? 0.5 : 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Avatar
          img={
            (!item.invited || item.status === 'Accepted') && item.hasThumbnail
              ? { uri: item.thumbnailPath }
              : undefined
          }
          width={40}
          height={40}
          placeholder={
            item.fullName
              ? getAvatarInitials(`${item.fullName.split(' ')[0]} ${item.fullName.split(' ')[1]}`)
              : getAvatarInitials(`${item.givenName} ${item.familyName}`)
          }
          roundedPlaceholder
          roundedImage
        />
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.name}>{itemName}</Text>
          <Text style={{ fontSize: 13 }}>Contact</Text>
        </View>
      </View>
      {checkBox ? (
        <TouchableWithoutFeedback
          disabled={disabled && !item.groupNum}
          onPress={() => onPressCheckbox(item)}>
          <View
            style={{
              ...styles.checkBox,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: item.groupNum ? Colors.primary : Colors.white,
            }}>
            {item.groupNum ? <SvgIcon type="checkMark" /> : null}
          </View>
        </TouchableWithoutFeedback>
      ) : item.status ? (
        <Text style={{ fontSize: 12, ...styles[item.status.toLowerCase()] }}>{item.status}</Text>
      ) : (
        <PrimaryButton
          title={btnTitle}
          disabled={item.invited}
          buttonStyle={{
            ...styles.buttonStyle,
            backgroundColor: !item.invited ? Colors.white : Colors.primary,
          }}
          buttonTextStyle={{
            ...styles.buttonTextStyle,
            color: !item.invited ? Colors.primary : Colors.white,
          }}
          onPress={() => onPressInvite(item)}
        />
      )}
    </View>
  )
}

export default ListItem

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    alignItems: 'center',
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
  },
  buttonStyle: {
    width: 65,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  buttonTextStyle: { fontSize: 12, marginTop: 7 },
  pending: {
    color: Colors.orange,
  },
  accepted: {
    color: Colors.green,
  },
  checkBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
})
