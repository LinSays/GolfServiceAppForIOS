import React, { useContext, useLayoutEffect, useRef, useState } from 'react'
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Clipboard from '@react-native-clipboard/clipboard'
import { launchCamera, launchImageLibrary } from 'react-native-image-picker'
import storage from '@react-native-firebase/storage'
import RBSheet from 'react-native-raw-bottom-sheet'
import PhoneInput from 'react-native-phone-input'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview'
import Image from 'react-native-image-progress'
import { useSelector, useDispatch } from 'react-redux'
import cloneDeep from 'lodash/cloneDeep'

import Input from '../components/Input'
import SvgIcon from '../components/SvgIcons'
import { Colors } from '../constants/Colors'
import { STORAGE_URL, SCREEN_NAMES } from '../constants/Globals'
import { updateUserDataById } from '../utils/DataUtils'
import LoadingModal from '../components/LoadingModal'
import { getPictureBySize } from '../utils/Helper'
import { AuthContext } from '../context/AuthContext'
import { setUserData } from '../actions'

const EditProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch()
  const authContext = useContext(AuthContext)
  const { user } = authContext
  const userData = useSelector((state) => state.user)
  const {
    bio,
    linkedIn,
    instagram,
    twitter,
    phoneNumber,
    file,
    ghin,
    firstName,
    lastName,
    fullName,
    ghinData,
  } = userData.data

  const [data, setData] = useState({
    bio: '',
    linkedIn: '',
    instagram: '',
    twitter: '',
    phoneNumber: phoneNumber || '',
    file: null,
    ghin: ghin || '',
    firstName: firstName || '',
    lastName: lastName || '',
  })
  const [isLoading, setIsLoading] = useState(false)

  const refInstagram = useRef(null)
  const refTwitter = useRef(null)
  const refBottomSheet = useRef(null)
  const focusElement = (element) => element.current && element.current.focus()

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleSave}>
          <Text style={{ ...styles.headerText, color: Colors.blue }}>Save</Text>
        </TouchableOpacity>
      ),
    })
  }, [data])

  const handleChange = (name, value) => {
    const newData = cloneDeep(data)
    newData[name] = value
    setData(newData)
  }

  const handleSave = async () => {
    setIsLoading(true)

    if (!data.phoneNumber) {
      setIsLoading(false)
      Alert.alert('Error!', 'Phone number is mandatory!')
      return
    }

    let image

    if (data.file && data.file.fileUri) {
      // upload image
      image = await uploadImage()
      if (image.status !== 'success') {
        setIsLoading(false)
        Alert.alert('Error!', 'Error with uploading media! Please try again!')
        return
      }
    }

    const re = /(?:\.([^.]+))?$/
    const filename = image ? image.path : ''
    const fileNameWithoutExt = image ? image.path.replace(/\.[^/.]+$/, '') : ''
    const compressedFileName = image
      ? `${fileNameWithoutExt}_200x200.${re.exec(filename)[1]}`
      : file
      ? file.filename
      : ''
    const newUserData = {
      ...data,
      fullName:
        data.firstName && data.lastName
          ? `${data.firstName} ${data.lastName}`
          : fullName
          ? fullName
          : '',
      lastName: data.lastName || lastName || user.displayName.split(' ')[1],
      file: {
        photoURL: file.photoURL || '',
        filename: compressedFileName,
      },
      isProfileGuided: true,
    }

    // update data
    let ghinUpdated =
      data.ghin && (ghin !== data.ghin || lastName.toLowerCase() !== data.lastName.toLowerCase())

    const res = await updateUserDataById(userData.id, {
      ...newUserData,
      ghinUpdated,
    })

    if (res.status !== 'success') {
      setIsLoading(false)
      Alert.alert('Error!', res.error || 'There was a problem with saving your data!')
      return
    }

    setTimeout(() => {
      setIsLoading(false)
      const newData = data.ghin
        ? { ...userData.data, ...newUserData }
        : {
            ...userData.data,
            ...newUserData,
            ghinData: undefined,
            associations: undefined,
            scores: undefined,
          }
      Alert.alert('Success!', 'Your data has successfully saved!', [
        {
          text: 'OK',
          onPress: () => {
            dispatch(
              setUserData({
                id: userData.id,
                data: ghinUpdated ? res.data : newData,
              }),
            )
            navigation.navigate(SCREEN_NAMES.PROFILE, { reload: true })
          },
        },
      ])
    }, 1000)
  }

  const handleOpenGallery = () => {
    let options = {
      title: 'Select Image',
      customButtons: [{ name: 'customOptionKey', title: 'Choose Photo from Custom Option' }],
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    }
    launchImageLibrary(options, handleImageResponse)
  }

  const handleOpenCamera = () => {
    let options = {
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    }
    launchCamera(options, handleImageResponse)
  }

  const handleImageResponse = (response) => {
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
      setData({
        ...data,
        file: {
          fileUri: response.uri,
        },
      })
    }
    refBottomSheet.current.close()
  }

  const uploadImage = async () => {
    const { fileUri } = data.file
    const filename = fileUri.substring(fileUri.lastIndexOf('/') + 1)
    const uploadUri = Platform.OS === 'ios' ? fileUri.replace('file://', '') : fileUri
    const task = storage().ref(filename).putFile(uploadUri)
    try {
      const snapshot = await task
      return { status: 'success', path: snapshot.metadata.fullPath }
    } catch (error) {
      return { status: 'failed', error }
    }
  }

  return (
    <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.avatar}>
        {data.file && data.file.fileUri ? (
          <Image
            source={{ uri: data.file.fileUri }}
            imageStyle={{ borderRadius: 94 }}
            style={styles.image}
          />
        ) : file.filename ? (
          <Image
            source={{ uri: `${STORAGE_URL}/${file.filename}?alt=media` }}
            imageStyle={{ borderRadius: 94 }}
            style={styles.image}
          />
        ) : file.photoURL ? (
          <Image
            source={{ uri: getPictureBySize(file.photoURL, 480, 480) }}
            imageStyle={{ borderRadius: 94 }}
            style={styles.image}
          />
        ) : (
          <Image
            source={require('../assets/images/avatar_big.png')}
            imageStyle={{ borderRadius: 94 }}
            style={styles.image}
          />
        )}
        <TouchableOpacity onPress={() => refBottomSheet.current.open()}>
          <SvgIcon type="camera" style={{ marginLeft: -50 }} />
        </TouchableOpacity>
      </View>
      <View style={styles.nameSection}>
        <Text style={styles.fullName}>{`${fullName || user.displayName}`}</Text>
        {ghinData ? (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.playerName}>{ghinData[0].PlayerName}</Text>
            <SvgIcon type="tick" style={{ marginTop: 6, marginLeft: 5 }} />
          </View>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={{ marginTop: 8 }}>GHIN Number</Text>
        <Input
          style={{ color: Colors.secondaryLight }}
          containerStyle={{ borderBottomColor: Colors.lightGray }}
          placeholderTextColor={Colors.secondaryLight}
          maxLength={100}
          placeholder="Enter your GHIN Number"
          autoCapitalize="none"
          blurOnSubmit={false}
          value={data.ghin}
          onChangeText={(value) => handleChange('ghin', value)}
        />
        <Text style={{ marginTop: 8 }}>First Name</Text>
        <Input
          style={{ color: Colors.secondaryLight }}
          containerStyle={{ borderBottomColor: Colors.lightGray }}
          placeholderTextColor={Colors.secondaryLight}
          maxLength={100}
          placeholder="Enter your first name"
          autoCapitalize="words"
          blurOnSubmit={false}
          value={data.firstName}
          onChangeText={(value) => handleChange('firstName', value)}
        />
        <Text style={{ marginTop: 8 }}>Last Name</Text>
        <Input
          style={{ color: Colors.secondaryLight }}
          containerStyle={{ borderBottomColor: Colors.lightGray }}
          placeholderTextColor={Colors.secondaryLight}
          maxLength={100}
          placeholder="Enter your last name"
          autoCapitalize="words"
          blurOnSubmit={false}
          value={data.lastName}
          onChangeText={(value) => handleChange('lastName', value)}
        />
        <Text style={{ marginTop: 8 }}>Profile</Text>
        <Input
          style={{ color: Colors.secondaryLight, height: 'auto' }}
          containerStyle={styles.bioContainerStyle}
          placeholderTextColor={Colors.secondaryLight}
          maxLength={150}
          placeholder="Input your bio"
          autoCapitalize="sentences"
          blurOnSubmit={false}
          scrollEnabled={false}
          multiline={true}
          value={data.bio}
          onChangeText={(value) => handleChange('bio', value)}
        />
        <Text style={styles.textLimit}>{bio ? bio.length : 0} / 150</Text>
        {user && !user.phoneNumber ? (
          <>
            <Text>Phone Number</Text>
            <PhoneInput
              style={{
                width: '100%',
                flexDirection: 'row',
                borderBottomColor: Colors.lightGray,
                borderBottomWidth: 1,
                height: 48,
                paddingTop: 8,
                paddingBottom: 0,
                marginBottom: 16,
                justifyContent: 'space-between',
                backgroundColor: 'transparent',
              }}
              initialCountry="us"
              initialValue={data.phoneNumber}
              onChangePhoneNumber={(number) => handleChange('phoneNumber', number)}
            />
          </>
        ) : null}
        {/* <Text style={{ marginTop: 8 }}>LinkedIn</Text>
        <Input
          style={{ color: Colors.secondaryLight }}
          containerStyle={{ borderBottomColor: Colors.lightGray }}
          placeholderTextColor={Colors.secondaryLight}
          maxLength={100}
          placeholder="LinkedIn URL"
          autoCapitalize="none"
          blurOnSubmit={false}
          returnKeyType="next"
          iconType="copyLink"
          onSubmitEditing={() => focusElement(refInstagram)}
          value={data.linkedIn}
          onChangeText={(value) => handleChange('linkedIn', value)}
          onIconPress={() => Clipboard.setString(linkedIn)}
        />
        <Text style={{ marginTop: 8 }}>Instagram</Text>
        <Input
          ref={refInstagram}
          style={{ color: Colors.secondaryLight }}
          containerStyle={{ borderBottomColor: Colors.lightGray }}
          placeholderTextColor={Colors.secondaryLight}
          maxLength={100}
          placeholder="Instagram URL"
          autoCapitalize="none"
          blurOnSubmit={false}
          returnKeyType="next"
          iconType="copyLink"
          onSubmitEditing={() => focusElement(refTwitter)}
          value={data.instagram}
          onChangeText={(value) => handleChange('instagram', value)}
          onIconPress={() => Clipboard.setString(instagram)}
        />
        <Text style={{ marginTop: 8 }}>Twitter</Text>
        <Input
          ref={refTwitter}
          style={{ color: Colors.secondaryLight }}
          containerStyle={{ borderBottomColor: Colors.lightGray }}
          placeholderTextColor={Colors.secondaryLight}
          maxLength={100}
          placeholder="Twitter URL"
          autoCapitalize="none"
          blurOnSubmit={false}
          returnKeyType="go"
          iconType="copyLink"
          value={data.twitter}
          onChangeText={(value) => handleChange('twitter', value)}
          onIconPress={() => Clipboard.setString(twitter)}
        /> */}
      </View>
      <RBSheet
        ref={refBottomSheet}
        height={260}
        openDuration={250}
        customStyles={{
          container: {
            justifyContent: 'center',
            alignItems: 'center',
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
          },
        }}>
        <View style={styles.stroke} />
        <TouchableOpacity style={styles.bottomSheetItem} onPress={handleOpenCamera}>
          <SvgIcon type="vectorCamera" />
          <Text style={styles.bottomSheetItemText}>Take a Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomSheetItem}>
          <SvgIcon type="cloud" />
          <Text style={styles.bottomSheetItemText}>Browse iCloud Photos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomSheetItem} onPress={handleOpenGallery}>
          <SvgIcon type="gallery" />
          <Text style={styles.bottomSheetItemText}>Open Gallery</Text>
        </TouchableOpacity>
      </RBSheet>
      {isLoading && <LoadingModal />}
    </KeyboardAwareScrollView>
  )
}

export default EditProfileScreen

const styles = StyleSheet.create({
  avatar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginTop: 20,
  },
  fullName: { fontSize: 17, fontWeight: '600' },
  playerName: { color: Colors.extraLight, marginTop: 5 },
  nameSection: { alignItems: 'center', marginTop: 20 },
  section: {
    justifyContent: 'flex-end',
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 20,
  },
  bioContainerStyle: {
    height: 'auto',
    maxHeight: 100,
    paddingBottom: 10,
    marginBottom: 5,
    borderBottomColor: Colors.lightGray,
  },
  textLimit: { textAlign: 'right', fontSize: 12, color: Colors.extraLightGray, marginBottom: 21 },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.extraLight,
    marginHorizontal: 16,
  },
  image: { width: 183, height: 183, borderRadius: 94 },
  bottomSheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    paddingLeft: 21,
    borderBottomColor: Colors.lightGray,
    borderBottomWidth: 1,
    paddingVertical: 18,
  },
  bottomSheetItemText: {
    fontSize: 17,
    fontWeight: '600',
    marginLeft: 10,
  },
  stroke: {
    width: 134,
    height: 5,
    backgroundColor: Colors.black,
    borderRadius: 100,
    marginTop: -10,
    marginBottom: 14,
  },
})
