import React from 'react'
import { Path } from 'react-native-svg'

import { Colors } from '../constants/Colors'

const Line = ({ line }) => <Path d={line} stroke={Colors.black} fill={'none'} />

export default Line
