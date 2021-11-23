// import libraries
const functions = require('firebase-functions')
const admin = require('firebase-admin')
const express = require('express')
const bodyParser = require('body-parser')
const Vonage = require('@vonage/server-sdk')
const { v4: uuidv4 } = require('uuid')
const { RtcTokenBuilder, RtcRole, RtmTokenBuilder, RtmRole } = require('agora-access-token')
const { verifyGhin, getAssociations, getScores, removeDuplicates } = require('./utils')
const { firestore } = require('firebase-admin')
const {
  AGORA_APP_ID,
  AGORA_APP_CERTIFICATE,
  VONAGE_API_SECRET,
  VONAGE_API_KEY,
} = require('./config')

const vonage = new Vonage({
  apiKey: VONAGE_API_KEY,
  apiSecret: VONAGE_API_SECRET,
})

// initialize firebase in order to access its services
admin.initializeApp(functions.config().firebase)

// initialize express server
const app = express()
const main = express()

// add the path to receive request and set json as bodyParser to process the body
main.use('/api/v1', app)
main.use(bodyParser.json())
main.use(bodyParser.urlencoded({ extended: false }))

// initialize the database and the collection
const db = admin.firestore()
const userCollection = 'users'
const eventCollection = 'events'
const roomCollection = 'rooms'
const contactsCollection = 'contacts'
const notificationsCollection = 'notifications'
const followingsCollection = 'followings'
const chatLogsCollection = 'chatLogs'

// Create new user
app.post('/users', async (req, res) => {
  try {
    const { ghin, lastName } = req.body
    let data = {}
    if (ghin) {
      try {
        const ghinData = await verifyGhin(ghin, lastName, 'false')
        if (ghinData.length) {
          const associations = await getAssociations(
            ghinData[0].GHINNumber,
            ghinData[0].NewUserToken,
          )
          const scores = await getScores(ghinData[0].GHINNumber, 1, 10, ghinData[0].NewUserToken)
          data = { ghinData, associations, scores }
        } else {
          res
            .status(201)
            .send({ status: 'failed', error: 'Cannot find GHIN data with provided data!' })
          return
        }
        await db.collection(userCollection).add({
          ...req.body,
          ...data,
          guided: false,
          isProfileGuided: true,
          created: new Date().getTime(),
          updated: new Date().getTime(),
        })

        res.status(201).send({ status: 'success', user: { ...req.body, ...data } })
      } catch (err) {
        res
          .status(404)
          .send({ status: 'failed', error: 'Cannot find GHIN data with provided data!' })
      }
    } else {
      await db.collection(userCollection).add({
        ...req.body,
        guided: false,
        isProfileGuided: false,
        created: new Date().getTime(),
        updated: new Date().getTime(),
      })

      res.status(200).send({ status: 'success', user: req.body })
    }

    // if (ghin) {
    //   db.collection(userCollection)
    //     .where('ghin', '==', ghin)
    //     .get()
    //     .then(async (userQuerySnapshot) => {
    //       if (userQuerySnapshot.docs.length) {
    //         res.status(201).send({ status: 'failed', error: 'User already exists!' })
    //       } else {
    //         await db
    //           .collection(userCollection)
    //           .add({ ...req.body, created: new Date().getTime(), updated: new Date().getTime() })
    //         res.status(201).send({ status: 'success', user: req.body })
    //       }
    //     })
    // } else {
    //   db.collection(userCollection)
    //     .where('phoneNumber', '==', phoneNumber)
    //     .where('nominatedBy', '==', nominatedBy)
    //     .where('eventId', '==', eventId)
    //     .get()
    //     .then(async (userQuerySnapshot) => {
    //       if (userQuerySnapshot.docs.length) {
    //         res.status(201).send({ status: 'failed', error: 'User already exists!' })
    //       } else {
    //         await db
    //           .collection(userCollection)
    //           .add({ ...req.body, created: new Date().getTime(), updated: new Date().getTime() })
    //         res.status(201).send({ status: 'success', user: req.body })
    //       }
    //     })
    // }
  } catch (error) {
    res
      .status(400)
      .send({ status: 'failed', error: error || 'User should cointain email, ghin!!!' })
  }
})

