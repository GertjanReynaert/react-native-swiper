// @flow
import React, { Component, Children } from 'react'
import {
  View,
  ScrollView,
  Dimensions,
  ViewPagerAndroid,
  Platform,
  ActivityIndicator,
  StyleSheet
} from 'react-native'
import type { Event } from 'react-native'
import type { StyleObj } from 'react-native/Libraries/StyleSheet/StyleSheetTypes'
import DefaultDot from './Dot'
import DefaultButton from './Button'

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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent'
  },

  pagination_x: {
    bottom: 25,
    left: 0,
    right: 0,
    flexDirection: 'row'
  },

  pagination_y: {
    right: 15,
    top: 0,
    bottom: 0,
    flexDirection: 'column'
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
})

type State = {
  autoplayEnd: boolean,
  offset: Object,
  index: number,
  dir: 'x' | 'y',
  width: number,
  height: number,
  isScrolling: boolean
}

type Props = {
  horizontal: boolean,

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
  onScrollBeginDrag?: (event: Event, state: State, swiper: any) => void,
  onMomentumScrollEnd?: (event: Event, state: State, swiper: any) => void
}

export default class ReactNativeSwiper extends Component<Props, State> {
  static defaultProps = {
    horizontal: true,
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
  }

  state = this.getInitialState(this.props)

  initialRender: boolean
  initialRender = true

  autoplayTimer: ?number
  autoplayTimer = null

  loopJumpTimer: ?number
  loopJumpTimer = null

  scrollView: ?React$ElementRef<ScrollView | ViewPagerAndroid>

  componentWillReceiveProps(nextProps: Props) {
    if (!nextProps.autoplay && this.autoplayTimer) {
      clearTimeout(this.autoplayTimer)
    }

    const shouldUpdateIndex =
      this.props.index !== nextProps.index ||
      this.getTotalSlides(this.props) !== this.getTotalSlides(nextProps)

    this.setState(this.getInitialState(nextProps, shouldUpdateIndex))
  }

  componentDidMount() {
    this.autoplay()
  }

  componentWillUnmount() {
    this.autoplayTimer && clearTimeout(this.autoplayTimer)
    this.loopJumpTimer && clearTimeout(this.loopJumpTimer)
  }

  componentWillUpdate(nextProps: Props, nextState: State) {
    // If the index has changed, we notify the parent via the onIndexChanged callback
    if (this.state.index !== nextState.index)
      this.props.onIndexChanged(nextState.index)
  }

  // Ok
  getInitialState(props: Props, updateIndex: boolean = false) {
    const { width, height } = Dimensions.get('window')
    // set the current state
    const state = {
      width: 0,
      height: 0,
      offset: { x: 0, y: 0 },
      ...(this.state || {})
    }

    const total = this.getTotalSlides(props)

    // Default horizontal
    const dir = props.horizontal === false ? 'y' : 'x'

    return {
      autoplayEnd: false,
      offset: {
        x: dir === 'x' ? width * props.index : 0,
        y: dir === 'y' ? height * props.index : 0
      },
      index:
        !updateIndex && state.index !== undefined
          ? state.index
          : total > 1 ? Math.min(props.index, total - 1) : 0,
      dir,
      width: props.width
        ? props.width
        : this.state && this.state.width ? this.state.width : width,
      height: props.height
        ? props.height
        : this.state && this.state.height ? this.state.height : height,
      isScrolling: false
    }
  }

  getTotalSlides(props: Props) {
    return props.children ? Children.toArray(props.children).length : 0
  }

  onLayout = (event: Event) => {
    const { width, height } = event.nativeEvent.layout
    const { offset } = this.state
    const newState = { width, height }
    const total = this.getTotalSlides(this.props)

    if (total > 1) {
      const setup = this.props.loop ? this.state.index + 1 : this.state.index

      offset[this.state.dir] = setup * (this.state.dir === 'x' ? width : height)
    }

    // only update the offset in state if needed, updating offset while swiping
    // causes some bad jumping / stuttering
    if (
      !this.state.offset ||
      width !== this.state.width ||
      height !== this.state.height
    ) {
      newState.offset = offset
    }

    // related to https://github.com/leecade/react-native-swiper/issues/570
    // contentOffset is not working in react 0.48.x so we need to use scrollTo
    // to emulate offset.
    if (Platform.OS === 'ios') {
      if (this.initialRender && total > 1) {
        if (this.scrollView) {
          this.scrollView.scrollTo({ ...offset, animated: false })
        }
        this.initialRender = false
      }
    }

    this.setState(newState)
  }

