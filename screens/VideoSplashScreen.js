import React from 'react'
import { Dimensions, TouchableWithoutFeedback, View } from 'react-native'
import Video from 'react-native-video'

const VideoSplashScreen = ({ onEnd }) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Video
        source={require('../assets/images/video_splash.mp4')}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        resizeMode="cover"
        onEnd={onEnd}
      />
      <TouchableWithoutFeedback
        onPress={() => {
          onEnd()
        }}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'red',
            width: Dimensions.get('screen').width,
            height: Dimensions.get('screen').height,
            justifyContent: 'center',
            zIndex: 9999,
            opacity: 0,
          }}
        />
      </TouchableWithoutFeedback>
    </View>
  )
}

export default VideoSplashScreen
