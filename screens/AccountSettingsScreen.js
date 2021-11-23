import React, { useState, useEffect, useRef } from 'react'
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
  AppState,
} from 'react-native'
import ToggleSwitch from 'toggle-switch-react-native'
import { useIsFocused } from '@react-navigation/native'
import { check, checkNotifications, PERMISSIONS, RESULTS } from 'react-native-permissions'

import { SCREEN_NAMES } from '../constants/Globals'
import SvgIcon from '../components/SvgIcons'
import { Colors } from '../constants/Colors'
import { PERMISSION_TYPES } from '../constants/Globals'

const AccountSettingsScreen = ({ navigation }) => {
  const isFocused = useIsFocused()
  const appState = useRef(AppState.currentState)

  const [expandedItem, setExpandedItem] = useState('')

  const [toggleNotification, setToggleNotification] = useState(true)
  const [toggleLocation, setToggleLocation] = useState(true)

  useEffect(() => {
    AppState.addEventListener('change', _handleAppStateChange)
    return () => {
      AppState.removeEventListener('change', _handleAppStateChange)
    }
  }, [])

  useEffect(() => {
    if (isFocused) {
      checkPermission()
    }
  }, [isFocused])

  const _handleAppStateChange = (nextAppState) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      checkPermission()
    }

    appState.current = nextAppState
  }

  const checkPermission = () => {
    checkNotifications().then(({ status, settings }) => {
      if (status === RESULTS.GRANTED) {
        setToggleNotification(true)
      } else {
        setToggleNotification(false)
      }
    })

    check(PERMISSIONS.IOS.LOCATION_ALWAYS).then((result) => {
      if (result === RESULTS.GRANTED) {
        setToggleLocation(true)
      } else {
        setToggleLocation(false)
      }
    })

    check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE).then((result) => {
      if (result === RESULTS.GRANTED) {
        setToggleLocation(true)
      } else {
        setToggleLocation(false)
      }
    })
  }

  const handleToggle = async (isOn, type) => {
    if (type === PERMISSION_TYPES.NOTIFICATION) {
      setToggleNotification(isOn)
    } else if (type === PERMISSION_TYPES.LOCATION) {
      setToggleLocation(isOn)
    }
    Linking.openURL('app-settings:')
  }

  return (
    <View style={styles.container}>
      <View style={styles.itemContainer}>
        <TouchableOpacity
          style={styles.item}
          onPress={() =>
            setExpandedItem(
              expandedItem === PERMISSION_TYPES.NOTIFICATION ? '' : PERMISSION_TYPES.NOTIFICATION,
            )
          }>
          <Text style={styles.itemText}>Notification</Text>
          <SvgIcon type="chevronDown" />
        </TouchableOpacity>
        {expandedItem === PERMISSION_TYPES.NOTIFICATION ? (
          <View>
            <View style={styles.subItem}>
              <Text style={styles.subItemText}>Allow Notifications</Text>
              <ToggleSwitch
                isOn={toggleNotification || false}
                onColor={Colors.white}
                offColor={Colors.white}
                thumbOnStyle={{ backgroundColor: Colors.green }}
                thumbOffStyle={{ backgroundColor: Colors.extraLight }}
                trackOnStyle={{ borderWidth: 1, borderColor: Colors.green }}
                trackOffStyle={{ borderWidth: 1, borderColor: Colors.extraLight }}
                size="small"
                onToggle={(isOn) => handleToggle(isOn, PERMISSION_TYPES.NOTIFICATION)}
              />
            </View>
          </View>
        ) : null}
      </View>
      <View style={styles.itemContainer}>
        <TouchableOpacity
          style={styles.item}
          onPress={() =>
            setExpandedItem(
              expandedItem === PERMISSION_TYPES.LOCATION ? '' : PERMISSION_TYPES.LOCATION,
            )
          }>
          <Text style={styles.itemText}>Location Access</Text>
          <SvgIcon type="chevronDown" />
        </TouchableOpacity>
        {expandedItem === PERMISSION_TYPES.LOCATION ? (
          <View>
            <View style={styles.subItem}>
              <Text style={styles.subItemText}>Allow Access to Location</Text>
              <ToggleSwitch
                isOn={toggleLocation || false}
                onColor={Colors.white}
                offColor={Colors.white}
                thumbOnStyle={{ backgroundColor: Colors.green }}
                thumbOffStyle={{ backgroundColor: Colors.extraLight }}
                trackOnStyle={{ borderWidth: 1, borderColor: Colors.green }}
                trackOffStyle={{ borderWidth: 1, borderColor: Colors.extraLight }}
                size="small"
                onToggle={(isOn) => handleToggle(isOn, PERMISSION_TYPES.LOCATION)}
              />
            </View>
          </View>
        ) : null}
      </View>
      <View style={styles.itemContainer}>
        <TouchableOpacity
          style={styles.item}
          onPress={() => navigation.navigate(SCREEN_NAMES.EDIT_PROFILE)}>
          <Text style={styles.itemText}>Profile Setup</Text>
          <SvgIcon type="chevronRight" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default AccountSettingsScreen

const styles = StyleSheet.create({
  container: {
    height: Dimensions.get('screen').height - 140,
    backgroundColor: Colors.white,
    borderRadius: 10,
    marginVertical: 20,
    marginHorizontal: 16,
    padding: 20,
  },
  itemContainer: {
    borderBottomColor: Colors.lightGray,
    borderBottomWidth: 1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingRight: 10,
  },
  itemText: {
    fontSize: 17,
    fontWeight: '600',
  },
  subItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 15,
  },
  subItemText: {
    color: Colors.extraLight,
    fontSize: 15,
    fontWeight: '600',
  },
})