// get users
app.get('/users', async (req, res) => {
  try {
    const { id, email, phoneNumber, offset, limit, searchTerm } = req.query
    if (id) {
      await db
        .collection(userCollection)
        .doc(id)
        .get()
        .then((doc) => res.status(200).json({ status: 'success', user: doc.data() }))
        .catch((error) => res.status(500).send(error))
    } else if (email || phoneNumber) {
      let userQuerySnapshot, data
      if (email) {
        userQuerySnapshot = await db.collection(userCollection).where('email', '==', email).get()
        // const user = userQuerySnapshot.docs[0].data()
        // const ghinData = await verifyGhin(user.ghin, user.lastName, 'false')
        // const associations = await getAssociations(ghinData[0].GHINNumber, ghinData[0].NewUserToken)
        // const scores = await getScores(ghinData[0].GHINNumber, 1, 10, ghinData[0].NewUserToken)
        // data = { ghinData, associations, scores }
      } else if (phoneNumber) {
        userQuerySnapshot = await db
          .collection(userCollection)
          .where('phoneNumber', '==', phoneNumber)
          .get()
      }
      const users = []
      userQuerySnapshot.docs.forEach((doc) => {
        users.push({
          id: doc.id,
          // data: data ? { ...data, user: doc.data() } : { user: doc.data() },
          data: { user: doc.data() },
        })
      })
      if (!users.length) {
        res.status(200).json({
          status: 'failed',
          error: `User does not exist with following data: ${email || phoneNumber}`,
        })
      } else {
        res.status(200).json({ status: 'success', users })
      }
    } else if (offset && limit) {
      await db
        .collection(userCollection)
        .orderBy('created', 'asc')
        .startAt(Number(offset))
        .limit(Number(limit))
        .get()
        .then((querySnapshot) => {
          if (querySnapshot.empty) {
            res.status(200).json({ status: 'success', users: [] })
            return
          }
          const users = []
          querySnapshot.forEach((doc) => {
            users.push({ ...doc.data(), id: doc.id })
          })
          res.status(200).json({ status: 'success', users })
        })
    } else if (searchTerm) {
      await db
        .collection(userCollection)
        .orderBy('fullName', 'asc')
        .startAt(searchTerm)
        .endAt(searchTerm + '\uf8ff')
        .limit(Number(limit))
        .get()
        .then((querySnapshot) => {
          if (querySnapshot.empty) {
            res.status(200).json({ status: 'success', users: [] })
            return
          }
          const users = []
          querySnapshot.forEach((doc) => {
            users.push({ ...doc.data(), id: doc.id })
          })
          res.status(200).json({ status: 'success', users })
        })
    }
  } catch (error) {
    res.status(500).send({ status: 'failed', error })
  }
})

// get a single contact by id
app.get('/users/:id', async (req, res) => {
  const id = req.params.id
  try {
    db.collection(userCollection)
      .doc(id)
      .get()
      .then((doc) => {
        if (!doc.exists) return res.status(404).json({ status: 'failed', error: 'bad request' })
        const { firstName, lastName, file } = doc.data()
        return res.status(200).json({ status: 'success', data: { file, firstName, lastName } })
      })
  } catch (e) {
    console.error(e)
  }
})

// Delete a user
app.delete('/users/:userId', async (req, res) => {
  db.collection(userCollection)
    .doc(req.params.userId)
    .delete()
    .then(() => res.status(204).send('Document successfully deleted!'))
    .catch((error) => {
      res.status(500).send(error)
    })
})

// Update user
app.put('/users/:userId', async (req, res) => {
  if (req.body.ghinUpdated) {
    const ghinData = await verifyGhin(req.body.ghin, req.body.lastName, 'false')
    if (ghinData.length) {
      const associations = await getAssociations(ghinData[0].GHINNumber, ghinData[0].NewUserToken)
      const scores = await getScores(ghinData[0].GHINNumber, 1, 10, ghinData[0].NewUserToken)
      data = { ghinData, associations, scores }
      await db
        .collection(userCollection)
        .doc(req.params.userId)
        .get()
        .then(async (doc) => {
          await db
            .collection(userCollection)
            .doc(req.params.userId)
            .set(
              { ...doc.data(), ...req.body, ...data, updated: new Date().getTime() },
              { merge: true },
            )
            .then(() => {
              res
                .status(200)
                .json({ status: 'success', data: { ...doc.data(), ...req.body, ...data } })
            })
        })
        .catch((error) => res.status(500).send(error))
    } else {
      res.status(200).json({
        status: 'failed',
        error:
          'Failed to fetch GHIN data! Please confirm if you input correct GHIN number and last name!',
      })
    }
  }
  if (req.body.roomId) {
    const { isHidden, roomId } = req.body
    await db
      .collection(userCollection)
      .doc(req.params.userId)
      .get()
      .then(async (doc) => {
        const updatedHiddenRooms = isHidden
          ? doc.data().hiddenRooms
            ? doc.data().hiddenRooms.concat(roomId)
            : [roomId]
          : doc.data().hiddenRooms.filter((id) => id !== roomId)
        // const filter = removeDuplicates(updatedHiddenRooms, (it) => it.id)
        await doc.ref
          .set(
            {
              hiddenRooms: updatedHiddenRooms,
              updated: new Date().getTime(),
            },
            { merge: true },
          )
          .then(() => {
            res.status(200).json({
              status: 'success',
              data: {
                ...doc.data(),
                hiddenRooms: updatedHiddenRooms,
              },
            })
          })
      })
      .catch((error) => res.status(500).send(error))
  } else {
    const updatedData =
      req.body.ghin || req.body.token
        ? req.body
        : {
            ...req.body,
            ghinData: firestore.FieldValue.delete(),
            associations: firestore.FieldValue.delete(),
            scores: firestore.FieldValue.delete(),
          }
    await db
      .collection(userCollection)
      .doc(req.params.userId)
      .set({ ...updatedData, updated: new Date().getTime() }, { merge: true })
      .then(() => res.status(200).json({ status: 'success', data: req.body }))
      .catch((error) => res.status(500).send(error))
  }
})

