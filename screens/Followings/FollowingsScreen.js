import React from 'react'
import { FlatList, StyleSheet, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import SearchListItem from '../../components/SearchListItem'
import { SCREEN_NAMES } from '../../constants/Globals'

const FollowingsScreen = () => {
  const navigation = useNavigation()
  const followings = useSelector((state) => state.followings.followings)

  return (
    <View style={styles.container}>
      <FlatList
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        key="_"
        data={followings}
        keyExtractor={(item) => item.userId}
        renderItem={({ item }) => (
          <SearchListItem
            item={item.userData}
            onPress={() => {
              navigation.navigate(SCREEN_NAMES.VIEW_PROFILE_SCREEN, { userId: item.userId })
            }}
          />
        )}
      />
    </View>
  )
}

export default FollowingsScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
})
