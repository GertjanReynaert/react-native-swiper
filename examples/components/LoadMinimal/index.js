// @flow
import React, { Component } from 'react';
import { Text, View, Image, Dimensions, StyleSheet } from 'react-native';
import Swiper from 'react-native-swiper';
import loading from './img/loading.gif';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  wrapper: {},

  slide: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'transparent'
  },
  image: {
    width,
    flex: 1,
    backgroundColor: 'transparent'
  },

  loadingView: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,.5)'
  },

  loadingImage: {
    width: 60,
    height: 60
  }
});

type SlideProps = {
  loadHandle: () => void,
  uri: string,
  loaded: boolean
};

class Slide extends Component<SlideProps> {
  render() {
    return (
      <View style={styles.slide}>
        <Image
          onLoad={this.props.loadHandle}
          style={styles.image}
          source={{ uri: this.props.uri }}
        />

        {this.props.loaded ? null : (
          <View style={styles.loadingView}>
            <Image style={styles.loadingImage} source={loading} />
          </View>
        )}
      </View>
    );
  }
}

type Props = {};
type State = {
  imgList: Array<string>,
  loadQueue: Array<boolean>
};

export default class LoadMinimal extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      imgList: [
        'https://gitlab.pro/yuji/demo/uploads/d6133098b53fe1a5f3c5c00cf3c2d670/DVrj5Hz.jpg_1',
        'https://gitlab.pro/yuji/demo/uploads/2d5122a2504e5cbdf01f4fcf85f2594b/Mwb8VWH.jpg',
        'https://gitlab.pro/yuji/demo/uploads/4421f77012d43a0b4e7cfbe1144aac7c/XFVzKhq.jpg',
        'https://gitlab.pro/yuji/demo/uploads/576ef91941b0bda5761dde6914dae9f0/kD3eeHe.jpg'
      ],
      loadQueue: [false, false, false, false]
    };
  }

  loadHandle = (i: number) => {
    let loadQueue = this.state.loadQueue;
    loadQueue[i] = true;
    this.setState({
      loadQueue
    });
  };

  render() {
    return (
      <View style={styles.container}>
        <Swiper
          loadMinimal
          loadMinimalSize={1}
          style={styles.wrapper}
          loop={false}
        >
          {this.state.imgList.map((item, i) => (
            <Slide
              key={i}
              uri={item}
              loaded={this.state.loadQueue[i]}
              loadHandle={() => this.loadHandle(i)}
            />
          ))}
        </Swiper>
        <View>
          <Text>Current Loaded Images: {this.state.loadQueue}</Text>
        </View>
      </View>
    );
  }
}
