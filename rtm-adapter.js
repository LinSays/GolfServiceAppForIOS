import RtmEngine from 'agora-react-native-rtm'
import { EventEmitter } from 'events'
import { AGORA_APP_ID } from './config'

export default class RtmAdapter extends EventEmitter {
  client
  uid

  constructor() {
    super()
    this.uid = null
    this.client = new RtmEngine()
    const events = [
      'tokenExpired',
      'remoteInvitationRefused',
      'remoteInvitationFailure',
      'remoteInvitationCanceled',
      'remoteInvitationAccepted',
      'messageReceived',
      'localInvitationRefused',
      'localInvitationReceivedByPeer',
      'localInvitationFailure',
      'localInvitationCanceled',
      'localInvitationAccepted',
      'error',
      'connectionStateChanged',
      'channelMessageReceived',
      'channelMemberLeft',
      'channelMemberJoined',
      'remoteInvitationReceived',
    ]
    events.forEach((event) => {
      this.client.on(event, (evt) => {
        this.emit(event, evt)
      })
    })
  }

  async login(uid, token) {
    try {
      await this.client.createClient(AGORA_APP_ID)
      this.uid = uid
      await this.client.login({ token, uid })
    } catch (err) {
      return { err }
    }
  }

  async logout() {
    await this.client.logout()
  }

  async join(cid) {
    return this.client.joinChannel(cid)
  }

  async leave(cid) {
    return this.client.leaveChannel(cid)
  }

  async sendChannelMessage(param) {
    return this.client.sendMessageByChannelId(param.channel, param.message)
  }

  async destroy() {
    await this.client.destroyClient()
  }
}
