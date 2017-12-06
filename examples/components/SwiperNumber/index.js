// @flow
import React, { Component } from 'react';
import { Text, View, Image, Dimensions, StyleSheet } from 'react-native';
import Swiper from 'react-native-swiper';
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'transparent'
  },
  text: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold'
  },
  image: {
    width,
    flex: 1
  },
  paginationStyle: {
    position: 'absolute',
    bottom: 10,
    right: 10
  },
  paginationText: {
    color: 'white',
    fontSize: 20
  }
});

const renderPagination = (index, total, context) => {
  return (
    <View style={styles.paginationStyle}>
      <Text style={{ color: 'grey' }}>
        <Text style={styles.paginationText}>{index + 1}</Text>/{total}
      </Text>
    </View>
  );
};

type Props = {};

export default class SwiperNumber extends Component<Props> {
  render() {
    return (
      <Swiper renderPagination={renderPagination} loop={false}>
        <View style={styles.slide}>
          <Text numberOfLines={1}>Aussie tourist dies at Bali hotel</Text>
          <Image style={styles.image} source={require('./img/1.jpg')} />
        </View>

        <View style={styles.slide}>
          <Text numberOfLines={1}>Big lie behind Nine’s new show</Text>
          <Image style={styles.image} source={require('./img/2.jpg')} />
        </View>

        <View style={styles.slide}>
          <Text numberOfLines={1}>Why Stone split from Garfield</Text>
          <Image style={styles.image} source={require('./img/3.jpg')} />
        </View>

        <View style={styles.slide}>
          <Text numberOfLines={1}>Learn from Kim K to land that job</Text>
          <Image style={styles.image} source={require('./img/4.jpg')} />
        </View>
      </Swiper>
    );
  }
}
