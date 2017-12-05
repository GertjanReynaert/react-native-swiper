// @flow
import React, { Component } from "react";
import { View, Image, StatusBar, Dimensions, StyleSheet } from "react-native";
import Swiper from "react-native-swiper";
import backgroundImage from "./img/bg.jpg";
import image1 from "./img/1.jpg";
import image2 from "./img/2.jpg";
import image3 from "./img/3.jpg";

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  wrapper: {},

  slide: {
    flex: 1,
    backgroundColor: "transparent"
  },
  container: {
    flex: 1
  },

  backgroundImage: {
    position: "absolute",
    width,
    height,
    backgroundColor: "transparent"
  },

  dot: {
    backgroundColor: "rgba(255,255,255,.3)",
    width: 13,
    height: 13,
    borderRadius: 7,
    marginLeft: 7,
    marginRight: 7
  },

  activeDot: {
    backgroundColor: "#fff"
  },

  pagination: {
    bottom: 70
  },

  image: {
    width,
    height
  }
});

type Props = {};

export default class Phone extends Component<Props> {
  render() {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />

        <Image source={backgroundImage} style={styles.backgroundImage} />

        <Swiper
          style={styles.wrapper}
          dot={<View style={styles.dot} />}
          activeDot={<View style={[styles.dot, styles.activeDot]} />}
          paginationStyle={styles.pagination}
          loop={false}
        >
          <View style={styles.slide}>
            <Image style={styles.image} source={image1} resizeMode="cover" />
          </View>

          <View style={styles.slide}>
            <Image style={styles.image} source={image2} resizeMode="cover" />
          </View>

          <View style={styles.slide}>
            <Image style={styles.image} source={image3} />
          </View>
        </Swiper>
      </View>
    );
  }
}
