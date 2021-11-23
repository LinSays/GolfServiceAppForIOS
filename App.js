import React, { useEffect, useState } from 'react'
import { Alert, LogBox } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import SplashScreen from 'react-native-splash-screen'
import RtcEngine from 'react-native-agora'
import NetInfo from '@react-native-community/netinfo'

// Redux
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import promise from 'redux-promise'
import allReducers from './reducers'

import RootNavigator from './navigation'
import { RoomProvider } from './context/RoomContext'
import { AuthProvider } from './context/AuthContext'
import VideoSplashScreen from './screens/VideoSplashScreen'
import RoomVoiceScreen from './screens/RoomVoiceScreen'
import { AGORA_APP_ID } from './config'

LogBox.ignoreLogs(['Warning: ...'])
LogBox.ignoreAllLogs()

const config = {
  screens: {
    Main: {
      path: 'main',
      screens: {
        HomeScreen: {
          path: 'rooms/:id',
          parse: {
            id: (id) => id.replace(/^@/, ''),
          },
          exact: true,
        },
        EventViewScreen: {
          path: 'events/:id',
          parse: {
            id: (id) => id.replace(/^@/, ''),
          },
          exact: true,
        },
      },
    },
    exact: true,
  },
}

const linking = {
  prefixes: ['hole19://id1571546603/', 'https://19th-hole-app/id1571546603/'],
  config,
}

const App = () => {
  const [showMainNavigator, setShowMainNavigator] = useState(false)
  const middleware = applyMiddleware(promise, thunkMiddleware)
  const store = createStore(allReducers, middleware)

  useEffect(() => {
    SplashScreen.hide()

    initAgora()
  }, [])

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (!state.isConnected) {
        Alert.alert('Error!', 'You are offline!')
      }
    })

    return unsubscribe
  })

  const initAgora = async () => {
    try {
      await RtcEngine.create(AGORA_APP_ID)
      await RtcEngine.instance().enableAudio()
      await RtcEngine.instance().muteLocalAudioStream(false)
      await RtcEngine.instance().setEnableSpeakerphone(true)
      await RtcEngine.instance().adjustPlaybackSignalVolume(100)
    } catch (error) {
      return
    }
  }

  const onEnd = () => {
    setShowMainNavigator(true)
  }

  return showMainNavigator ? (
    <Provider store={store}>
      <AuthProvider>
        <RoomProvider>
          <SafeAreaProvider>
            <NavigationContainer linking={linking}>
              <RootNavigator />
              <RoomVoiceScreen />
            </NavigationContainer>
          </SafeAreaProvider>
        </RoomProvider>
      </AuthProvider>
    </Provider>
  ) : (
    <VideoSplashScreen onEnd={onEnd} />
  )
}

export default App