  loopJump = () => {
    if (!this.props.loop) return
    const i = this.state.index + (this.props.loop ? 1 : 0)

    this.loopJumpTimer = setTimeout(() => {
      if (this.scrollView && this.scrollView.setPageWithoutAnimation) {
        this.scrollView.setPageWithoutAnimation(i)
      }
    }, 50)
  }

  /**
   * Automatic rolling
   */
  autoplay = () => {
    if (!this.props.autoplay) return
    if (this.state.isScrolling) return
    if (this.state.autoplayEnd) return
    if (this.getTotalSlides(this.props) <= 1) return

    if (this.autoPlayTimer) {
      clearTimeout(this.autoplayTimer)
    }

    this.autoplayTimer = setTimeout(
      this.autoPlayTick,
      this.props.autoplayTimeout * 1000
    )
  }

  autoPlayTick = () => {
    const { loop, autoplayDirection } = this.props

    const maxIndex = autoplayDirection ? this.getTotalSlides(this.props) - 1 : 0

    if (!loop && this.state.index === maxIndex) {
      this.setState({ autoplayEnd: true })
    } else {
      this.scrollBy(autoplayDirection ? 1 : -1)
    }
  }

  onScrollBegin = (e: Event) => {
    this.setState({ isScrolling: true })

    if (this.props.onScrollBeginDrag) {
      this.props.onScrollBeginDrag(e, this.state, this)
    }
  }

  onScrollEnd = (e: Event) => {
    // update scroll state
    this.setState({ isScrolling: false })

    const { contentOffset, position } = e.nativeEvent
    const { dir, width, height } = this.state

    // making our events coming from android compatible to updateIndex logic
    const offset =
      contentOffset || dir === 'x'
        ? { x: position * width }
        : { y: position * height }

    this.updateIndex(offset, () => {
      this.autoplay()
      this.loopJump()

      if (this.props.onMomentumScrollEnd) {
        this.props.onMomentumScrollEnd(e, this.state, this)
      }
    })
  }

  /*
   * Drag end handle
   * @param {object} e native event
   */
  onScrollEndDrag = (e: Event) => {
    const { contentOffset } = e.nativeEvent
    const { horizontal } = this.props
    const { index, offset } = this.state
    const previousOffset = horizontal ? offset.x : offset.y
    const newOffset = horizontal ? contentOffset.x : contentOffset.y

    if (
      previousOffset === newOffset &&
      (index === 0 || index === this.getTotalSlides(this.props) - 1)
    ) {
      this.setState({ isScrolling: false })
    }
  }

  updateIndex = (offset: Object, cb: () => void) => {
    const { dir } = this.state
    let { index } = this.state
    const diff = offset[dir] - this.state.offset[dir]
    const total = this.getTotalSlides(this.props)

    // Do nothing if offset no change.
    if (diff === 0) return

    const step = dir === 'x' ? this.state.width : this.state.height

    // Note: if touch very very quickly and continuous,
    // the variation of `index` more than 1.
    // parseInt() ensures it's always an integer
    index = parseInt(index + Math.round(diff / step))

    if (this.props.loop) {
      if (index <= -1) {
        index = total - 1
        offset[dir] = step * total
      } else if (index >= total) {
        index = 0
        offset[dir] = step
      }
    }

    const newState = {
      index,
      offset
    }

    // only update offset in state if this.props.loop is true
    if (this.props.loop) {
      // when swiping to the beginning of a looping set for the third time,
      // the new offset will be the same as the last one set in state.
      // Setting the offset to the same thing will not do anything,
      // so we increment it by 1 then immediately set it to what it should be,
      // after render.
      if (offset[dir] === this.state.offset[dir]) {
        newState.offset = { x: 0, y: 0 }
        newState.offset[dir] = offset[dir] + 1
        this.setState(newState, () => {
          this.setState({ offset }, cb)
        })
      }
    } else {
      this.setState(newState, cb)
    }
  }

