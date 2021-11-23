// Constants
// export const IS_REGISTERING = 'isRegistering'
export const TEXT_INPUT_MAX_LENGTH = 30

// Navigation Constants
export const SCREEN_NAMES = {
  // Main Stack
  HOME: 'HomeScreen',
  PROFILE: 'ProfileScreen',
  EDIT_PROFILE: 'EditProfileScreen',
  ACCOUNT_SETTINGS: 'AccountSettingsScreen',
  EVENT_LIST: 'EventListScreen',
  CREATE_EVENT: 'CreateEventScreen',
  EVENT_DATETIME: 'EventDateTimeScreen',
  INVITATION: 'InvitationScreen',
  SETUP_USER_PROFILE: 'SetupUserProfileScreen',
  CONFIRM_PROFILE: 'ConfirmProfileScreen',
  EVENT_VIEW: 'EventViewScreen',
  EDIT_RULES: 'RulesScreen',
  ROOM_DETAILS: 'RoomDetailsScreen',
  ROOM_RULES: 'RoomRulesScreen',
  NOTIFICATIONS_SCREEN: 'NotificationsScreen',
  WEATHER_FORECAST_SCREEN: 'WeatherForecastScreen',
  SEARCH_SCREEN: 'SearchScreen',
  VIEW_PROFILE_SCREEN: 'ViewProfileScreen', // View others profile
  FOLLOWINGS_SCREEN: 'FollowingsScreen',
  FOLLOWERS_SCREEN: 'FollowersScreen',
  FOLLOWINGS: 'Followings',
  ROOM_VOICE_SCREEN: 'RoomVoiceScreen',

  // Event Tab Screens
  EVENT_DETAILS_TAB: 'EventDetailsTab',
  EVENT_PARTICIPANT_TAB: 'EventParticipantTab',
  EVENT_PAIRINGS_TAB: 'EventPairingTab',
  HIDDEN_EVENTS: 'HiddenEventsScreen',
  HIDDEN_ROOMS: 'HiddenRoomsScreen',

  // Pairing Screens
  PAIRINGS_MAIN: 'PairingsMainScreen',
  PAIRINGS_GROUP_EDIT: 'PairingsGroupEditScreen',

  // Welcome Stack
  REGISTRATION_DONE: 'RegistrationDoneScreen',
  WELCOME: 'WelcomeScreen',
  LAST_STEP: 'LastStepScreen',

  // Auth Stack
  LOGIN_SOCIAL: 'LoginWithSocial',
  OTP_SCREEN: 'OtpVerificationScreen',
  REGISTER: 'RegisterScreen',
  FORGOT_PASSWORD: 'ForgotPassword',
}

export const NAVIGATOR = {
  MAIN: 'Main',
  WELCOME: 'Welcome',
  AUTH: 'Auth',
}

export const STORE_NAMES = {
  PROFILE: 'ProfileStore',
  USER_DATA: 'UserDataStore',
  EVENT_DATA: 'EventDataStore',
  EVENT_LIST: 'EventListStore',
  ROOM_LIST: 'RoomListStore',
  NOTIFICATIONS_LIST: 'NotificationsList',
}

// export const BASE_URL = 'http://localhost:5001/golf-app-19th-hole/us-central1/webApi/api/v1'
export const BASE_URL = 'https://us-central1-golf-app-19th-hole.cloudfunctions.net/webApi/api/v1'
export const GHIN_API_URL = 'https://api.ghin.com/api/v1'
export const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5'
export const WEATHER_API_IMAGE_URL = 'https://openweathermap.org/img/w'

export const STORAGE_URL =
  'https://firebasestorage.googleapis.com/v0/b/golf-app-19th-hole.appspot.com/o'

export const PERMISSION_TYPES = {
  MEDIA: 'media',
  NOTIFICATION: 'notification',
  LOCATION: 'location',
  PRIVACY: 'privacy',
}

export const NOTIFICATION_TYPES = {
  EVENT: 'event',
  ALERT: 'alert',
  FOLLOW: 'follow',
}
