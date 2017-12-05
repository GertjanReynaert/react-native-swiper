import React, { Component } from "react";
import { Text, View, StyleSheet } from "react-native";
import Swiper from "react-native-swiper";

var styles = StyleSheet.create({
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  slide1: {
    backgroundColor: "#9DD6EB"
  },
  slide2: {
    backgroundColor: "#97CAE5"
  },
  slide3: {
    backgroundColor: "#92BBD9"
  },
  text: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold"
  }
});

export default class Basic extends Component {
  render() {
    return (
      <Swiper showsButtons>
        <View style={[styles.slide, styles.slide1]}>
          <Text style={styles.text}>Hello Swiper</Text>
        </View>

        <View style={[styles.slide, styles.slide2]}>
          <Text style={styles.text}>Beautiful</Text>
        </View>

        <View style={[styles.slide, styles.slide3]}>
          <Text style={styles.text}>And simple</Text>
        </View>
      </Swiper>
    );
  }
}
