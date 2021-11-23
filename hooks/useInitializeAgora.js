import { useContext, useCallback } from 'react'
import RtcEngine from 'react-native-agora'
import { RoomContext } from '../context/RoomContext'

export const useInitializeAgora = () => {
  // Replace yourAppId with the App ID of your Agora project.
  const roomContext = useContext(RoomContext)
  const { isMute, setIsMute, setPersonIds } = roomContext

  const toggleIsMute = useCallback(async () => {
    await RtcEngine.instance().muteLocalAudioStream(!isMute)
    setPersonIds((peerIdsLocal) => {
      let temp = [...peerIdsLocal]
      const foundIndex = temp.findIndex((item) => item.uid === peerIdsLocal[0].uid)

      if (foundIndex !== -1) {
        temp[foundIndex].muted = !isMute
      }
      return temp
    })
    setIsMute(!isMute)
  }, [isMute])

  // const toggleIsSpeakerEnable = useCallback(async () => {
  //   await RtcEngine.instance().setEnableSpeakerphone(!isSpeakerEnable)
  //   setIsSpeakerEnable(!isSpeakerEnable)
  // }, [isSpeakerEnable])

  const destroyAgoraEngine = useCallback(async () => {
    await RtcEngine.instance().destroy()
  }, [])

  return {
    toggleIsMute,
    // toggleIsSpeakerEnable,
  }
}
