// @flow
import React, { Component, Children } from 'react';
import {
  View,
  ScrollView,
  Dimensions,
  ViewPagerAndroid,
  Platform,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import type { Event } from 'react-native';
import type { StyleObj } from 'react-native/Libraries/StyleSheet/StyleSheetTypes';
import DefaultDot from './Dot';
import DefaultButton from './Button';

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    position: 'relative',
    flex: 1
  },

  wrapperIOS: {
    backgroundColor: 'transparent'
  },

  wrapperAndroid: {
    backgroundColor: 'transparent',
    flex: 1
  },

  slide: {
    backgroundColor: 'transparent'
  },

  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  pagination: {
    position: 'absolute',
    bottom: 25,
    left: 0,
    right: 0,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent'
  },

  title: {
    height: 30,
    justifyContent: 'center',
    position: 'absolute',
    paddingLeft: 10,
    bottom: -30,
    left: 0,
    flexWrap: 'nowrap',
    width: 250,
    backgroundColor: 'transparent'
  },

  buttonWrapper: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    position: 'absolute',
    top: 0,
    left: 0,
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    justifyContent: 'space-between',
    alignItems: 'center'
  }
});

type Props = {
  children?: any, // Slides
  containerStyle?: StyleObj,
  contentContainerStyle?: StyleObj,
  scrollViewStyle?: StyleObj,
  width?: number,
  height?: number,

  // Index props
  index: number,
  // Called when the index has changed because the user swiped.
  onIndexChanged: (index: number) => void,

  // Loop props
  loop: boolean,

  // AutoPlay props
  autoplay: boolean,
  autoplayTimeout: number,
  autoplayDirection: boolean,

  // Load minimal props
  loadMinimal: boolean,
  loadMinimalSize: number,
  loadMinimalLoader?: any, // element

  // Pagination
  showsPagination: boolean,
  renderPagination?: (
    index: number,
    total: number,
    instance: Object
  ) => React$Element<any>,
  paginationStyle?: StyleObj,
  renderDot?: ({ active: boolean }) => React$Element<any>,

  // Buttons
  showsButtons: boolean,
  buttonWrapperStyle?: StyleObj,
  renderNextButton?: ({ onPress: () => void }) => React$Element<any>,
  renderPreviousButton?: ({ onPress: () => void }) => React$Element<any>,

  // Event handlers
  onScrollBeginDrag?: (event: Event) => void,
  onMomentumScrollEnd?: (event: Event) => void
};

type State = {
  index: number,
  offset: number,
  width: number,
  height: number,
  isScrolling: boolean,
  autoplayEnd: boolean
};

export default class ReactNativeSwiper extends Component<Props, State> {
  static defaultProps = {
    showsPagination: true,
    showsButtons: false,
    disableNextButton: false,
    loop: true,
    loadMinimal: false,
    loadMinimalSize: 1,
    autoplay: false,
    autoplayTimeout: 2.5,
    autoplayDirection: true,
    index: 0,
    onIndexChanged: () => {}
  };

  initialRender: boolean;
  initialRender = true;

  autoplayTimer: ?number;
  autoplayTimer = null;

  loopJumpTimer: ?number;
  loopJumpTimer = null;

  scrollView: ?React$ElementRef<ScrollView | ViewPagerAndroid>;

  constructor(props: Props) {
    super(props);

    const { width, height } = Dimensions.get('window');
    const total = this.getTotalSlides(props);

    this.state = {
      autoplayEnd: false,
      offset: width * this.props.index,
      index: total > 1 ? Math.min(this.props.index, total - 1) : 0,
      width: this.props.width || width,
      height: this.props.height || height,
      isScrolling: false
    };
  }

  componentWillReceiveProps(nextProps: Props) {
    if (!nextProps.autoplay && this.autoplayTimer) {
      clearTimeout(this.autoplayTimer);
    }

    this.setState(oldState => this.syncStateWithProps(nextProps, oldState));
  }