// Create new event
app.post('/events', async (req, res) => {
  const uuid = uuidv4()
  // calculate privilege expire time
  const currentTime = Math.floor(Date.now() / 1000)
  const privilegeExpireTime = currentTime + 3600
  // build the token
  const token = RtcTokenBuilder.buildTokenWithUid(
    AGORA_APP_ID,
    AGORA_APP_CERTIFICATE,
    uuid,
    0,
    RtcRole.SUBSCRIBER,
    privilegeExpireTime,
  )
  // build rtm token
  const rtmToken = RtmTokenBuilder.buildToken(
    AGORA_APP_ID,
    AGORA_APP_CERTIFICATE,
    uuid,
    RtmRole.Rtm_User,
    privilegeExpireTime,
  )

  try {
    db.collection(eventCollection)
      .add({
        ...req.body,
        created: new Date().getTime(),
        updated: new Date().getTime(),
        roomId: uuid,
      })
      .then((doc) => {
        const { name, participants, createdBy, phoneNumbers } = req.body
        const roomData = {
          title: name,
          participants,
          created: new Date().getTime(),
          updated: new Date().getTime(),
          token,
          rtmToken,
          roomId: uuid,
          isPublic: false,
          creatorUserId: createdBy,
          phoneNumbers,
        }
        res.status(200).send({
          status: 'success',
          event: { id: doc.id, ...req.body },
          room: { id: uuid, data: roomData },
        })
        db.collection(roomCollection).doc(uuid).set(roomData)
      })
  } catch (error) {
    res.status(400).send({ status: 'failed', error: error || 'User should contain email, ghin!!!' })
  }
})

//get all events by phone number
app.get('/events/:phoneNumber', async (req, res) => {
  const { phoneNumber } = req.params
  const { hiddenEvents, onlyHiddenEvents } = req.query
  try {
    db.collection(eventCollection)
      .where('phoneNumbers', 'array-contains', phoneNumber)
      .get()
      .then((userQuerySnapshot) => {
        if (!userQuerySnapshot.docs.length) {
          res.status(200).json({
            status: 'success',
            events: [],
          })
        } else {
          const events = userQuerySnapshot.docs
            .filter((doc) => {
              const participants = doc.data().participants
              const isDeclined = participants.find(
                (participant) =>
                  participant.phoneNumber === phoneNumber && participant.status === 'Declined',
              )
              const isHiddenEvent =
                hiddenEvents && JSON.parse(hiddenEvents).find((event) => event === doc.id)
              return !isDeclined && (onlyHiddenEvents === 'true' ? isHiddenEvent : !isHiddenEvent)
            })
            .map((doc) => ({ ...doc.data(), id: doc.id }))

          res.status(200).json({
            status: 'success',
            events,
          })
        }
      })
      .catch((error) => res.status(500).send({ status: 'failed', error }))
  } catch (error) {
    res.status(400).json({ status: 'failed', error })
  }
})

