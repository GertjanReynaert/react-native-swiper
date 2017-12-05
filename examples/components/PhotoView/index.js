// @flow
import React, { Component } from "react";
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  StyleSheet
} from "react-native";
import Swiper from "react-native-swiper";
import PhotoView from "react-native-photo-view";

const { width, height } = Dimensions.get("window");

var styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#000",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  paginationWrapper: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    top: 25,
    left: 0,
    right: 0
  },
  paginationTextContainer: {
    borderRadius: 7,
    backgroundColor: "rgba(255,255,255,.15)",
    padding: 3,
    paddingHorizontal: 7
  },
  paginationText: {
    color: "#fff",
    fontSize: 14
  },
  photo: {
    width,
    height,
    flex: 1
  },
  text: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold"
  },
  thumbWrap: {
    marginTop: 100,
    borderWidth: 5,
    borderColor: "#000",
    flexDirection: "row"
  },
  thumb: {
    width: 50,
    height: 50
  }
});

const renderPagination = (index, total) => {
  return (
    <View style={styles.paginationWrapper}>
      <View style={styles.paginationTextContainer}>
        <Text style={styles.paginationText}>
          {index + 1} / {total}
        </Text>
      </View>
    </View>
  );
};

const Viewer = (props: { index: number, imgList: Array<string> }) => (
  <Swiper
    index={props.index}
    style={styles.wrapper}
    renderPagination={renderPagination}
  >
    {props.imgList.map((item, i) => (
      <View key={i} style={styles.slide}>
        <TouchableWithoutFeedback onPress={() => props.pressHandle()}>
          <PhotoView
            source={{ uri: item }}
            resizeMode="contain"
            minimumZoomScale={0.5}
            maximumZoomScale={3}
            androidScaleType="center"
            style={styles.photo}
          />
        </TouchableWithoutFeedback>
      </View>
    ))}
  </Swiper>
);

export default class PhotoViewExample extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imgList: [
        "https://avatars3.githubusercontent.com/u/533360?v=3&s=466",
        "https://assets-cdn.github.com/images/modules/site/business-hero.jpg",
        "https://placeholdit.imgix.net/~text?txtsize=29&txt=350%C3%971150&w=350&h=1150"
      ],
      showViewer: true,
      showIndex: 0
    };
  }

  viewerPressHandle = () => {
    this.setState({
      showViewer: false
    });
  };

  thumbPressHandle = i => {
    this.setState({
      showIndex: i,
      showViewer: true
    });
  };

  render() {
    return (
      <View style={{ position: "relative" }}>
        {this.state.showViewer ? (
          <Viewer
            index={this.state.showIndex}
            pressHandle={this.viewerPressHandle}
            imgList={this.state.imgList}
          />
        ) : null}

        <View style={styles.thumbWrap}>
          {this.state.imgList.map((item, i) => (
            <TouchableOpacity key={i} onPress={() => this.thumbPressHandle(i)}>
              <Image style={styles.thumb} source={{ uri: item }} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }
}
