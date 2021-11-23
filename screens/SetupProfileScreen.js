import React, { useContext, useEffect, useRef, useState } from 'react'
import { Alert, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native'
import { launchCamera, launchImageLibrary } from 'react-native-image-picker'
import RBSheet from 'react-native-raw-bottom-sheet'
import PhoneInput from 'react-native-phone-input'
import Image from 'react-native-image-progress'
import Swiper from 'react-native-swiper'
import storage from '@react-native-firebase/storage'
import { useSelector } from 'react-redux'

import Input from '../components/Input'
import SvgIcon from '../components/SvgIcons'
import LoadingModal from '../components/LoadingModal'
import BottomSection from '../components/BottomSection'
import PrimaryButton from '../components/PrimaryButton'
import { AuthContext } from '../context/AuthContext'
import { getPictureBySize, isset, validatePhoneNumber } from '../utils/Helper'
import { addUser, getUserByQuery } from '../utils/AuthUtils'
import { updateUserDataById } from '../utils/DataUtils'
import { Colors } from '../constants/Colors'
import Images from '../utils/Assets'

const SetupProfileScreen = ({ navigation }) => {
  const userData = useSelector((state) => state.user)
  const authContext = useContext(AuthContext)
  const { user, setIsFromRegister } = authContext
  const [data, setData] = useState({
    bio: '',
    phoneNumber: user ? user.phoneNumber : '',
    linkedIn: '',
    instagram: '',
    twitter: '',
    file: null,
    ghin: '',
    firstName: user && user.displayName ? user.displayName.split(' ')[0] : '',
    lastName: isset(() => user.displayName.split(' ')[1]) ? user.displayName.split(' ')[1] : '',
    email: user ? user.email : '',
    lastSignIn: new Date().getTime(),
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showOutline, setShowOutline] = useState(false)
  const refBottomSheet = useRef(null)
  const refSwiper = useRef(null)

  useEffect(() => {
    setIsLoading(true)
  }, [])

  useEffect(() => {
    if (user) {
      setIsLoading(false)
      setData({
        ...data,
        firstName: user.displayName ? user.displayName.split(' ')[0] : '',
        lastName: user.displayName ? user.displayName.split(' ')[1] : '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
      })
    }
  }, [user])

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
          filePath: response,
          fileData: response.data,
          fileUri: response.uri,
        },
      })
    }
    refBottomSheet.current.close()
  }

  const handleChange = (name, value) => {
    setShowOutline(false)
    setData({ ...data, [name]: value })
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

  const handleNext = async () => {
    setIsLoading(true)
    const {
      bio,
      linkedIn,
      instagram,
      twitter,
      file,
      phoneNumber,
      email,
      firstName,
      ghin,
      lastName,
      lastSignIn,
    } = data
    let image

    if (!firstName || !lastName) {
      setIsLoading(false)
      Alert.alert('Error!', 'Please input your first name and last name!')
      return
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setIsLoading(false)
      Alert.alert('Error!', 'Please input a correct phone number!')
      return
    }

    if (file && file.fileUri) {
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
      bio,
      linkedIn,
      instagram,
      twitter,
      phoneNumber: phoneNumber.substring(1),
      fullName: `${firstName} ${lastName}`,
      email,
      firstName,
      ghin,
      lastName,
      lastSignIn,
      isSetupProfile: true,
      file: {
        filename: compressedFileName,
        photoURL: user ? user.photoURL : '',
      },
    }

    let userRes = {}
    if (email) {
      userRes = await getUserByQuery('', email, '')
    }

    let res
    if (userRes.users) {
      // update user data
      res = await updateUserDataById(userRes.users[0].id, { ...userData, ...newUserData })
    } else {
      // add user
      res = await addUser({ ...userData, ...newUserData })
    }

    if (res.status !== 'success') {
      setIsLoading(false)
      Alert.alert('Error!', res.error || 'There was a problem with saving your data!')
      if (res.error && res.error.includes('GHIN')) setShowOutline(true)
      return
    }

    setIsLoading(false)
    Alert.alert('Success!', 'Your data has successfully saved!', [
      { text: 'OK', onPress: () => setIsFromRegister(false) },
    ])
  }

  const renderPagination = (index, total) => {
    let content = []
    const stepNum = user && !user.phoneNumber ? 3 : 2

    for (let i = 0; i < total; i++) {
      if (i === index) {
        content.push(<View style={styles.activeDot} key={i} />)
      } else {
        content.push(<View style={styles.dot} key={i} />)
      }
    }

    return (
      <View>
        <View style={{ alignSelf: 'center', marginBottom: 150, flexDirection: 'row' }}>
          {content}
        </View>
        <View>
          <BottomSection>
            {index !== 0 && index !== stepNum && (
              <PrimaryButton
                style={styles.button}
                title={'Back'}
                buttonStyle={{ ...styles.buttonStyle, backgroundColor: Colors.white }}
                buttonTextStyle={{ ...styles.buttonTextStyle, color: Colors.black }}
                onPress={() => refSwiper.current.scrollBy(-1)}
              />
            )}
            {index !== stepNum && (
              <PrimaryButton
                style={styles.button}
                title="Next"
                buttonStyle={styles.buttonStyle}
                buttonTextStyle={styles.buttonTextStyle}
                onPress={() => refSwiper.current.scrollBy(1)}
              />
            )}
            {index === stepNum && (
              <PrimaryButton
                style={styles.button}
                title="Save"
                buttonStyle={styles.buttonStyle}
                buttonTextStyle={styles.buttonTextStyle}
                onPress={handleNext}
              />
            )}
          </BottomSection>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Swiper
        ref={refSwiper}
        index={0}
        renderPagination={(index, total) => <View>{renderPagination(index, total)}</View>}>
        <View style={styles.section}>
          <Image source={Images.imgLogin01} style={styles.imgLogin} imageStyle={styles.imgLogin} />
          <Text style={styles.title}>User's Name Setup</Text>
          <Text style={{ marginTop: 15 }}>First Name</Text>
          <Input
            style={{ color: Colors.secondaryLight }}
            containerStyle={{ borderBottomColor: Colors.lightGray }}
            placeholderTextColor={Colors.border}
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
            containerStyle={{ borderBottomColor: showOutline ? Colors.red : Colors.lightGray }}
            placeholderTextColor={Colors.border}
            maxLength={100}
            placeholder="Enter your last name"
            autoCapitalize="words"
            blurOnSubmit={false}
            value={data.lastName}
            onChangeText={(value) => handleChange('lastName', value)}
          />
        </View>
        {user && !user.phoneNumber ? (
          <View style={styles.section}>
            <Image
              source={Images.imgLogin02}
              style={styles.imgLogin}
              imageStyle={styles.imgLogin}
            />
            <Text style={styles.title}>Phone Number</Text>
            <Text style={{ marginTop: 8 }}>Phone Number</Text>
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
              textStyle={{ color: Colors.black }}
              initialCountry="us"
              initialValue={data.phoneNumber}
              onChangePhoneNumber={(number) => handleChange('phoneNumber', number)}
            />
            <Text style={styles.desp}>
              Enter your phone number to receive event notifications thru text
            </Text>
          </View>
        ) : null}
        <View style={{ flex: 1 }}>
          <View style={styles.avatar}>
            {data.file && data.file.fileUri ? (
              <Image
                source={{ uri: data.file.fileUri }}
                imageStyle={{ width: '100%', height: '100%', borderRadius: 94 }}
                style={styles.image}
              />
            ) : user && user.photoURL ? (
              <Image
                source={{ uri: getPictureBySize(user.photoURL, 480, 480) }}
                imageStyle={{ width: '100%', height: '100%', borderRadius: 94 }}
                style={styles.image}
              />
            ) : (
              <Image source={require('../assets/images/avatar_big.png')} style={styles.image} />
            )}
            <TouchableOpacity onPress={() => refBottomSheet.current.open()}>
              <SvgIcon type="camera" style={{ marginLeft: -50 }} />
            </TouchableOpacity>
          </View>
          <View style={styles.nameSection}>
            <Text style={styles.fullName}>{user ? user.displayName : ''}</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.title}>Profile Picture Setup</Text>
            <Text style={styles.desp}>Choose and upload image for your profile picture</Text>
          </View>
        </View>
        <View style={styles.section}>
          <Image source={Images.imgLogin03} style={styles.imgLogin} imageStyle={styles.imgLogin} />
          <Text style={styles.title}>GHIN Number</Text>
          <Text style={{ marginTop: 15 }}>GHIN Number</Text>
          <Input
            style={{ color: Colors.secondaryLight }}
            containerStyle={{ borderBottomColor: showOutline ? Colors.red : Colors.lightGray }}
            placeholderTextColor={Colors.border}
            maxLength={100}
            placeholder="Enter your GHIN Number"
            autoCapitalize="none"
            blurOnSubmit={false}
            value={data.ghin}
            onChangeText={(value) => handleChange('ghin', value)}
          />
          <Text style={styles.desp}>
            Forgot you GHIN number? Click <Text style={{ color: Colors.blue }}>here</Text> to find.
          </Text>
        </View>
      </Swiper>
      {isLoading && <LoadingModal />}
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
    </View>
  )
}

export default SetupProfileScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
  },
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
    backgroundColor: Colors.white,
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
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
  button: {
    width: '45%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
  },
  buttonStyle: {
    height: 56,
    borderWidth: 1,
    borderColor: Colors.black,
  },
  buttonTextStyle: { marginLeft: 5, fontSize: 14, marginTop: 5 },
  imgLogin: {
    width: Dimensions.get('screen').width - 50,
    height: 220,
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  dot: {
    backgroundColor: 'rgb(216,216,216)',
    width: 13,
    height: 13,
    borderRadius: 6.5,
    marginRight: 7,
  },
  activeDot: {
    backgroundColor: '#000000',
    width: 13,
    height: 13,
    borderRadius: 6.5,
    marginRight: 7,
  },
  title: { marginTop: 20, alignSelf: 'center', fontSize: 16, fontWeight: '600' },
  desp: {
    fontSize: 12,
    textAlign: 'center',
    width: Dimensions.get('screen').width / 2 + 70,
    alignSelf: 'center',
    paddingTop: 10,
  },
})
