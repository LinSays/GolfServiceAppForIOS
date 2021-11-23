import React, { useContext, useEffect, useState } from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Linking,
} from 'react-native'
import { AreaChart, XAxis, YAxis, Grid } from 'react-native-svg-charts'
import auth from '@react-native-firebase/auth'
import Image from 'react-native-image-progress'
import { useSelector, useDispatch } from 'react-redux'

import SvgIcon from '../components/SvgIcons'
import Decorator from '../components/Decorator'
import Line from '../components/Line'

import { Colors } from '../constants/Colors'
import { SCREEN_NAMES, STORAGE_URL } from '../constants/Globals'

import { formatDate, getPictureBySize } from '../utils/Helper'
import { AuthContext } from '../context/AuthContext'
import ProfileGuide from '../components/ProfileGuide'
import { fetchFollowingsData } from '../actions/followings.actions'

const ProfileScreen = ({ route, navigation }) => {
  const authContext = useContext(AuthContext)
  const { user } = authContext

  const dispatch = useDispatch()
  const userData = useSelector((state) => state.user)
  const followings = useSelector((state) => state.followings.followings)
  const followers = useSelector((state) => state.followings.followers)
  const [dates, setDates] = useState([])
  const [scores, setScores] = useState([])
  const [step, setStep] = useState(-1)

  useEffect(() => {
    if (userData.data) {
      if (!userData.data.ghin && !userData.data.isProfileGuided) {
        setStep(0)
      }
      if (userData.data.scores) {
        const scoreData = userData.data.scores.sort((a, b) => {
          return b.posted_at < a.posted_at
        })
        const _scores = scoreData.map((score) => score.adjusted_gross_score)
        const _dates = scoreData.map((score) => {
          const year = score.posted_at.split('-')[0]
          const month = score.posted_at.split('-')[1]
          return `${month}/${year % 100}`
        })
        setScores(_scores)
        setDates(_dates)
      } else {
        setScores([])
      }
    }

    if (userData.id) {
      dispatch(fetchFollowingsData())
    }
  }, [userData])

  if (!userData.data) return false
  const { file, fullName, ghinData, twitter, instagram, linkedIn, bio, associations, nominatedBy } =
    userData.data

  return (
    <>
      <ScrollView>
        <View style={styles.inner}>
          <View style={styles.top}>
            <View style={{ flexDirection: 'row' }}>
              {file ? (
                file.filename ? (
                  <Image
                    source={{ uri: `${STORAGE_URL}/${file.filename}?alt=media` }}
                    imageStyle={{ borderRadius: 50 }}
                    style={styles.image}
                  />
                ) : file.photoURL ? (
                  <Image
                    source={{ uri: getPictureBySize(file.photoURL, 480, 480) }}
                    imageStyle={{ borderRadius: 50 }}
                    style={styles.image}
                  />
                ) : (
                  <Image
                    source={require('../assets/images/avatar_small.png')}
                    imageStyle={{ borderRadius: 50 }}
                    style={styles.image}
                  />
                )
              ) : null}
              <View style={{ marginLeft: 21, marginTop: 10 }}>
                <Text style={styles.fullName}>{fullName || (user ? user.displayName : '')}</Text>
                {ghinData ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.playerName}>{ghinData[0].PlayerName}</Text>
                    <SvgIcon type="tick" style={{ marginTop: 6, marginLeft: 5 }} />
                  </View>
                ) : null}
                {/* <View style={{ flexDirection: 'row', marginTop: 19 }}>
                  <TouchableOpacity disabled={!twitter} onPress={() => Linking.openURL(twitter)}>
                    <SvgIcon type="twitter" color={twitter ? Colors.black : Colors.border} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    disabled={!instagram}
                    onPress={() => Linking.openURL(instagram)}>
                    <SvgIcon
                      type="instagram"
                      color={instagram ? Colors.black : Colors.border}
                      style={{ marginHorizontal: 15 }}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity disabled={!linkedIn} onPress={() => Linking.openURL(linkedIn)}>
                    <SvgIcon type="linkedIn" color={linkedIn ? Colors.black : Colors.border} />
                  </TouchableOpacity>
                </View> */}
              </View>
            </View>
            {/* <SvgIcon type="notification" style={{ marginTop: 15, marginRight: 10 }} /> */}
          </View>
          {/* <SvgIcon type="notification" style={{ marginTop: 15, marginRight: 10 }} /> */}
          <View style={styles.section}>
            <View style={styles.following}>
              <TouchableOpacity
                style={styles.block}
                onPress={() => navigation.navigate(SCREEN_NAMES.FOLLOWINGS)}>
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={styles.count}>{followers.length}</Text>
                  <Text style={styles.label}>Followers</Text>
                </View>
              </TouchableOpacity>
              <View style={{ borderLeftColor: Colors.lightGray, borderLeftWidth: 1 }} />
              <TouchableOpacity
                style={styles.block}
                onPress={() =>
                  navigation.navigate(SCREEN_NAMES.FOLLOWINGS, {
                    screen: SCREEN_NAMES.FOLLOWINGS_SCREEN,
                  })
                }>
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={styles.count}>{followings.length}</Text>
                  <Text style={styles.label}>Following</Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={{ marginHorizontal: 20 }}>
              <View style={{ marginTop: 18 }}>
                <Text style={styles.subTitle}>Game Statistics</Text>
                {scores.length ? (
                  <View style={styles.chart}>
                    <View style={{ flexDirection: 'row', height: 150 }}>
                      <YAxis
                        style={{ marginRight: 10 }}
                        data={[60, 70, 80, 90, 100]}
                        contentInset={{ top: 5, bottom: 5 }}
                        svg={{
                          fill: 'grey',
                          fontSize: 10,
                        }}
                        numberOfTicks={5}
                        formatLabel={(value) => value}
                      />
                      <View>
                        <AreaChart
                          style={{ height: 150, width: Dimensions.get('screen').width - 95 }}
                          data={scores}
                          yMin={60}
                          yMax={100}
                          contentInset={{ left: 20, right: 13 }}>
                          <Grid ticks={5} />
                          <Line />
                          <Decorator />
                        </AreaChart>
                      </View>
                      <XAxis
                        style={{ marginTop: 10 }}
                        data={scores}
                        formatLabel={(value, index) => dates[index]}
                        contentInset={{ left: 50, right: 11 }}
                        svg={{ fontSize: 8, fill: Colors.extraLight }}
                      />
                    </View>
                  </View>
                ) : (
                  <Text style={{ marginTop: 10 }}>n/a</Text>
                )}
              </View>
              <View style={{ marginTop: 25 }}>
                <Text style={styles.subTitle}>Profile</Text>
                <Text style={styles.data}>{bio || ''}</Text>
              </View>
              <View style={{ marginTop: 20 }}>
                <Text style={styles.subTitle}>Member of</Text>
                <View style={{ marginTop: 10 }}>
                  {associations ? (
                    associations.map((association) => (
                      <View key={association.id} style={{ flexDirection: 'row', marginBottom: 5 }}>
                        <Image
                          source={{ uri: association.logo.replace('http', 'https') }}
                          imageStyle={{ borderRadius: 15 }}
                          style={{ width: 30, height: 30, marginRight: 10, marginTop: 5 }}
                        />
                        <Text style={styles.data}>{association.name}</Text>
                      </View>
                    ))
                  ) : (
                    <Text>n/a</Text>
                  )}
                </View>
              </View>
              <View style={{ marginTop: 20 }}>
                <Text style={styles.subTitle}>Clubs</Text>
                <View style={{ marginTop: 10 }}>
                  {ghinData ? (
                    ghinData.map((p) => (
                      <View key={p.ClubId} style={{ flexDirection: 'row', marginBottom: 5 }}>
                        <Text style={styles.data}>{p.ClubName}</Text>
                      </View>
                    ))
                  ) : (
                    <Text>n/a</Text>
                  )}
                </View>
              </View>
              <View style={{ marginTop: 22 }}>
                <Text style={styles.subTitle}>Handicap Index</Text>
                {ghinData ? (
                  <Text style={styles.data}>{ghinData[0].HiValue}</Text>
                ) : (
                  <Text>n/a</Text>
                )}
              </View>
              <View style={{ marginTop: 20 }}>
                <Text style={styles.subTitle}>GHIN Number</Text>
                {ghinData ? (
                  <Text style={styles.data}>{ghinData[0].GHINNumber}</Text>
                ) : (
                  <Text>n/a</Text>
                )}
              </View>
              <View style={{ marginTop: 20 }}>
                <Text style={styles.subTitle}>Date Joined</Text>
                {ghinData ? (
                  <Text style={styles.data}>{formatDate(ghinData[0].RevDate, 'MMMM dd yyyy')}</Text>
                ) : (
                  <Text>n/a</Text>
                )}
              </View>
              <View style={{ marginTop: 20 }}>
                <Text style={styles.subTitle}>Nominated by</Text>
                <Text style={styles.data}>
                  {nominatedBy && nominatedBy.fullName ? nominatedBy.fullName : ''}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.splitLine} />
          <TouchableOpacity
            style={styles.bottom}
            onPress={() => navigation.navigate(SCREEN_NAMES.ACCOUNT_SETTINGS)}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <SvgIcon type="settings" />
              <Text style={{ fontSize: 16, fontWeight: '600', marginLeft: 10 }}>
                Account Settings
              </Text>
            </View>
            <SvgIcon type="chevron" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottom} onPress={() => auth().signOut()}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {/* <SvgIcon type="settings" /> */}
              <Text style={{ fontSize: 16, fontWeight: '600', marginLeft: 10 }}>Log out</Text>
            </View>
            <SvgIcon type="chevron" />
          </TouchableOpacity>
        </View>
      </ScrollView>
      {step > -1 ? <ProfileGuide step={step} setStep={setStep} /> : null}
    </>
  )
}

export default ProfileScreen

const styles = StyleSheet.create({
  inner: {
    marginHorizontal: 16,
    paddingBottom: 20,
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 20 },
  fullName: { fontSize: 17, fontWeight: '600' },
  playerName: { color: Colors.extraLight, marginTop: 5 },
  section: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingBottom: 27,
  },
  followers: {
    flex: 1,
  },
  following: {
    height: 66,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomColor: Colors.lightGray,
    borderBottomWidth: 1,
  },
  block: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  count: { fontSize: 22, fontWeight: '600' },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.extraLight,
  },
  subTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  data: {
    fontSize: 17,
    color: Colors.secondaryLight,
    marginTop: 10,
  },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  splitLine: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.black,
    opacity: 0.2,
    marginVertical: 20,
  },
  chart: {
    marginTop: 12,
  },
  image: { width: 100, height: 100 },
})