// get all events by userId
// app.get('/events/:userId', async (req, res) => {
//   const { userId } = req.params
//   const { hiddenEvents, onlyHiddenEvents } = req.query
//   try {
//     db.collection(eventCollection)
//       .where('userIds', 'array-contains', userId)
//       .get()
//       .then((userQuerySnapshot) => {
//         if (!userQuerySnapshot.docs.length) {
//           res.status(200).json({
//             status: 'success',
//             events: [],
//           })
//         } else {
//           const events = userQuerySnapshot.docs
//             .filter((doc) => {
//               const isHiddenEvent =
//                 hiddenEvents && JSON.parse(hiddenEvents).find((event) => event === doc.id)
//               return onlyHiddenEvents === 'true' ? isHiddenEvent : !isHiddenEvent
//             })
//             .map((doc) => ({ ...doc.data(), id: doc.id }))
//           res.status(200).json({
//             status: 'success',
//             events,
//           })
//         }
//       })
//       .catch((error) => res.status(500).send({ status: 'failed', error }))
//   } catch (error) {
//     res.status(400).json({ status: 'failed', error })
//   }
// })

// get event by id or phoneNumber
app.get('/events', async (req, res) => {
  const { id, phoneNumber } = req.query
  if (id) {
    await db
      .collection(eventCollection)
      .doc(id)
      .get()
      .then((doc) => res.status(200).json({ status: 'success', event: { ...doc.data(), id } }))
      .catch((error) => res.status(500).send(error))
  } else if (phoneNumber) {
    await db
      .collection(eventCollection)
      .where('phoneNumbers', 'array-contains', phoneNumber)
      .get()
      .then(async (querySnapshot) => {
        const events = []
        for (const doc of querySnapshot.docs) {
          const { participants, createdBy } = doc.data()
          const participant = participants.find((p) => p.phoneNumber === phoneNumber)
          if (participant && participant.status.includes('Pending') && createdBy) {
            const userAccount = await db.collection(userCollection).doc(createdBy).get()
            events.push({ ...doc.data(), userAccount: userAccount.data(), id: doc.id })
          }
        }
        res.status(200).json({ status: 'success', events })
      })
  } else {
    res.status(200).json({ status: 'success', event: [] })
  }
})

// Update event
app.put('/events/:id', async (req, res) => {
  await db
    .collection(eventCollection)
    .doc(req.params.id)
    .set({ ...req.body, updated: new Date().getTime() }, { merge: true })
    .then(() => res.status(200).json({ status: 'success', event: { id: req.params.id } }))
    .catch((error) => res.status(500).send(error))
})

// Delete an event
app.delete('/events/:id', async (req, res) => {
  try {
    await db.collection(eventCollection).doc(req.params.id).delete()
    res.status(200).send({ status: 'success' })
  } catch (error) {
    res.status(400).send({ status: 'failed', error: 'failed to delete the event' })
  }
})

app.post('/invite', async (req, res) => {
  // const from = '12262416211'
  const from = '18662280428'
  const to = req.body.number
  const { fullName, channelData, isPing } = req.body

  let invitationMessage =
    `Welcome you are invited by ${fullName} to join a conversation in the 19th hole. \n  Click the link to install app and join into this room: ${channelData.title}.\n  ` +
    'https://apps.apple.com/us/app/19th-hole-app/id1571546603'

  if (isPing) {
    await db
      .collection(userCollection)
      .where('phoneNumber', '==', to)
      .get()
      .then((userQuerySnapshot) => {
        if (
          userQuerySnapshot.docs.length !== 0 &&
          userQuerySnapshot.docs[0].data().hasOwnProperty('lastSignIn')
        ) {
          const type = channelData.hasOwnProperty('isPublic') ? 'rooms' : 'events'
          invitationMessage =
            `Welcome you are invited by ${fullName} to join a conversation in the 19th hole. \n  Click the link to join in now. \n ` +
            `hole19://id1571546603/${type}/${channelData.channelName}`
        }
      })
      .catch((error) => res.status(500).send(error))
  }

  vonage.message.sendSms(from, to, invitationMessage, (err, responseData) => {
    if (err) {
      console.error(err)
      return
    }

    if (responseData.messages[0].status === '0') {
      res.status(200).json({ status: 'success' })
    } else {
      res.status(200).json({
        status: 'failed',
        message: `Message failed with error: ${responseData.messages[0]['error-text']}`,
      })
    }
  })
})

// Create room

app.post('/rooms', async (req, res) => {
  try {
    const { roomId } = req.body

    if (!roomId) {
      res.status(400).send({ status: 'failed', error: 'roomId is missing' })
      return
    }
    await db
      .collection(roomCollection)
      .doc(roomId)
      .set({
        ...req.body,
        created: new Date().getTime(),
        updated: new Date().getTime(),
      })
    res.status(201).send({ status: 'success', room: req.body })
  } catch (error) {
    res.status(400).send({ status: 'failed', error: error || 'error on creating room!' })
  }
})

