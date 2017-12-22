import React from 'react'
import { View, ActivityIndicator } from 'react-native'
import { Text } from 'native-base'

const LoadingMask = () => (
  <View
    style={{
      flex: 1,
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center'
    }}
  >
    <View
      style={{
        justifyContent: 'center',
        width: 200,
        height: 200,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#fff',
        borderRadius: 10
      }}
    >
      <Text style={{ color: '#000', textAlign: 'center', paddingBottom: 30 }}>
        Please wait, loading information...
      </Text>
      <ActivityIndicator size="large" color="#000" />
    </View>
  </View>
)

export default LoadingMask
