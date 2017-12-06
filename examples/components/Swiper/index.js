// @flow
import React, { Component } from 'react';
import { Text, View, Image, Dimensions, StyleSheet } from 'react-native';
import Swiper from 'react-native-swiper';

import image1 from './img/1.jpg';
import image2 from './img/2.jpg';
import image3 from './img/3.jpg';
import image4 from './img/4.jpg';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1
  },

  imageSlide: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'transparent'
  },

  dot: {
    backgroundColor: 'rgba(0,0,0,.2)',
    width: 5,
    height: 5,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3
  },

  activeDot: {
    backgroundColor: '#000',
    width: 8,
    height: 8
  },

  paginationStyle: {
    bottom: -23,
    left: null,
    right: 10
  },

  textSlide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  slide1: {
    backgroundColor: '#9DD6EB'
  },
  slide2: {
    backgroundColor: '#97CAE5'
  },
  slide3: {
    backgroundColor: '#92BBD9'
  },

  text: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold'
  },

  image: {
    width,
    flex: 1
  }
});

type Props = {};

export default class SwiperDemo extends Component<Props> {
  render() {
    return (
      <View style={styles.container}>
        <Swiper height={200} horizontal={false} autoplay>
          <View style={[styles.textSlide, styles.slide1]}>
            <Text style={styles.text}>Hello Swiper</Text>
          </View>

          <View style={[styles.textSlide, styles.slide2]}>
            <Text style={styles.text}>Beautiful</Text>
          </View>

          <View style={[styles.textSlide, styles.slide3]}>
            <Text style={styles.text}>And simple</Text>
          </View>
        </Swiper>

        <Swiper
          height={240}
          onMomentumScrollEnd={(e, state, context) =>
            console.log('index:', state.index)
          }
          dot={<View style={styles.dot} />}
          activeDot={<View style={[styles.dot, styles.activeDot]} />}
          paginationStyle={styles.paginationStyle}
          loop
        >
          <View style={styles.imageSlide}>
            <Text numberOfLines={1}>Aussie tourist dies at Bali hotel</Text>
            <Image resizeMode="stretch" style={styles.image} source={image1} />
          </View>

          <View style={styles.imageSlide}>
            <Text numberOfLines={1}>Big lie behind Nine’s new show</Text>
            <Image resizeMode="stretch" style={styles.image} source={image2} />
          </View>

          <View style={styles.imageSlide}>
            <Text numberOfLines={1}>Why Stone split from Garfield</Text>
            <Image resizeMode="stretch" style={styles.image} source={image3} />
          </View>

          <View style={styles.imageSlide}>
            <Text numberOfLines={1}>Learn from Kim K to land that job</Text>
            <Image resizeMode="stretch" style={styles.image} source={image4} />
          </View>
        </Swiper>
      </View>
    );
  }
}
