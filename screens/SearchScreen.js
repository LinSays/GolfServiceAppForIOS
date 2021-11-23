import React, { useCallback, useEffect, useState } from 'react'
import {
  View,
  StyleSheet,
  TextInput,
  Dimensions,
  FlatList,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native'
import { debounce } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'

import SvgIcon from '../components/SvgIcons'
import SearchListItem from '../components/SearchListItem'
import { Colors } from '../constants/Colors'
import { fetchMoreUsers, fetchUsers, setSearchResult } from '../actions/users.action'
import { SCREEN_NAMES } from '../constants/Globals'

const SearchScreen = ({ navigation }) => {
  const dispatch = useDispatch()
  const userData = useSelector((state) => state.user)
  const users = useSelector((state) => state.users.allUsers)
  const searchResult = useSelector((state) => state.users.searchResult)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isMomentum, setIsMomentum] = useState(false)

  useEffect(() => {
    dispatch(fetchUsers(15))
  }, [])

  useEffect(() => {
    if (searchTerm) {
      dispatch(fetchUsers(15, searchTerm))
    } else {
      dispatch(setSearchResult([]))
    }
  }, [searchTerm])

  const handleChange = (value) => {
    setSearchTerm(value)
  }

  const handler = useCallback(debounce(handleChange, 1000), [])

  return (
    <View style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inputContainer}>
          <SvgIcon type="search" color={Colors.gray} style={styles.searchIcon} />
          <TextInput
            placeholder="Search club members"
            style={styles.input}
            onChangeText={handler}
          />
        </View>
      </TouchableWithoutFeedback>
      <View style={styles.flatListWrapper}>
        <FlatList
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListFooterComponent={() => <View>{isRefreshing ? <ActivityIndicator /> : null}</View>}
          onEndReached={({ distanceFromEnd }) => {
            if (!isRefreshing && !isMomentum && !searchTerm) {
              setIsRefreshing(true)
              dispatch(fetchMoreUsers(10, () => setIsRefreshing(false)))
              setIsMomentum(true)
            }
          }}
          onEndReachedThreshold={0.5}
          onMomentumScrollBegin={() => {
            setIsMomentum(false)
          }}
          key="_"
          data={searchTerm ? searchResult : users.filter((user) => user.id !== userData.id)}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SearchListItem
              item={item}
              onPress={() => {
                navigation.navigate(SCREEN_NAMES.VIEW_PROFILE_SCREEN, { userId: item.id })
              }}
            />
          )}
        />
      </View>
    </View>
  )
}

export default SearchScreen

const styles = StyleSheet.create({
  inputContainer: {
    backgroundColor: Colors.white,
    height: 70,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: Dimensions.get('screen').width - 30,
    height: 36,
    paddingLeft: 40,
    paddingRight: 10,
    borderRadius: 10,
    backgroundColor: Colors.lightGray,
  },
  searchIcon: { marginLeft: 10, marginRight: -30, zIndex: 1 },
  flatListWrapper: {
    backgroundColor: Colors.white,
    flex: 1,
    marginHorizontal: 15,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 10,
    padding: 20,
  },
})