  syncStateWithProps(props: Props, oldState: State) {
    const { width, height } = Dimensions.get('window');
    // set the current state

    const indexChanged = this.props.index !== props.index;
    const amountOfSlidesChanged =
      this.getTotalSlides(this.props) !== this.getTotalSlides(props);

    const total = this.getTotalSlides(props);

    return {
      autoplayEnd: false,
      offset: width * props.index,
      index:
        indexChanged || amountOfSlidesChanged || oldState.index === undefined
          ? total > 1 ? Math.min(props.index, total - 1) : 0
          : oldState.index,
      width: props.width || oldState.width || width,
      height: props.height || oldState.height || height,
      isScrolling: false
    };
  }

  componentDidMount() {
    this.autoplay();
  }

  componentWillUnmount() {
    this.autoplayTimer && clearTimeout(this.autoplayTimer);
    this.loopJumpTimer && clearTimeout(this.loopJumpTimer);
  }

  componentWillUpdate(nextProps: Props, nextState: State) {
    // If the index has changed, we notify the parent via the onIndexChanged callback
    if (this.state.index !== nextState.index)
      this.props.onIndexChanged(nextState.index);
  }

  getTotalSlides(props: Props) {
    return props.children ? Children.toArray(props.children).length : 0;
  }

  onLayout = (event: Event) => {
    const { width, height } = event.nativeEvent.layout;
    const newState = { width, height };
    const total = this.getTotalSlides(this.props);

    const setup = this.props.loop ? this.state.index + 1 : this.state.index;

    const offset =
      total > 1 && (width !== this.state.width || height !== this.state.height)
        ? setup * width
        : this.state.offset;

    // related to https://github.com/leecade/react-native-swiper/issues/570
    // contentOffset is not working in react 0.48.x so we need to use scrollTo
    // to emulate offset.
    if (Platform.OS === 'ios') {
      if (this.initialRender && total > 1) {
        if (this.scrollView) {
          this.scrollView.scrollTo({ x: offset, y: 0, animated: false });
        }
        this.initialRender = false;
      }
    }

    this.setState(newState);
  };

  loopJump = () => {
    if (!this.props.loop) return;
    const i = this.state.index + (this.props.loop ? 1 : 0);

    this.loopJumpTimer = setTimeout(() => {
      if (this.scrollView && this.scrollView.setPageWithoutAnimation) {
        this.scrollView.setPageWithoutAnimation(i);
      }
    }, 50);
  };

  /**
   * Automatic rolling
   */
  autoplay = () => {
    if (!this.props.autoplay) return;
    if (this.state.isScrolling) return;
    if (this.state.autoplayEnd) return;
    if (this.getTotalSlides(this.props) <= 1) return;

    if (this.autoPlayTimer) {
      clearTimeout(this.autoplayTimer);
    }

    this.autoplayTimer = setTimeout(
      this.autoPlayTick,
      this.props.autoplayTimeout * 1000
    );
  };

  autoPlayTick = () => {
    const { loop, autoplayDirection } = this.props;

    const maxIndex = autoplayDirection
      ? this.getTotalSlides(this.props) - 1
      : 0;

    if (!loop && this.state.index === maxIndex) {
      this.setState({ autoplayEnd: true });
    } else {
      this.scrollBy(autoplayDirection ? 1 : -1);
    }
  };

  onScrollBegin = (e: Event) => {
    this.setState({ isScrolling: true });

    if (this.props.onScrollBeginDrag) {
      this.props.onScrollBeginDrag(e);
    }
  };

  onScrollEnd = (e: Event) => {
    // update scroll state
    this.setState({ isScrolling: false });

    const { contentOffset, position } = e.nativeEvent;
    const { width, height } = this.state;

    // making our events coming from android compatible to updateIndex logic
    const offset = contentOffset.x || position * width;

    this.updateIndex(offset, () => {
      this.autoplay();
      this.loopJump();

      if (this.props.onMomentumScrollEnd) {
        this.props.onMomentumScrollEnd(e);
      }
    });
  };