// Update room
app.put('/rooms/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params

    if (!roomId) {
      res.status(400).send({ status: 'failed', error: 'roomId is missing' })
      return
    }

    await db
      .collection(roomCollection)
      .doc(req.params.roomId)
      .get()
      .then(async (doc) => {
        await doc.ref
          .set({ ...doc.data(), ...req.body, updated: new Date().getTime() }, { merge: true })
          .then(() => {
            res.status(200).json({ status: 'success', data: { ...doc.data(), ...req.body } })
          })
          .catch((error) => res.status(500).send(error))
      })
      .catch((error) => res.status(500).send(error))
  } catch (error) {
    res.status(400).send({ status: 'failed', error: error || 'error on creating room!' })
  }
})

//delete current room
app.delete('/rooms/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params
    if (!roomId) {
      res.status(400).send({ status: 'failed', error: 'roomId is required' })
      return
    }
    db.collection(roomCollection)
      .doc(roomId)
      .delete()
      .then(async () => {
        res.status(201).send({ status: 'success' })
        await db.collection(chatLogsCollection).doc(roomId).delete()
      })
      .catch((error) => {
        res.status(500).send({ status: 'failed', error })
      })
  } catch (e) {
    res.status(400).send({ status: 'failed', error: e || 'Bad request' })
  }
})

//check current room is exist or not
app.get('/rooms/:roomId', async (req, res) => {
  try {
    await db
      .collection(roomCollection)
      .doc(req.params.roomId)
      .get()
      .then((doc) => {
        if (doc.exists) {
          res.status(201).send({ status: 'success', isExist: true, data: doc.data() })
        } else {
          res.status(201).send({ status: 'success', isExist: false })
        }
      })
  } catch (error) {
    res.status(400).send({ status: 'failed', error: error || 'error on creating room!!!' })
  }
})

//get all rooms by isHiddenRoom value
app.get('/rooms', async (req, res) => {
  try {
    const { hiddenRooms, isHiddenRoom, phoneNumber, ownerId } = req.query

    if (!phoneNumber || !ownerId) {
      res.status(400).send({ status: 'failed', error: 'roomId is missing' })
      return
    }

    let data = []

    const ownRooms = await db
      .collection(roomCollection)
      .where('creatorUserId', '==', ownerId)
      .get()
      .then((querySnapshot) => querySnapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() })))
    const invitedRooms = await db
      .collection(roomCollection)
      .where('phoneNumbers', 'array-contains', phoneNumber)
      .get()
      .then((querySnapshot) => querySnapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() })))
    if (!hiddenRooms && isHiddenRoom === 'false') {
      const snapshot = await db.collection(roomCollection).where('isPublic', '==', true).get()
      data = snapshot.docs
        .map((doc) => ({ id: doc.id, data: doc.data() }))
        .concat(invitedRooms)
        .concat(ownRooms)
    } else if (isHiddenRoom === 'true') {
      invitedRooms
        .concat(ownRooms)
        .forEach((room) => (hiddenRooms.find((el) => el === room.id) ? data.push(room) : false))
      await db
        .collection(roomCollection)
        .where('isPublic', '==', true)
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const isHidden = hiddenRooms.find((room) => room === doc.id)
            if (isHidden) {
              data.push({ id: doc.id, data: doc.data() })
            }
          })
        })
    } else {
      invitedRooms
        .concat(ownRooms)
        .forEach((room) => (hiddenRooms.find((el) => el === room.id) ? false : data.push(room)))
      await db
        .collection(roomCollection)
        .where('isPublic', '==', true)
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const isHidden = hiddenRooms.find((room) => room === doc.id)
            if (!isHidden) {
              data.push({ id: doc.id, data: doc.data() })
            }
          })
        })
    }
    res.status(200).send({ status: 'success', data: removeDuplicates(data, (it) => it.id) })
  } catch (error) {
    res.status(400).send({ status: 'failed', error: error || 'error on creating room!!!' })
  }
})

//get particular room data
app.get('/rooms', async (req, res) => {
  const { id } = req.query

  try {
    await db
      .collection(roomCollection)
      .doc(id)
      .get()
      .then((doc) => res.status(200).json({ status: 'success', data: doc.data() }))
      .catch((error) => res.status(500).send(error))
  } catch (error) {
    res.status(400).send({ status: 'failed', error: error || 'error on creating room!!!' })
  }
})

app.post('/rtm_token', async (req, res) => {
  try {
    const { userId } = req.body
    if (!userId) {
      return res.status(404).json({ error: 'bad request! userId is required' })
    }
    const privilegeExpireTime = Math.floor(Date.now() / 1000) + 3600
    // build rtm token
    const rtmToken = RtmTokenBuilder.buildToken(
      AGORA_APP_ID,
      AGORA_APP_CERTIFICATE,
      userId,
      RtmRole.Rtm_User,
      Number(privilegeExpireTime),
    )
    res.status(200).send({ status: 'success', data: rtmToken })
  } catch (e) {
    return res.status(500).json({ error: 'internal server error!' })
  }
})

