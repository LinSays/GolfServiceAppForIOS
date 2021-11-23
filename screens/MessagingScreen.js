import React, { useContext, useEffect, useRef, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Bubble, GiftedChat, Send } from 'react-native-gifted-chat'
import CustomInputToolbar from '../components/CustomInputToolbar'
import SvgIcon from '../components/SvgIcons'
import { Colors } from '../constants/Colors'
import { STORAGE_URL } from '../constants/Globals'
import { RoomContext } from '../context/RoomContext'
import { getUserById } from '../utils/AuthUtils'
import { addChatLogs, getChatLogs } from '../utils/DataUtils'
import { getPictureBySize } from '../utils/Helper'

const MessagingScreen = ({ channelName, channelID }) => {
  const [messages, setMessages] = useState([])
  const roomContext = useContext(RoomContext)
  const channel = useRef(null)

  useEffect(() => {
    const addMessages = async () => {
      await addChatLogs(channelID, messages)
    }
    const getMessages = async () => {
      const res = await getChatLogs(channelID)
      if (res.status !== 'success') return
      setMessages(res.data?.messages)
    }

    if (channelID) {
      if (messages?.length) {
        addMessages()
        return
      }
      getMessages()
    }
  }, [messages])

  const subscribeChannelMessage = () => {
    roomContext.client.on('error', (evt) => {
      console.log('error: ', evt)
    })

    roomContext.client.on('channelMessageReceived', async (evt) => {
      const { uid, channelId, text } = evt
      if (channelId === channel.current) {
        const { data: user } = await getUserById(uid)
        if (!user) return
        const { firstName, lastName, file } = user
        setMessages((prevState) =>
          GiftedChat.append(prevState, [
            {
              _id: +new Date(),
              text,
              user: {
                _id: +new Date(),
                name: `${firstName} ${lastName}`,
                avatar: file
                  ? file.filename
                    ? `${STORAGE_URL}/${file.filename}?alt=media`
                    : file.photoURL
                    ? getPictureBySize(file.photoURL, 480, 480)
                    : undefined
                  : undefined,
              },
              createdAt: new Date(),
            },
          ]),
        )
      }
    })
  }

  const onSend = (_messages = []) => {
    _messages.forEach((message: any) => {
      roomContext.client
        .sendChannelMessage({
          channel: channel.current,
          message: `${message.text}`,
        })
        .then(() => {
          setMessages((prevState) => GiftedChat.append(prevState, [message]))
        })
        .catch(() => {
          console.warn('send failure')
        })
    })
  }

  useEffect(() => {
    let _channel = channelName || 'agora'
    subscribeChannelMessage()
    joinChannel()
    return () => {
      roomContext.client.leave(_channel)
    }
  }, [])

  const joinChannel = async () => {
    let _channel = channelName || 'agora'
    try {
      await roomContext.client.join(_channel)
      channel.current = _channel
    } catch (e) {
      console.warn('join failure')
    }
  }

  return (
    <GiftedChat
      messages={messages}
      onSend={(_messages) => onSend(_messages)}
      user={{
        _id: channelID || 0,
      }}
      messagesContainerStyle={{
        width: '100%',
        paddingBottom: 20,
      }}
      alwaysShowSend
      renderInputToolbar={(props) => <CustomInputToolbar {...props} />}
      renderSend={(props) => (
        <Send {...props}>
          <View style={styles.sendButton}>
            <SvgIcon type="paper_plane" />
          </View>
        </Send>
      )}
      textInputStyle={styles.textInput}
      textInputProps={{
        height: 42,
      }}
      multiline={false}
      renderBubble={(props) => (
        <Bubble
          {...props}
          wrapperStyle={{
            right: {
              backgroundColor: Colors.primary,
              // marginRight: 0,
            },
            left: {
              backgroundColor: Colors.white,
            },
          }}
        />
      )}
    />
  )
}

export default MessagingScreen

const styles = StyleSheet.create({
  sendButton: {
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    marginRight: -15,
  },
  textInput: {
    backgroundColor: Colors.white,
    borderRadius: 21,
    paddingHorizontal: 15,
  },
})
