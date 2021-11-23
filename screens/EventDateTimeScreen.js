import React, { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, View, Platform } from 'react-native'
import { Calendar } from 'react-native-calendars'
import DateTimePicker from '@react-native-community/datetimepicker'

import BottomSection from '../components/BottomSection'
import PrimaryButton from '../components/PrimaryButton'
import { SCREEN_NAMES } from '../constants/Globals'
import { Colors } from '../constants/Colors'
import { formatDate, isset } from '../utils/Helper'
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentEvent } from '../actions'

const EventDateTimeScreen = ({ route, navigation }) => {
  const dispatch = useDispatch()
  const currentEvent = useSelector((state) => state.currentEvent)
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date(), 'YYYY-MM-DD'))
  const [selectedTime, setSelectedTime] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(Platform.OS === 'ios' ? true : false)
  const markedDates = {}
  markedDates[selectedDate] = { selected: true }

  useEffect(() => {
    if (currentEvent.date && currentEvent.time) {
      const dateTime = new Date(`${currentEvent.date}T${currentEvent.time}`)
      setSelectedDate(formatDate(dateTime, 'YYYY-MM-DD'))
      setSelectedTime(dateTime)
    }
  }, [])

  const handleNext = () => {
    dispatch(
      setCurrentEvent({
        ...currentEvent,
        date: selectedDate,
        time: selectedTime.toISOString().split('T')[1],
      }),
    )
    navigation.navigate(SCREEN_NAMES.INVITATION, {
      back: SCREEN_NAMES.EVENT_DATETIME,
      isEdition: isset(() => route.params.isEdition) ? true : null,
    })
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Calendar
            style={{ height: 350 }}
            current={new Date()}
            onDayPress={(dateObj) => {
              setSelectedDate(dateObj.dateString)
              setShowDatePicker(Platform.OS === 'ios' ? true : !showDatePicker)
            }}
            monthFormat="MMMM yyyy"
            firstDay={1}
            showWeekNumbers={true}
            onPressArrowLeft={(subtractMonth) => subtractMonth()}
            onPressArrowRight={(addMonth) => addMonth()}
            enableSwipeMonths={true}
            markedDates={markedDates}
            theme={{
              // textDayFontFamily: 'QuicksandMedium',
              // textDayHeaderFontFamily: 'QuicksandMedium',
              // textMonthFontFamily: 'QuicksandSemiBold',
              textMonthFontSize: 18,
              arrowColor: Colors.primary,
              todayTextColor: Colors.black,
              dayTextColor: Colors.black,
              monthTextColor: Colors.black,
              selectedDayBackgroundColor: Colors.green,
            }}
          />
          {showDatePicker && (
            <DateTimePicker
              value={selectedTime}
              mode="time"
              display="spinner"
              onChange={(event, time) => {
                if (time) {
                  setSelectedTime(time)
                  setShowDatePicker(Platform.OS === 'ios' ? true : !showDatePicker)
                }
              }}
            />
          )}
        </View>
      </ScrollView>
      <BottomSection>
        <PrimaryButton
          style={{ width: '100%', marginVertical: 10 }}
          title="Next"
          onPress={handleNext}
        />
      </BottomSection>
    </View>
  )
}

export default EventDateTimeScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
  },
  section: {
    height: 'auto',
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 120,
    padding: 20,
    backgroundColor: Colors.white,
  },
})