app.post('/access_token', async (req, res) => {
  try {
    res.header('Acess-Control-Allow-Origin', '*')
    // get channel name
    const channelName = req.body.channelName
    if (!channelName) {
      return res.status(500).json({ error: 'channel is required' })
    }
    // get uid
    let uid = req.body.uid
    if (!uid || uid === '') {
      uid = 0
    }
    // get role
    let role = RtcRole.SUBSCRIBER
    if (req.body.role === 'publisher') {
      role = RtcRole.PUBLISHER
    }
    // get the expire time
    let expireTime = req.body.expireTime
    if (!expireTime || expireTime === '') {
      expireTime = 3600
    } else {
      expireTime = parseInt(expireTime, 10)
    }
    // calculate privilege expire time
    const currentTime = Math.floor(Date.now() / 1000)
    const privilegeExpireTime = currentTime + expireTime
    // build the token
    const token = RtcTokenBuilder.buildTokenWithUid(
      AGORA_APP_ID,
      AGORA_APP_CERTIFICATE,
      channelName,
      uid,
      role,
      privilegeExpireTime,
    )

    return res.status(200).json({ token, channelName, uid, role, expireTime: privilegeExpireTime })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ message: 'internal server error' })
  }
})

// Create new user
app.post('/contacts', async (req, res) => {
  try {
    const { userId, contacts } = req.body

    if (userId) {
      await db
        .collection(contactsCollection)
        .where('userId', '==', userId)
        .get()
        .then(async (querySnapshot) => {
          if (querySnapshot.empty) {
            await db.collection(contactsCollection).add({
              userId,
              contacts,
              created: new Date().getTime(),
              updated: new Date().getTime(),
            })
          } else {
            await db
              .collection(contactsCollection)
              .doc(querySnapshot.docs[0].id)
              .set({ contacts }, { merge: true })
          }
        })
        .catch((error) => res.status(500).send(error))
    }
    res.status(200).send({ status: 'success', user: req.body })
  } catch (error) {
    res.status(400).send({ status: 'failed', error: error || 'User should contain email, ghin!!!' })
  }
})

// get notifications by user id
app.get('/notifications/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const { active } = req.query
    if (userId) {
      await db
        .collection(notificationsCollection)
        .where('userId', '==', userId)
        .get()
        .then(async (querySnapshot) => {
          if (querySnapshot.empty) {
            res.status(400).send({ status: 'failed', message: 'No notifications found' })
            return
          } else {
            const notifications = querySnapshot.docs.map((doc) => ({
              ...doc.data(),
              notificationId: doc.id,
            }))
            if (active) {
              const activeNotifications = notifications.filter(
                (notification) => notification.status === 'new',
              )
              res
                .status(200)
                .send({ status: 'success', hasNewNotifications: activeNotifications.length })
            } else {
              res.status(200).send({ status: 'success', notifications })
            }
          }
        })
    }
  } catch (error) {
    res.status(400).send({ status: 'failed', error: 'Something went wrong' })
  }
})

// update notifications by id
app.put('/notifications/:notificationId', async (req, res) => {
  try {
    const { notificationId } = req.params
    if (!notificationId) {
      res.status(400).send({ status: 'failed', error: 'notificationId is required' })
      return
    }

    await db
      .collection(notificationsCollection)
      .doc(notificationId)
      .set({ ...req.body, updated: new Date().getTime() }, { merge: true })
      .then(() => {
        res.status(200).json({ status: 'success' })
      })
      .catch((error) => res.status(500).send(error))
  } catch (error) {
    res.status(400).send({ status: 'failed', error: 'Something went wrong' })
  }
})

// delete notification by id
app.delete('/notifications/:notificationId', async (req, res) => {
  try {
    const { notificationId } = req.params
    if (!notificationId) {
      res.status(400).send({ status: 'failed', error: 'notificationId is required' })
      return
    }
    await db
      .collection(notificationsCollection)
      .doc(notificationId)
      .delete()
      .then(() => res.status(204).send('Notification successfully deleted!'))
      .catch((error) => {
        res.status(500).send(error)
      })
  } catch (error) {
    res.status(400).send({ status: 'failed', error: 'Something went wrong' })
  }
})