  /*
   * Drag end handle
   * @param {object} e native event
   */
  onScrollEndDrag = (e: Event) => {
    const { contentOffset } = e.nativeEvent;
    const { index, offset } = this.state;
    const previousOffset = offset;
    const newOffset = contentOffset;

    if (
      previousOffset === newOffset &&
      (index === 0 || index === this.getTotalSlides(this.props) - 1)
    ) {
      this.setState({ isScrolling: false });
    }
  };

  updateIndex = (offset: number, cb: () => void) => {
    let { index } = this.state;
    const diff = offset - this.state.offset;
    const total = this.getTotalSlides(this.props);

    // Do nothing if offset no change.
    if (diff === 0) return;

    const step = this.state.width;

    // Note: if touch very very quickly and continuous,
    // the variation of `index` more than 1.
    // parseInt() ensures it's always an integer
    index = parseInt(index + Math.round(diff / step));

    if (this.props.loop) {
      if (index <= -1) {
        index = total - 1;
        offset = step * total;
      } else if (index >= total) {
        index = 0;
        offset = step;
      }
    }

    const newState = {
      index,
      offset
    };

    // only update offset in state if this.props.loop is true
    if (this.props.loop) {
      // when swiping to the beginning of a looping set for the third time,
      // the new offset will be the same as the last one set in state.
      // Setting the offset to the same thing will not do anything,
      // so we increment it by 1 then immediately set it to what it should be,
      // after render.
      if (offset === this.state.offset) {
        newState.offset = offset + 1;

        this.setState(newState, () => {
          this.setState({ offset }, cb);
        });
      }
    } else {
      this.setState(newState, cb);
    }
  };

  scrollBy = (diffFromIndex: number, animated: boolean = true) => {
    if (this.state.isScrolling || this.getTotalSlides(this.props) < 2) return;

    const { scrollView } = this;
    const { width, height } = this.state;
    const diff = (this.props.loop ? 1 : 0) + diffFromIndex + this.state.index;

    const x = diff * width;
    const y = 0;

    if (scrollView) {
      if (Platform.OS === 'ios') {
        scrollView.scrollTo({ x, y, animated });
      } else if (animated) {
        scrollView.setPage(diff);
      } else {
        scrollView.setPageWithoutAnimation(diff);
      }
    }

    this.setState({
      isScrolling: true,
      autoplayEnd: false
    });

    // trigger onScrollEnd manually in android
    if (!animated || Platform.OS !== 'ios') {
      setImmediate(() => {
        this.onScrollEnd({
          nativeEvent: {
            position: diff
          }
        });
      });
    }
  };

  // Ok
  renderPagination = () => {
    if (!this.props.showsPagination) {
      return null;
    }

    const total = this.getTotalSlides(this.props);
    if (this.props.renderPagination) {
      return this.props.renderPagination(this.state.index, total, this);
    }

    // By default, dots only show when `total` >= 2
    if (total <= 1) {
      return null;
    }

    const Dot = this.props.renderDot || DefaultDot;

    const arrayWithLength = length => Array.from({ length }, (v, i) => i);

    return (
      <View
        pointerEvents="none"
        style={[styles.pagination, this.props.paginationStyle]}
      >
        {arrayWithLength(total).map(index => (
          <Dot key={index} active={index === this.state.index} />
        ))}
      </View>
    );
  };

  // Ok
  renderTitle = () => {
    const child = Children.toArray(this.props.children)[this.state.index];
    const title = child && child.props && child.props.title;

    return title ? <View style={styles.title}>{title}</View> : null;
  };

  // Ok
  renderPreviousButton = () => {
    if (this.state.index === 0 && this.props.loop) {
      return null;
    }

    const DefaultPreviousButton = ({ onPress }) => (
      <DefaultButton onPress={onPress} text="<" />
    );

    const Button = this.props.renderPreviousButton || DefaultPreviousButton;

    return <Button onPress={() => this.scrollBy(-1)} />;
  };

