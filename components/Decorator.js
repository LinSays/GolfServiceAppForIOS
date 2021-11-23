import React from 'react'
import Svg, { Circle, Text } from 'react-native-svg'

import { Colors } from '../constants/Colors'

const Decorator = ({ x, y, data }) => {
  return data.map((value, index) => (
    <Svg key={index}>
      <Circle cx={x(index)} cy={y(value)} r={7} stroke={Colors.primary} fill={Colors.primary} />
      <Text
        x={x(index)}
        y={y(value) + 1}
        fontSize={8}
        fill={Colors.white}
        alignmentBaseline={'middle'}
        textAnchor={'middle'}>
        {value}
      </Text>
    </Svg>
  ))
}

export default Decorator