// add new record to followings collection
app.post('/followings', async (req, res) => {
  try {
    const { userId, follower } = req.body
    if (!userId || !follower) {
      res.status(400).send({ status: 'failed', message: 'userId and follower are required' })
      return
    }

    await db.collection(followingsCollection).add({
      userId,
      follower,
    })

    await db
      .collection(userCollection)
      .doc(userId)
      .get()
      .then((doc) => {
        res.status(201).send({
          status: 'success',
          data: { ...req.body, userData: { ...doc.data(), id: doc.id } },
        })
      })
  } catch (error) {
    res.status(400).send({ status: 'failed', error: error || 'User should contain email, ghin!!!' })
  }
})

// get followers
app.get('/followings/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    if (!userId) {
      res.status(400).send({ status: 'failed', message: 'userId is required' })
      return
    }

    let followers = [],
      followings = []
    await db
      .collection(followingsCollection)
      .where('userId', '==', userId)
      .get()
      .then(async (querySnapshot) => {
        for (const doc of querySnapshot.docs) {
          await db
            .collection(userCollection)
            .doc(doc.data().follower)
            .get()
            .then((userDoc) =>
              followers.push({ ...doc.data(), userData: { ...userDoc.data(), id: userDoc.id } }),
            )
        }
      })

    await db
      .collection(followingsCollection)
      .where('follower', '==', userId)
      .get()
      .then(async (querySnapshot) => {
        for (const doc of querySnapshot.docs) {
          await db
            .collection(userCollection)
            .doc(doc.data().userId)
            .get()
            .then((userDoc) =>
              followings.push({ ...doc.data(), userData: { ...userDoc.data(), id: userDoc.id } }),
            )
        }
      })

    res.status(200).send({ status: 'success', data: { followers, followings } })
  } catch (error) {
    res.status(400).send({ status: 'failed', error: error || 'User should contain email, ghin!!!' })
  }
})

// delete record from followings collection
app.delete('/followings', async (req, res) => {
  try {
    const { userId, follower } = req.body
    if (!userId || !follower) {
      res.status(400).send({ status: 'failed', message: 'userId and follower are required' })
      return
    }

    await db
      .collection(followingsCollection)
      .where('userId', '==', userId)
      .where('follower', '==', follower)
      .get()
      .then(async (querySnapshot) => {
        if (querySnapshot.empty) {
          res.status(400).send({ status: 'failed', message: 'cannot find relevant record!' })
          return
        }
        await querySnapshot.docs[0].ref.delete()
        res.status(200).send({ status: 'success' })
      })
  } catch (error) {
    res.status(400).send({ status: 'failed', error: error || 'User should contain email, ghin!!!' })
  }
})

// add chat log
app.post('/chatLogs/:channelID', async (req, res) => {
  try {
    const { channelID } = req.params
    const { messages } = req.body

    if (!channelID) {
      res.status(400).send({ status: 'failed', message: 'channelID is required!' })
      return
    }

    await db.collection(chatLogsCollection).doc(channelID).set({
      channelID,
      messages,
      created: new Date().getTime(),
      updated: new Date().getTime(),
    })

    res.status(201).send({ status: 'success' })
  } catch (err) {
    res.status(400).send({ status: 'failed', error: err || 'Bad request!' })
  }
})

// get chat log by channel ID
app.get('/chatLogs/:channelID', async (req, res) => {
  try {
    const { channelID } = req.params

    if (!channelID) {
      res.status(400).send({ status: 'failed', message: 'channelID is required!' })
      return
    }

    await db
      .collection(chatLogsCollection)
      .doc(channelID)
      .get()
      .then((doc) => {
        res.status(200).send({ status: 'success', data: doc.data() })
      })
  } catch (err) {
    res.status(400).send({ status: 'failed', error: err || 'Bad request!' })
  }
})

exports.updateToken = functions.pubsub.schedule('*/50 * * * *').onRun((context) => {
  db.collection(roomCollection)
    .get()
    .then((snapshot) => {
      snapshot.forEach(async (doc) => {
        const currentTime = Math.floor(Date.now() / 1000)
        const privilegeExpireTime = currentTime + 3600
        // doc.data().title
        const token = RtcTokenBuilder.buildTokenWithUid(
          AGORA_APP_ID,
          AGORA_APP_CERTIFICATE,
          doc.id,
          doc.data().uid || 0,
          doc.data().role || RtcRole.SUBSCRIBER,
          privilegeExpireTime,
        )
        await db
          .collection(roomCollection)
          .doc(doc.id)
          .update({ ...doc.data(), updated: new Date().getTime(), token })
      })
    })
  return null
})

