import React, { createContext, useEffect, useReducer, useState } from 'react'
import RtcEngine from 'react-native-agora'
import RtmAdapter from '../rtm-adapter'

const defaultProps = {
  channel: null,
  messages: [],
  client: new RtmAdapter(),
  setChannel() {},
  setMessages() {},
}

function mutation(state, action) {
  switch (action.type) {
    case 'messages': {
      return { ...state, messages: action.payload }
    }
    case 'channel': {
      return { ...state, channel: action.payload }
    }
    default:
      throw new Error('mutation type not defined')
  }
}
export const RoomContext = createContext(defaultProps)

export const RoomProvider = ({ children }) => {
  const [isVisible, setIsVisible] = useState({ isFullRoom: false, isShowMembers: true })
  const [isHiddenRoom, setIsHiddenRoom] = useState(false)

  const [navRoom, setNavRoom] = useState(null)
  const [channelData, setChannelData] = useState(null)
  const [personIds, setPersonIds] = useState([])
  const [headHeight, setHeadHeight] = useState(100)
  const [isMute, setIsMute] = useState(false)

  const [state, dispatch] = useReducer(mutation, defaultProps)

  useEffect(() => {
    RtcEngine.instance()

    RtcEngine.instance().addListener('JoinChannelSuccess', (channel, uid, elapsed) => {
      setPersonIds([{ uid, muted: false }])
    })

    RtcEngine.instance().addListener('UserJoined', (uid) => {
      setPersonIds((peerIdsLocal) => {
        if (peerIdsLocal.findIndex((item) => item.uid === uid) === -1) {
          return [...peerIdsLocal, { uid, muted: false }]
        }
        return peerIdsLocal
      })
    })

    RtcEngine.instance().addListener('UserOffline', (uid) => {
      setPersonIds((peerIdsLocal) => {
        return peerIdsLocal.filter((item) => item.uid !== uid)
      })
    })

    RtcEngine.instance().addListener('UserMuteAudio', (uid, muted) => {
      setPersonIds((peerIdsLocal) => {
        let temp = [...peerIdsLocal]
        const foundIndex = temp.findIndex((item) => item.uid === uid)
        if (foundIndex !== -1) {
          temp[foundIndex].muted = muted
        }
        return temp
      })
    })

    return () => {
      RtcEngine.instance().removeAllListeners()
    }
  }, [])

  const context = {
    ...state,
    setMessages(messages) {
      dispatch({
        type: 'messages',
        payload: messages,
      })
    },
    setChannel(channel) {
      dispatch({
        type: 'channel',
        payload: channel,
      })
    },
  }

  return (
    <RoomContext.Provider
      value={{
        ...context,
        isVisible,
        setIsVisible,
        personIds,
        setPersonIds,
        channelData,
        setChannelData,
        headHeight,
        setHeadHeight,
        navRoom,
        setNavRoom,
        isMute,
        setIsMute,
        isHiddenRoom,
        setIsHiddenRoom,
      }}>
      {children}
    </RoomContext.Provider>
  )
}
