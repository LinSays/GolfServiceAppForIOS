// View other users' profile

import React, { useEffect, useState } from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native'
import { AreaChart, XAxis, YAxis, Grid } from 'react-native-svg-charts'
import Image from 'react-native-image-progress'
import { useDispatch, useSelector } from 'react-redux'

import SvgIcon from '../components/SvgIcons'
import Decorator from '../components/Decorator'
import Line from '../components/Line'
import LoadingModal from '../components/LoadingModal'

import { Colors } from '../constants/Colors'
import { STORAGE_URL } from '../constants/Globals'

import { formatDate, getPictureBySize, isset } from '../utils/Helper'
import { getUserByQuery } from '../utils/AuthUtils'
import { addFollowingData, removeFollowingData } from '../actions/followings.actions'
import { fetchFollowings } from '../utils/DataUtils'
import { setIsLoading } from '../actions'

const ViewProfileScreen = ({ route, navigation }) => {
  const dispatch = useDispatch()
  const followings = useSelector((state) => state.followings.followings)
  const isLoading = useSelector((state) => state.isLoading)
  const user = useSelector((state) => state.user)
  const [userData, setUserData] = useState({})
  const [dates, setDates] = useState([])
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(false)
  const [followerCount, setFollowerCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)

  useEffect(() => {
    const getUserData = async () => {
      if (isset(() => route.params.userId)) {
        try {
          const { userId } = route.params
          let res = await getUserByQuery(userId)
          if (res.status !== 'success') {
            Alert.alert('Error', 'User not found!')
            return
          }
          setUserData({ id: userId, data: res.user })
          res = await fetchFollowings(userId)
          setFollowerCount(res.data.followers.length)
          setFollowingCount(res.data.followings.length)
          dispatch(setIsLoading(false))
        } catch (err) {
          Alert.alert('Error', 'Something went wrong!')
        }
      }
    }
    dispatch(setIsLoading(true))
    getUserData()
  }, [])

  useEffect(() => {
    if (isset(() => userData.data.scores)) {
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
  }, [userData])

  if (!userData.data || !route.params.userId) return false
  const { userId } = route.params
  const isFollowing = followings.find((e) => e.userId === userId)
  const { file, fullName, ghinData, twitter, instagram, linkedIn, bio, associations, nominatedBy } =
    userData.data

  return (
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
              <Text style={styles.fullName}>{fullName || ''}</Text>
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
                <TouchableOpacity disabled={!instagram} onPress={() => Linking.openURL(instagram)}>
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
          <TouchableOpacity
            disabled={loading}
            onPress={async () => {
              setLoading(true)
              if (isFollowing) {
                dispatch(removeFollowingData(userId, user.id, () => setLoading(false)))
              } else {
                dispatch(addFollowingData(userId, user.id, () => setLoading(false)))
              }
            }}>
            <View style={isFollowing ? styles.followingButton : styles.followButton}>
              <Text style={{ fontSize: 12, color: isFollowing ? Colors.white : Colors.primary }}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.section}>
          <View style={styles.following}>
            <View style={styles.block}>
              <Text style={styles.count}>{followerCount}</Text>
              <Text style={styles.label}>Followers</Text>
            </View>
            <View style={{ borderLeftColor: Colors.lightGray, borderLeftWidth: 1 }} />
            <View style={styles.block}>
              <Text style={styles.count}>{followingCount}</Text>
              <Text style={styles.label}>Following</Text>
            </View>
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
                  </View>
                  <XAxis
                    style={{ marginTop: 10 }}
                    data={scores}
                    formatLabel={(value, index) => dates[index]}
                    contentInset={{ left: 50, right: 11 }}
                    svg={{ fontSize: 8, fill: Colors.extraLight }}
                  />
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
              {ghinData ? <Text style={styles.data}>{ghinData[0].HiValue}</Text> : <Text>n/a</Text>}
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
      </View>
      {isLoading && <LoadingModal />}
    </ScrollView>
  )
}

export default ViewProfileScreen

const styles = StyleSheet.create({
  inner: {
    marginHorizontal: 16,
    paddingBottom: 20,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginVertical: 20,
  },
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
  followButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  followingButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
    marginBottom: 15,
  },
})
