import React, { useEffect, useState } from 'react'
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { launchImageLibrary } from 'react-native-image-picker'
import DropDownPicker from 'react-native-dropdown-picker'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview'
import Image from 'react-native-image-progress'
import Icon from 'react-native-vector-icons/Feather'

import Input from '../components/Input'
import PrimaryButton from '../components/PrimaryButton'
import SvgIcon from '../components/SvgIcons'
import { Colors } from '../constants/Colors'
import { SCREEN_NAMES, STORAGE_URL } from '../constants/Globals'
import { getCourses } from '../utils/Api'
import BottomSection from '../components/BottomSection'
import { isset, truncateText } from '../utils/Helper'
import Images from '../utils/Assets'
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentEvent } from '../actions'

const clubNames = [
  {
    label: 'Double Eagle',
    value: 'Double Eagle',
    logo: 'DoubleEagleLogo',
    banner: 'DoubleEagleBanner',
    location: '6025 Cheshire Rd, Galena, OH 43021, United States',
  },
  {
    label: 'The Golf Club',
    value: 'The Golf Club',
    logo: 'GolfClubNewAlbanyLogo',
    banner: 'GolfClubNewAlbanyBanner',
    location: '4522 Kitzmiller Rd, New Albany, OH 43054, United States',
  },
  {
    label: 'The Lakes Golf and Country Club',
    value: 'The Lakes Golf and Country Club',
    logo: 'LakesGolfLogo',
    banner: 'LakesGolfBanner',
    location: '6740 Worthington Rd, Westerville, OH 43082, United States',
  },
  {
    label: 'The Muirfield Village Golf and Country Club',
    value: 'The Muirfield Village Golf and Country Club',
    logo: 'MuirfieldLogo',
    banner: 'MuirfieldBanner',
    location: '8715 Muirfield Dr. Dublin, Ohio 43017',
  },
  {
    label: 'The Medallion Club',
    value: 'The Medallion Club',
    logo: 'MedallionLogo',
    banner: 'MedallionBanner',
    location: '5000 Club Dr, Westerville, OH 43082, United States',
  },
  {
    label: 'Jefferson Country Club (JCC)',
    value: 'Jefferson Country Club (JCC)',
    logo: 'JeffersonLogo',
    banner: 'JeffersonBanner',
    location: '7271 Jefferson Meadows Dr, Blacklick, OH 43004, United States',
  },
  {
    label: 'New Albany Country Club (NACC)',
    value: 'New Albany Country Club (NACC)',
    logo: 'NewAlbanyLogo',
    banner: 'NewAlbanyBanner',
    location: '1 Club Ln, New Albany, OH 43054, United States',
  },
  {
    label: 'Bandon Dunes (Dunes Course)',
    value: 'Bandon Dunes (Dunes Course)',
    logo: 'DunesCourseLogo',
    banner: 'DunesCourseBanner',
    location: '5JQ5+3P Bandon, Oregon',
  },
  {
    label: 'Bandon Dunes (Bandon Preserve)',
    value: 'Bandon Dunes (Bandon Preserve)',
    logo: 'BandonPreserveLogo',
    banner: 'BandonPreserveBanner',
    location: '5JP5+7J Bandon, Oregon',
  },
  {
    label: 'Bandon Dunes (Trails)',
    value: 'Bandon Dunes (Trails)',
    logo: 'BandonTrailsLogo',
    banner: 'BandonTrailsBanner',
    location: '5JM5+WG Bandon, Oregon',
  },
  {
    label: 'Bandon Dunes (Pacific Dunes)',
    value: 'Bandon Dunes (Pacific Dunes)',
    logo: 'PacificDunesLogo',
    banner: 'PacificDunesBanner',
    location: '5JV6+C2 Bandon, Oregon',
  },
  {
    label: 'Bandon Dunes (Old Macdonald)',
    value: 'Bandon Dunes (Old Macdonald)',
    logo: 'OldMacdonaldLogo',
    banner: 'OldMacdonaldBanner',
    location: '57744 Round Lake, Bandon, OR 97411',
  },
  {
    label: 'Bandon Dunes (Practice Center)',
    value: 'Bandon Dunes (Practice Center)',
    logo: 'PracticeCenterLogo',
    banner: 'PracticeCenterBanner',
    location: '5JW7+MW Bandon, Oregon',
  },
  {
    label: 'Bandon Dunes (Punchbowl)',
    value: 'Bandon Dunes (Punchbowl)',
    logo: 'PunchbowlLogo',
    banner: 'PunchbowlBanner',
    location: '5JQ5+3P Bandon, Oregon',
  },
  {
    label: 'Bandon Dunes (Sheep Ranch)',
    value: 'Bandon Dunes (Sheep Ranch)',
    logo: 'SheepRanchLogo',
    banner: 'SheepRanchBanner',
    location: 'Whiskey Run Ln, Bandon, OR 97411',
  },
]