  scrollBy = (diffFromIndex: number, animated: boolean = true) => {
    if (this.state.isScrolling || this.getTotalSlides(this.props) < 2) return

    const { scrollView } = this
    const { dir, width, height } = this.state
    const diff = (this.props.loop ? 1 : 0) + diffFromIndex + this.state.index

    const x = dir === 'x' ? diff * width : 0
    const y = dir === 'y' ? diff * height : 0

    if (scrollView) {
      if (Platform.OS === 'ios') {
        scrollView.scrollTo({ x, y, animated })
      } else if (animated) {
        scrollView.setPage(diff)
      } else {
        scrollView.setPageWithoutAnimation(diff)
      }
    }

    this.setState({
      isScrolling: true,
      autoplayEnd: false
    })

    // trigger onScrollEnd manually in android
    if (!animated || Platform.OS !== 'ios') {
      setImmediate(() => {
        this.onScrollEnd({
          nativeEvent: {
            position: diff
          }
        })
      })
    }
  }

  // Ok
  renderPagination = () => {
    if (!this.props.showsPagination) {
      return null
    }

    const total = this.getTotalSlides(this.props)
    if (this.props.renderPagination) {
      return this.props.renderPagination(this.state.index, total, this)
    }

    // By default, dots only show when `total` >= 2
    if (total <= 1) {
      return null
    }

    const Dot = this.props.renderDot || DefaultDot

    const arrayWithLength = length => Array.from({ length }, (v, i) => i)

    return (
      <View
        pointerEvents="none"
        style={[
          styles.pagination,
          this.state.dir === 'x' ? styles.pagination_x : styles.pagination_y,
          this.props.paginationStyle
        ]}
      >
        {arrayWithLength(total).map(index => (
          <Dot key={index} active={index === this.state.index} />
        ))}
      </View>
    )
  }

  // Ok
  renderTitle = () => {
    const child = Children.toArray(this.props.children)[this.state.index]
    const title = child && child.props && child.props.title

    return title ? <View style={styles.title}>{title}</View> : null
  }

  // Ok
  renderPreviousButton = () => {
    if (this.state.index === 0 && this.props.loop) {
      return null
    }

    const DefaultPreviousButton = ({ onPress }) => (
      <DefaultButton onPress={onPress} text="<" />
    )

    const Button = this.props.renderPreviousButton || DefaultPreviousButton

    return <Button onPress={() => this.scrollBy(-1)} />
  }

  // Ok
  renderNextButton = () => {
    if (
      this.state.index === this.getTotalSlides(this.props) - 1 &&
      this.props.loop === false
    ) {
      return null
    }

    const DefaultNextButton = ({ onPress }) => (
      <DefaultButton onPress={onPress} text=">" />
    )

    const Button = this.props.renderNextButton || DefaultNextButton

    return <Button onPress={() => this.scrollBy(1)} />
  }

  // Ok
  renderButtons = () => {
    if (!this.props.showsButtons) {
      return null
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
    )
  }

  // Ok
  setScrollViewRef = (
    scrollView: ?React$ElementRef<ScrollView | ViewPagerAndroid>
  ) => {
    this.scrollView = scrollView
  }

  getPagesToRender = () => {
    const { index, width, height } = this.state
    const {
      children,
      loop,
      loadMinimal,
      loadMinimalSize,
      loadMinimalLoader
    } = this.props
    const total = this.getTotalSlides(this.props)

    const pageStyle = [{ width, height }, styles.slide]
    const pageStyleLoading = [{ width, height }, styles.loading]

    // For make infinite at least total > 1
    if (total <= 1) {
      return (
        <View style={pageStyle} key={0}>
          {children}
        </View>
      )
    }

    const childArray = Children.toArray(children)
    // Re-design a loop model for avoid img flickering
    const pages = loop
      ? [childArray[0], ...childArray, childArray[total - 1]]
      : childArray

    const loopVal = loop ? 1 : 0
    const indexInMinimalRange = i =>
      i >= index + loopVal - loadMinimalSize &&
      i <= index + loopVal + loadMinimalSize

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
      )
    }

    return pages.map((page, i) => (
      <View style={pageStyle} key={i}>
        {page}
      </View>
    ))
  }

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
          contentOffset={this.state.offset}
          onScrollBeginDrag={this.onScrollBegin}
          onMomentumScrollEnd={this.onScrollEnd}
          onScrollEndDrag={this.onScrollEndDrag}
          style={this.props.scrollViewStyle}
        >
          {pages}
        </ScrollView>
      )
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
    )
  }

  render() {
    const pages = this.getPagesToRender()

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
    )
  }
}
