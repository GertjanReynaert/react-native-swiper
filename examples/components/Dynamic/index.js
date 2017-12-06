// @flow
import React, { Component } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import type { StyleObj } from 'react-native/Libraries/StyleSheet/StyleSheetTypes';
import Swiper from 'react-native-swiper';

const styles = StyleSheet.create({
  slide1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9DD6EB'
  },

  slide2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#97CAE5'
  },

  slide3: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#92BBD9'
  },

  text: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold'
  }
});

type Props = {};
type State = {
  items: Array<{ title: string, css: StyleObj }>
};

export default class Dynamic extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      items: []
    };
  }

  componentDidMount() {
    this.setState({
      items: [
        { title: 'Hello Swiper', css: styles.slide1 },
        { title: 'Beautiful', css: styles.slide2 },
        { title: 'And simple', css: styles.slide3 }
      ]
    });
  }

  render() {
    return (
      <Swiper showsButtons>
        {this.state.items.map((item, key) => (
          <View key={key} style={item.css}>
            <Text style={styles.text}>{item.title}</Text>
          </View>
        ))}
      </Swiper>
    );
  }
}
