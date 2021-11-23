import React, { useEffect, useState } from 'react'
import { View, Text, Platform, Alert, StyleSheet, ScrollView, Linking } from 'react-native'
import Image from 'react-native-image-progress'
import Geolocation from 'react-native-geolocation-service'

import LoadingModal from '../components/LoadingModal'
import { getCurrentWeatherInfo } from '../utils/Api'
import { height, width } from '../utils/DimensionUtils'
import { formatDate, formatTime } from '../utils/Helper'
import { Colors } from '../constants/Colors'
import { WEATHER_API_IMAGE_URL } from '../constants/Globals'

const WeatherForecastScreen = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [weatherInfo, setWeatherInfo] = useState(null)

  useEffect(() => {
    requestPermissions()
  }, [])

  const requestPermissions = async () => {
    if (Platform.OS === 'ios') {
      const auth = await Geolocation.requestAuthorization('whenInUse')
      const auth1 = await Geolocation.requestAuthorization('always')
      if (auth === 'granted') {
        setIsLoading(true)
        getLocation()
      } else if (auth1 === 'granted') {
        setIsLoading(true)
        getLocation()
      } else {
        Alert.alert('Error', 'Permission is denied', [
          {
            text: 'OK',
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: () => Linking.openURL('app-settings:'),
          },
        ])
      }
    }

    if (Platform.OS === 'android') {
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
    }
  }

  const getLocation = () => {
    Geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        try {
          const weatherResponse = await getCurrentWeatherInfo({ latitude, longitude })
          setWeatherInfo(weatherResponse)
        } catch (error) {
          console.error(error)
        }
        setIsLoading(false)
      },
      (error) => {
        const { code, message } = error
        console.warn(code, message)
        setIsLoading(false)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    )
  }

  return (
    <View style={styles.styles}>
      {weatherInfo && (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={{ alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 15 }}>
            <Image
              source={{
                uri: `${WEATHER_API_IMAGE_URL}/${weatherInfo.current.weather[0].icon}.png`,
              }}
              style={styles.weatherImage}
            />
            <Text style={{ fontSize: 17, color: Colors.black, paddingLeft: 10 }}>
              {weatherInfo.current.weather[0].main}
            </Text>
          </View>
          <Text style={{ fontSize: 14, color: Colors.extraLight }}>
            {weatherInfo.current.weather[0].description}
          </Text>
          <Text
            style={{
              fontSize: 50,
              color: Colors.black,
              paddingTop: 10,
            }}>{`${Math.round(weatherInfo.current.temp)}℃`}</Text>
          <Text
            style={{
              fontSize: 14,
              color: Colors.extraLight,
            }}>{`Feelslike ${weatherInfo.current.feels_like} ℃`}</Text>
          <View
            style={{
              backgroundColor: Colors.lightGray,
              width: '100%',
              padding: 10,
              borderRadius: 10,
              marginVertical: 10,
            }}>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
              <Text
                style={{ fontSize: 12 }}>{`Wind: ${weatherInfo.current.wind_speed} m/s SE`}</Text>
              <Text style={{ fontSize: 12 }}>{`Humidity: ${weatherInfo.current.humidity} %`}</Text>
              <Text style={{ fontSize: 12 }}>{`UV index: ${weatherInfo.current.uvi}`}</Text>
            </View>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
              <Text style={{ fontSize: 12 }}>{`Presure: ${weatherInfo.current.pressure} hPa`}</Text>
              <Text style={{ fontSize: 12 }}>{`Visibility: ${
                weatherInfo.current.visibility / 1000
              } km`}</Text>
              <Text style={{ fontSize: 12 }}>{`Dew Point: ${Math.round(
                weatherInfo.current.dew_point,
              )} ℃`}</Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: '100%',
              marginVertical: 10,
            }}>
            {weatherInfo.hourly.slice(1, 6).map((item, index) => {
              return (
                <View key={index} style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 12 }}>{formatTime(item.dt * 1000)}</Text>
                  <Image
                    source={{
                      uri: `${WEATHER_API_IMAGE_URL}/${item.weather[0].icon}.png`,
                    }}
                    style={styles.weatherImage}
                  />
                  <Text style={{ fontSize: 12 }}>{`${Math.round(item.temp)}℃`}</Text>
                </View>
              )
            })}
          </View>
          <View style={{ width: '100%', paddingTop: 10 }}>
            {weatherInfo.daily.slice(1, 5).map((item, index) => {
              return (
                <View key={index} style={styles.nextWeatherContainer}>
                  <Text>{formatDate(item.dt * 1000, 'WD-DD-MM')}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text>{`${Math.round(item.temp.max)} / ${Math.round(item.temp.min)}°`}</Text>
                    <Image
                      source={{
                        uri: `${WEATHER_API_IMAGE_URL}/${item.weather[0].icon}.png`,
                      }}
                      style={styles.weatherImage}
                    />
                  </View>
                </View>
              )
            })}
          </View>
        </ScrollView>
      )}
      {isLoading && <LoadingModal isVisible={isLoading} />}
    </View>
  )
}

export default WeatherForecastScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 10,
  },
  weatherImage: {
    width: 40,
    height: 25,
  },
  scrollContainer: {
    backgroundColor: Colors.white,
    margin: 10,
    padding: 10,
    borderRadius: 20,
    width: width - 20,
    height: height - 90,
    alignSelf: 'center',
  },
  nextWeatherContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    paddingTop: 15,
  },
})
