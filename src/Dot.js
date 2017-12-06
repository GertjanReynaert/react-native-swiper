// @flow
import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3
  }
});

type Props = {
  active: boolean
};

export default class Dot extends Component<Props> {
  render() {
    const { active } = this.props;

    return (
      <View
        style={[
          styles.dot,
          { backgroundColor: active ? '#007aff' : 'rgba(0,0,0,.2)' }
        ]}
      />
    );
  }
}