const EventDetailsScreen = ({ navigation }) => {
  const dispatch = useDispatch()
  const currentEvent = useSelector((state) => state.currentEvent)
  const [event, setEvent] = useState({
    club: clubNames[0].value,
    name: '',
    course: '',
    location: clubNames[0].location,
    localLogo: clubNames[0].logo,
    localBanner: clubNames[0].banner,
  })
  const [file, setFile] = useState({})
  const [isEdition, setIsEdition] = useState(null)

  useEffect(() => {
    if (currentEvent) {
      navigation.setParams({ isEdition: true })
      setIsEdition(true)
      const { id, club, name, course, location, localBanner, localLogo, logo, banner } =
        currentEvent
      setEvent({ id, club, name, course, location, localBanner, localLogo })
      setFile({ logo, banner: { fileName: banner } })
    }
  }, [])

  const handleChange = (type, value) => {
    setEvent({ ...event, [type]: value })
  }

  const handleOpenGallery = (type) => {
    let options = {
      title: 'Select Image',
      customButtons: [{ name: 'customOptionKey', title: 'Choose Photo from Custom Option' }],
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    }
    launchImageLibrary(options, (response) => handleImageResponse(type, response))
  }

  const handleImageResponse = (type, response) => {
    if (response.didCancel) {
      console.log('User cancelled image picker')
    } else if (response.error) {
      console.log('ImagePicker Error: ', response.error)
    } else if (response.customButton) {
      console.log('User tapped custom button: ', response.customButton)
      Alert.alert(response.customButton)
    } else if (response.errorCode === 'camera_unavailable') {
      Alert.alert('Error!', 'Camera is unavailable on your device!')
    } else {
      setFile({
        ...file,
        [type]: {
          filePath: response,
          fileUri: response.uri,
        },
      })
    }
  }

  const handleNext = () => {
    dispatch(setCurrentEvent({ ...currentEvent, ...event, ...file }))
    navigation.navigate(SCREEN_NAMES.EVENT_DATETIME, { isEdition })
  }

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView>
        <View style={styles.section}>
          <View style={{ flexDirection: 'row' }}>
            <TouchableWithoutFeedback onPress={() => handleOpenGallery('logo')}>
              <View style={styles.uploadLogo}>
                {event.localLogo ? (
                  <Image
                    source={Images[event.localLogo]}
                    imageStyle={{ width: '100%', height: '100%' }}
                    style={{ width: 96, height: 96, borderWidth: 1, borderColor: Colors.border }}
                  />
                ) : file.logo && file.logo.fileUri ? (
                  <Image
                    source={{ uri: file.logo.fileUri }}
                    imageStyle={{ width: '100%', height: '100%' }}
                    style={{ width: 96, height: 96 }}
                  />
                ) : file.logo && file.logo.fileName ? (
                  <Image
                    source={{ uri: `${STORAGE_URL}/${file.logo.fileName}?alt=media` }}
                    imageStyle={{ width: '100%', height: '100%' }}
                    style={{ width: 96, height: 96 }}
                  />
                ) : (
                  <SvgIcon type="vectorCamera" />
                )}
              </View>
            </TouchableWithoutFeedback>
            <View style={styles.logoRight}>
              <Text style={{ fontSize: 13, fontWeight: '600', marginBottom: 11 }}>
                Upload Club Logo
              </Text>
              <Text style={{ width: '100%', fontSize: 16, color: Colors.secondaryLight }}>
                {truncateText(
                  isset(() => file.logo.filePath.fileName)
                    ? file.logo.filePath.fileName
                    : isset(() => file.logo.originalFileName)
                    ? file.logo.originalFileName
                    : '',
                  parseInt((Dimensions.get('screen').width - 200) / 8),
                )}
              </Text>
            </View>
          </View>
          <View style={styles.uploadBanner}>
            {event.localBanner ? (
              <Image
                source={Images[event.localBanner]}
                imageStyle={{ width: '100%', height: '100%' }}
                style={{ width: '100%', height: 178 }}
              />
            ) : file.banner && file.banner.fileUri ? (
              <Image
                source={{ uri: file.banner.fileUri }}
                imageStyle={{ width: '100%', height: '100%' }}
                style={{ width: '100%', height: 178 }}
              />
            ) : file.banner && file.banner.fileName ? (
              <Image
                source={{ uri: `${STORAGE_URL}/${file.banner.fileName}?alt=media` }}
                imageStyle={{ width: '100%', height: '100%' }}
                style={{ width: '100%', height: 178 }}
              />
            ) : (
              <SvgIcon type="vectorCamera" />
            )}
            <View style={{ position: 'absolute', alignItems: 'center' }}>
              {!event.localBanner && !file.banner ? <SvgIcon type="vectorCloud" /> : null}
              <Text
                style={{
                  fontSize: 12,
                  color: event.localBanner || file.banner ? Colors.white : Colors.secondaryLight,
                  marginVertical: 14,
                }}>
                {event.localBanner || file.banner
                  ? 'You can change event banner'
                  : 'Upload photo for event banner'}
              </Text>
              <TouchableOpacity onPress={() => handleOpenGallery('banner')}>
                <SvgIcon type="camera" />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={{ marginTop: 20 }}>Golf Club</Text>
          <DropDownPicker
            items={clubNames}
            containerStyle={{ height: 40, marginVertical: 10 }}
            style={{ ...styles.dropDownStyle, zIndex: 9999 }}
            labelStyle={styles.dropDownLabel}
            dropDownStyle={{ ...styles.dropdown, zIndex: 999999 }}
            itemStyle={{ ...styles.dropdownItem, zIndex: 999999 }}
            defaultValue={event.club || clubNames[0].value}
            onChangeItem={(item) => {
              setEvent({
                ...event,
                club: item.value,
                location: item.location,
                localBanner: item.banner,
                localLogo: item.logo,
              })
            }}
          />
          <Text style={{ marginTop: 10 }}>Event Name</Text>
          <Input
            style={{ color: Colors.secondaryLight, height: 'auto' }}
            placeholderTextColor={Colors.secondaryLight}
            maxLength={150}
            placeholder="Event Name"
            autoCapitalize="words"
            blurOnSubmit={false}
            value={event.name}
            onChangeText={(value) => handleChange('name', value)}
          />
          {/* <Text style={{ marginTop: 10 }}>Golf Course Name</Text>
            {courses.length ? (
              <DropDownPicker
                items={courses[0].home_courses.map((course) => ({
                  label: course.name,
                  value: course.name,
                  city: course.city,
                  state: course.state,
                }))}
                defaultValue={event.course}
                containerStyle={{ height: 40, marginTop: 10, zIndex: 0 }}
                style={styles.dropDownStyle}
                labelStyle={styles.dropDownLabel}
                dropDownStyle={styles.dropdown}
                itemStyle={styles.dropdownItem}
                onChangeItem={(item) =>
                  setEvent({
                    ...event,
                    course: item.value,
                    location: `${item.city}, ${item.state.split('-')[1]}, United States`,
                  })
                }
              />
            ) : null} */}
          <Text style={{ marginTop: 10, color: Colors.extraLightGray }}>Location</Text>
          <Input
            style={{ color: Colors.extraLightGray, height: 'auto' }}
            containerStyle={styles.inputContainerStyle}
            placeholderTextColor={Colors.extraLightGray}
            maxLength={200}
            placeholder="Location"
            blurOnSubmit={false}
            value={event.location || clubNames[0].location}
            editable={false}
            multiline
          />
        </View>
      </KeyboardAwareScrollView>
      <BottomSection>
        <PrimaryButton
          disabled={
            !event.club ||
            !event.name ||
            // !event.course ||
            !event.location ||
            (!event.localLogo && !file.logo) ||
            (!event.localBanner && !file.banner)
          }
          style={{ width: '100%', marginVertical: 10 }}
          title="Next"
          onPress={handleNext}
        />
      </BottomSection>
    </View>
  )
}

export default EventDetailsScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  uploadLogo: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.primaryLight,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 20,
    padding: 20,
    marginBottom: 120,
  },
  logoRight: {
    marginLeft: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    justifyContent: 'flex-end',
    paddingBottom: 10,
  },
  uploadBanner: {
    width: '100%',
    height: 180,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.primaryLight,
  },
  buttonStyle: {
    backgroundColor: Colors.green,
    borderRadius: 21,
    width: 114,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonTextStyle: { fontSize: 12, fontWeight: '600', lineHeight: 22 },
  dropDownStyle: {
    backgroundColor: Colors.white,
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: Colors.extraLight,
  },
  dropDownLabel: {
    fontSize: 16,
    color: Colors.secondaryLight,
    marginLeft: -10,
  },
  dropdown: {
    backgroundColor: Colors.white,
    borderWidth: 0,
    shadowColor: 'rgba(0, 0, 0, 0.04)',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 5,
    shadowOpacity: 1,
  },
  dropdownItem: {
    justifyContent: 'flex-start',
    marginLeft: 10,
    width: '100%',
  },
  inputContainerStyle: {
    height: 'auto',
    maxHeight: Dimensions.get('screen').height - 220,
    paddingBottom: 10,
    marginBottom: 5,
  },
})