  // Ok
  renderNextButton = () => {
    if (
      this.state.index === this.getTotalSlides(this.props) - 1 &&
      this.props.loop === false
    ) {
      return null;
    }

    const DefaultNextButton = ({ onPress }) => (
      <DefaultButton onPress={onPress} text=">" />
    );

    const Button = this.props.renderNextButton || DefaultNextButton;

    return <Button onPress={() => this.scrollBy(1)} />;
  };

  // Ok
  renderButtons = () => {
    if (!this.props.showsButtons) {
      return null;
    }

    return (
      <View
        pointerEvents="box-none"
        style={[
          styles.buttonWrapper,
          {
            width: this.state.width,
            height: this.state.height
          },
          this.props.buttonWrapperStyle
        ]}
      >
        {this.renderPreviousButton()}
        {this.renderNextButton()}
      </View>
    );
  };

  // Ok
  setScrollViewRef = (
    scrollView: ?React$ElementRef<ScrollView | ViewPagerAndroid>
  ) => {
    this.scrollView = scrollView;
  };

  getPagesToRender = () => {
    const { index, width, height } = this.state;
    const {
      children,
      loop,
      loadMinimal,
      loadMinimalSize,
      loadMinimalLoader
    } = this.props;
    const total = this.getTotalSlides(this.props);

    const pageStyle = [{ width, height }, styles.slide];
    const pageStyleLoading = [{ width, height }, styles.loading];

    // For make infinite at least total > 1
    if (total <= 1) {
      return (
        <View style={pageStyle} key={0}>
          {children}
        </View>
      );
    }

    const childArray = Children.toArray(children);
    // Re-design a loop model for avoid img flickering
    const pages = loop
      ? [childArray[0], ...childArray, childArray[total - 1]]
      : childArray;

    const loopVal = loop ? 1 : 0;
    const indexInMinimalRange = i =>
      i >= index + loopVal - loadMinimalSize &&
      i <= index + loopVal + loadMinimalSize;

    if (loadMinimal) {
      return pages.map(
        (page, i) =>
          indexInMinimalRange(i) ? (
            <View style={pageStyle} key={i}>
              {page}
            </View>
          ) : (
            <View style={pageStyleLoading} key={i}>
              {loadMinimalLoader || <ActivityIndicator />}
            </View>
          )
      );
    }

    return pages.map((page, i) => (
      <View style={pageStyle} key={i}>
        {page}
      </View>
    ));
  };

  renderScrollView = (pages: any) => {
    if (Platform.OS === 'ios') {
      return (
        <ScrollView
          ref={this.setScrollViewRef}
          {...this.props}
          contentContainerStyle={[
            styles.wrapperIOS,
            this.props.contentContainerStyle
          ]}
          contentOffset={{ x: this.state.offset, y: 0 }}
          onScrollBeginDrag={this.onScrollBegin}
          onMomentumScrollEnd={this.onScrollEnd}
          onScrollEndDrag={this.onScrollEndDrag}
          style={this.props.scrollViewStyle}
        >
          {pages}
        </ScrollView>
      );
    }

    return (
      <ViewPagerAndroid
        ref={this.setScrollViewRef}
        {...this.props}
        initialPage={this.props.loop ? this.state.index + 1 : this.state.index}
        onPageSelected={this.onScrollEnd}
        key={pages.length}
        style={[styles.wrapperAndroid, this.props.contentContainerStyle]}
      >
        {pages}
      </ViewPagerAndroid>
    );
  };

  render() {
    const pages = this.getPagesToRender();

    return (
      <View
        style={[styles.container, this.props.containerStyle]}
        onLayout={this.onLayout}
      >
        {this.renderScrollView(pages)}

        {this.renderTitle()}
        {this.renderPagination()}
        {this.renderButtons()}
      </View>
    );
  }
}