exports.userTrigger = functions.firestore
  .document('users/{userId}')
  .onCreate(async (change, context) => {
    if (context.params) {
      const { userId: id } = context.params
      const userData = await db.collection(userCollection).doc(id).get()
      const { phoneNumber, firstName, lastName, file } = userData.data()
      const STORAGE_URL =
        'https://firebasestorage.googleapis.com/v0/b/golf-app-19th-hole.appspot.com/o'
      const imageUrl = file
        ? file.filename
          ? `${STORAGE_URL}/${file.filename}?alt=media`
          : file.photoURL
          ? file.photoURL
          : null
        : null

      if (phoneNumber) {
        const tokens = []
        await db
          .collection(contactsCollection)
          .where('contacts', 'array-contains', phoneNumber)
          .get()
          .then(async (querySnapshot) => {
            if (querySnapshot.docs.length) {
              for (const doc of querySnapshot.docs) {
                const { userId } = doc.data()
                if (userId) {
                  await db
                    .collection(userCollection)
                    .doc(userId)
                    .get()
                    .then(async (user) => {
                      await db.collection(notificationsCollection).add({
                        id: uuidv4(),
                        type: 'alert',
                        fullName: `${firstName} ${lastName}`,
                        imageUrl,
                        created: new Date().getTime(),
                        userId,
                        createdUserId: id,
                        status: 'new',
                      })
                      const { token } = user.data()
                      if (token) tokens.push(token)
                    })
                }
              }
            }
          })
        if (tokens.length) {
          if (firstName && lastName) {
            const message = `${firstName} ${lastName} just joined the app!`
            await admin.messaging().sendMulticast({
              tokens,
              notification: {
                title: 'Notification',
                body: message,
                imageUrl:
                  imageUrl ||
                  'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
              },
              data: { message },
            })
          }
        }
      }
    }
  })

exports.eventTrigger = functions.firestore
  .document('events/{eventId}')
  .onCreate(async (change, context) => {
    if (context.params) {
      const { eventId: id } = context.params
      try {
        const event = await db
          .collection(eventCollection)
          .doc(id)
          .get()
          .then((doc) => doc.data())
        const { phoneNumbers, createdBy } = event
        const me = await db
          .collection(userCollection)
          .doc(createdBy)
          .get()
          .then((doc) => doc.data())
        let userId
        if (phoneNumbers.length) {
          const tokens = []
          for (const phoneNumber of phoneNumbers) {
            if (phoneNumber !== me.phoneNumber) {
              await db
                .collection(userCollection)
                .where('phoneNumber', '==', phoneNumber)
                .get()
                .then(async (querySnapshot) => {
                  if (querySnapshot.docs.length) {
                    const doc = querySnapshot.docs[0].data()
                    const currentTime = new Date().getTime()
                    const { firstName, lastName, file } = me
                    userId = querySnapshot.docs[0].id
                    await db.collection(notificationsCollection).add({
                      id: uuidv4(),
                      type: 'event',
                      fullName: `${firstName} ${lastName}`,
                      file,
                      event: { ...event, id },
                      created: currentTime,
                      userId,
                      status: 'new',
                    })
                    const { token } = doc
                    if (token) tokens.push(token)
                  }
                })
            }
          }
          if (tokens.length) {
            const message = `${me.firstName} ${me.lastName} invited you to ${event.name}!`
            await admin.messaging().sendMulticast({
              tokens,
              notification: {
                title: 'Notification',
                body: message,
              },
              data: { message, userId },
            })
          }
        }
      } catch (error) {
        console.log(error)
      }
    }
  })

exports.followingsTrigger = functions.firestore
  .document('followings/{followingId}')
  .onCreate(async (change, context) => {
    if (context.params) {
      const { followingId: id } = context.params
      try {
        const { userId, follower } = await (
          await db.collection(followingsCollection).doc(id).get()
        ).data()

        if (!userId || !follower) return

        const followerData = await (await db.collection(userCollection).doc(follower).get()).data()
        await db.collection(notificationsCollection).add({
          id: uuidv4(),
          type: 'follow',
          status: 'new',
          fullName: followerData.fullName,
          file: followerData.file,
          userId,
          follower,
          created: new Date().getTime(),
        })

        const userData = await (await db.collection(userCollection).doc(userId).get()).data()
        if (userData.token) {
          const message = `${followerData.fullName} followed you`
          await admin.messaging().sendMulticast({
            tokens: [userData.token],
            notification: {
              title: 'Notification',
              body: message,
            },
            data: { message, userId },
          })
        }
      } catch (error) {
        console.log(error)
      }
    }
  })

exports.webApi = functions.https.onRequest(main)
