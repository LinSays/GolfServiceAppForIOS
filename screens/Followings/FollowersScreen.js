import React from 'react'
import { FlatList, StyleSheet, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import SearchListItem from '../../components/SearchListItem'
import { SCREEN_NAMES } from '../../constants/Globals'

const FollowersScreen = () => {
  const navigation = useNavigation()
  const followers = useSelector((state) => state.followings.followers)

  return (
    <View style={styles.container}>
      <FlatList
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        key="_"
        data={followers}
        keyExtractor={(item) => item.follower}
        renderItem={({ item }) => (
          <SearchListItem
            item={item.userData}
            showRemove
            hideFollowing
            onPress={() => {
              navigation.navigate(SCREEN_NAMES.VIEW_PROFILE_SCREEN, { userId: item.follower })
            }}
          />
        )}
      />
    </View>
  )
}

export default FollowersScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
})
