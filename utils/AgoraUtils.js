import RtcEngine from 'react-native-agora'

export const joinRoomWithUserAccount = async (token, channelName, userId) => {
  await RtcEngine.instance().joinChannelWithUserAccount(token, channelName, userId)
}

export const leaveRoom = async () => {
  await RtcEngine.instance().leaveChannel()
}
