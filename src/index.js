// @flow
/**
 * react-native-swiper
 * @author leecade<leecade@163.com>
 */
import React, { Component, Children } from 'react'
import {
  Text,
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ViewPagerAndroid,
  Platform,
  ActivityIndicator,
  StyleSheet
} from 'react-native'
import type { Event } from 'react-native'
import type { StyleObj } from 'react-native/Libraries/StyleSheet/StyleSheetTypes'

/**
 * Default styles
 * @type {StyleSheetPropType}
 */
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

  pagination_x: {
    position: 'absolute',
    bottom: 25,
    left: 0,
    right: 0,
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent'
  },

  pagination_y: {
    position: 'absolute',
    right: 15,
    top: 0,
    bottom: 0,
    flexDirection: 'column',
    flex: 1,
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
  },

  buttonText: {
    fontSize: 50,
    color: '#007aff',
    fontFamily: 'Arial'
  }
})

type Props = {
  horizontal: boolean,
  children?: any,
  containerStyle?: StyleObj,
  style?: StyleObj,
  scrollViewStyle?: StyleObj,
  pagingEnabled: boolean,
  showsHorizontalScrollIndicator: boolean,
  showsVerticalScrollIndicator: boolean,
  bounces: boolean,
  scrollsToTop: boolean,
  removeClippedSubviews: boolean,
  automaticallyAdjustContentInsets: boolean,
  showsPagination: boolean,
  showsButtons: boolean,
  disableNextButton: boolean,
  loadMinimal: boolean,
  loadMinimalSize: number,
  loadMinimalLoader?: any, // element
  loop: boolean,
  autoplay: boolean,
  autoplayTimeout: number,
  autoplayDirection: boolean,
  index: number,
  renderPagination?: () => void,
  dotStyle?: StyleObj,
  activeDotStyle?: StyleObj,
  dotColor?: string,
  activeDotColor?: string,
  /**
   * Called when the index has changed because the user swiped.
   */
  onIndexChanged: (index: number) => void,
  onScrollBeginDrag?: () => void,
  onMomentumScrollEnd?: () => void,
  activeDot?: any, // element
  dot?: any, // element
  paginationStyle?: StyleObj,
  nextButton?: any, // element
  prevButton?: any, // element
  buttonWrapperStyle?: StyleObj
}

type State = {
  autoplayEnd: boolean,
  loopJump: boolean,
  offset: Object,
  total: number,
  index: number,
  dir: 'x' | 'y',
  width: number,
  height: number
}

// missing `module.exports = exports['default'];` with babel6
// export default React.createClass({
export default class ReactNativeSwiper extends Component<Props, State> {
  /**
   * Default props
   * @return {object} props
   * @see http://facebook.github.io/react-native/docs/scrollview.html
   */
  static defaultProps = {
    horizontal: true,
    pagingEnabled: true,
    showsHorizontalScrollIndicator: false,
    showsVerticalScrollIndicator: false,
    bounces: false,
    scrollsToTop: false,
    removeClippedSubviews: true,
    automaticallyAdjustContentInsets: false,
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

  /**
   * Init states
   * @return {object} states
   */
  state = this.getInitialState(this.props)

  initialRender: boolean
  initialRender = true

  autoplayTimer: ?number
  autoplayTimer = null

  loopJumpTimer: ?number
  loopJumpTimer = null

  componentWillReceiveProps(nextProps: Props) {
    if (!nextProps.autoplay && this.autoplayTimer) {
      clearTimeout(this.autoplayTimer)
    }

    this.setState(
      this.getInitialState(nextProps, this.props.index !== nextProps.index)
    )
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

  getInitialState(props: Props, updateIndex: boolean = false) {
    const { width, height } = Dimensions.get('window')
    // set the current state
    const state = this.state || { width: 0, height: 0, offset: { x: 0, y: 0 } }

    const total = props.children ? props.children.length || 1 : 0

    // Default horizontal
    const dir = props.horizontal === false ? 'y' : 'x'

    const initState = {
      autoplayEnd: false,
      loopJump: false,
      offset: {},
      total,
      index:
        state.total === total && !updateIndex
          ? state.index
          : total > 1 ? Math.min(props.index, total - 1) : 0,
      dir,
      width: props.width
        ? props.width
        : this.state && this.state.width ? this.state.width : width,
      height: props.height
        ? props.height
        : this.state && this.state.height ? this.state.height : height
    }

    initState.offset[initState.dir] =
      initState.dir === 'y' ? height * props.index : width * props.index

    this.internals = {
      ...this.internals,
      isScrolling: false
    }

    return initState
  }

  // include internals with state
  fullState() {
    return Object.assign({}, this.state, this.internals)
  }

  onLayout = (event: Event) => {
    const { width, height } = event.nativeEvent.layout
    const offset = (this.internals.offset = {})
    const state = { width, height }

    if (this.state.total > 1) {
      let setup = this.state.index
      if (this.props.loop) {
        setup++
      }
      offset[this.state.dir] =
        this.state.dir === 'y' ? height * setup : width * setup
    }

    // only update the offset in state if needed, updating offset while swiping
    // causes some bad jumping / stuttering
    if (
      !this.state.offset ||
      width !== this.state.width ||
      height !== this.state.height
    ) {
      state.offset = offset
    }

    // related to https://github.com/leecade/react-native-swiper/issues/570
    // contentOffset is not working in react 0.48.x so we need to use scrollTo
    // to emulate offset.
    if (Platform.OS === 'ios') {
      if (this.initialRender && this.state.total > 1) {
        this.scrollView.scrollTo({ ...offset, animated: false })
        this.initialRender = false
      }
    }

    this.setState(state)
  }

  loopJump = () => {
    if (!this.state.loopJump) return
    const i = this.state.index + (this.props.loop ? 1 : 0)

    this.loopJumpTimer = setTimeout(() => {
      if (this.scrollView.setPageWithoutAnimation) {
        this.scrollView.setPageWithoutAnimation(i)
      }
    }, 50)
  }

  /**
   * Automatic rolling
   */
  autoplay = () => {
    if (
      !Array.isArray(this.props.children) ||
      !this.props.autoplay ||
      this.internals.isScrolling ||
      this.state.autoplayEnd
    )
      return

    this.autoplayTimer && clearTimeout(this.autoplayTimer)
    this.autoplayTimer = setTimeout(() => {
      if (
        !this.props.loop &&
        (this.props.autoplayDirection
          ? this.state.index === this.state.total - 1
          : this.state.index === 0)
      )
        return this.setState({ autoplayEnd: true })

      this.scrollBy(this.props.autoplayDirection ? 1 : -1)
    }, this.props.autoplayTimeout * 1000)
  }

  /**
   * Scroll begin handle
   * @param  {object} e native event
   */
  onScrollBegin = (e: Event) => {
    // update scroll state
    this.internals.isScrolling = true

    if (this.props.onScrollBeginDrag) {
      this.props.onScrollBeginDrag(e, this.fullState(), this)
    }
  }

  /**
   * Scroll end handle
   * @param  {object} e native event
   */
  onScrollEnd = (e: Event) => {
    // update scroll state
    this.internals.isScrolling = false

    const { contentOffset, position } = e.nativeEvent
    const { dir, width, height } = this.state

    // making our events coming from android compatible to updateIndex logic
    const offset =
      contentOffset || dir === 'x'
        ? { x: position * width }
        : { y: position * height }

    this.updateIndex(offset, dir, () => {
      this.autoplay()
      this.loopJump()

      if (this.props.onMomentumScrollEnd) {
        this.props.onMomentumScrollEnd(e, this.fullState(), this)
      }
    })
  }

  /*
   * Drag end handle
   * @param {object} e native event
   */
  onScrollEndDrag = (e: Event) => {
    const { contentOffset } = e.nativeEvent
    const { horizontal, children } = this.props
    const { index } = this.state
    const { offset } = this.internals
    const previousOffset = horizontal ? offset.x : offset.y
    const newOffset = horizontal ? contentOffset.x : contentOffset.y

    if (
      previousOffset === newOffset &&
      (index === 0 || index === Children.toArray(children).length - 1)
    ) {
      this.internals.isScrolling = false
    }
  }

  /**
   * Update index after scroll
   * @param  {object} offset content offset
   * @param  {string} dir    'x' || 'y'
   */
  updateIndex = (offset: Object, dir: 'x' | 'y', cb: () => void) => {
    const state = this.state
    let index = state.index
    const diff = offset[dir] - this.internals.offset[dir]
    const step = dir === 'x' ? state.width : state.height

    // Do nothing if offset no change.
    if (!diff) return

    // Note: if touch very very quickly and continuous,
    // the variation of `index` more than 1.
    // parseInt() ensures it's always an integer
    index = parseInt(index + Math.round(diff / step))

    if (this.props.loop) {
      if (index <= -1) {
        index = state.total - 1
        offset[dir] = step * state.total
      } else if (index >= state.total) {
        index = 0
        offset[dir] = step
      }
    }

    const newState = {
      index,
      loopJump: this.props.loop
    }

    this.internals.offset = offset

    // only update offset in state if loopJump is true
    if (this.props.loop) {
      // when swiping to the beginning of a looping set for the third time,
      // the new offset will be the same as the last one set in state.
      // Setting the offset to the same thing will not do anything,
      // so we increment it by 1 then immediately set it to what it should be,
      // after render.
      if (offset[dir] === this.internals.offset[dir]) {
        newState.offset = { x: 0, y: 0 }
        newState.offset[dir] = offset[dir] + 1
        this.setState(newState, () => {
          this.setState({ offset: offset }, cb)
        })
      } else {
        newState.offset = offset
        this.setState(newState, cb)
      }
    } else {
      this.setState(newState, cb)
    }
  }

  /**
   * Scroll by index
   * @param  {number} index offset index
   * @param  {bool} animated
   */

  scrollBy = (index: number, animated: boolean = true) => {
    if (this.internals.isScrolling || this.state.total < 2) return

    const { scrollView } = this
    const { dir, width, height } = this.state
    const diff = (this.props.loop ? 1 : 0) + index + this.state.index

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

    // update scroll state
    this.internals.isScrolling = true
    this.setState({
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

  scrollViewPropOverrides = () => {
    const props = this.props
    let overrides = {}

    /*
    const scrollResponders = [
      'onMomentumScrollBegin',
      'onTouchStartCapture',
      'onTouchStart',
      'onTouchEnd',
      'onResponderRelease',
    ]
    */

    for (let prop in props) {
      // if(~scrollResponders.indexOf(prop)
      if (
        typeof props[prop] === 'function' &&
        prop !== 'onMomentumScrollEnd' &&
        prop !== 'renderPagination' &&
        prop !== 'onScrollBeginDrag'
      ) {
        let originResponder = props[prop]
        overrides[prop] = e => originResponder(e, this.fullState(), this)
      }
    }

    return overrides
  }

  /**
   * Render pagination
   * @return {object} react-dom
   */
  renderPagination = () => {
    // By default, dots only show when `total` >= 2
    if (this.state.total <= 1) return null

    let dots = []
    const ActiveDot = this.props.activeDot || (
      <View
        style={[
          {
            backgroundColor: this.props.activeDotColor || '#007aff',
            width: 8,
            height: 8,
            borderRadius: 4,
            marginLeft: 3,
            marginRight: 3,
            marginTop: 3,
            marginBottom: 3
          },
          this.props.activeDotStyle
        ]}
      />
    )
    const Dot = this.props.dot || (
      <View
        style={[
          {
            backgroundColor: this.props.dotColor || 'rgba(0,0,0,.2)',
            width: 8,
            height: 8,
            borderRadius: 4,
            marginLeft: 3,
            marginRight: 3,
            marginTop: 3,
            marginBottom: 3
          },
          this.props.dotStyle
        ]}
      />
    )
    for (let i = 0; i < this.state.total; i++) {
      dots.push(
        i === this.state.index
          ? React.cloneElement(ActiveDot, { key: i })
          : React.cloneElement(Dot, { key: i })
      )
    }

    return (
      <View
        pointerEvents="none"
        style={[
          styles['pagination_' + this.state.dir],
          this.props.paginationStyle
        ]}
      >
        {dots}
      </View>
    )
  }

  renderTitle = () => {
    const child = Children.toArray(this.props.children)[this.state.index]
    const title = child && child.props && child.props.title

    return title ? <View style={styles.title}>{title}</View> : null
  }

  renderNextButton = () => {
    let button = null

    if (this.props.loop || this.state.index !== this.state.total - 1) {
      button = this.props.nextButton || <Text style={styles.buttonText}>›</Text>
    }

    return (
      <TouchableOpacity
        onPress={() => button !== null && this.scrollBy(1)}
        disabled={this.props.disableNextButton}
      >
        <View>{button}</View>
      </TouchableOpacity>
    )
  }

  renderPrevButton = () => {
    let button = null

    if (this.props.loop || this.state.index !== 0) {
      button = this.props.prevButton || <Text style={styles.buttonText}>‹</Text>
    }

    return (
      <TouchableOpacity onPress={() => button !== null && this.scrollBy(-1)}>
        <View>{button}</View>
      </TouchableOpacity>
    )
  }

  renderButtons = () => {
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
        {this.renderPrevButton()}
        {this.renderNextButton()}
      </View>
    )
  }

  refScrollView = view => {
    this.scrollView = view
  }

  renderScrollView = pages => {
    if (Platform.OS === 'ios') {
      return (
        <ScrollView
          ref={this.refScrollView}
          {...this.props}
          {...this.scrollViewPropOverrides()}
          contentContainerStyle={[styles.wrapperIOS, this.props.style]}
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
        ref={this.refScrollView}
        {...this.props}
        initialPage={this.props.loop ? this.state.index + 1 : this.state.index}
        onPageSelected={this.onScrollEnd}
        key={pages.length}
        style={[styles.wrapperAndroid, this.props.style]}
      >
        {pages}
      </ViewPagerAndroid>
    )
  }

  /**
   * Default render
   * @return {object} react-dom
   */
  render() {
    const { index, total, width, height } = this.state
    const {
      children,
      containerStyle,
      loop,
      loadMinimal,
      loadMinimalSize,
      loadMinimalLoader,
      renderPagination,
      showsButtons,
      showsPagination
    } = this.props
    // let dir = this.state.dir
    // let key = 0
    const loopVal = loop ? 1 : 0
    let pages = []

    const pageStyle = [{ width: width, height: height }, styles.slide]
    const pageStyleLoading = {
      width,
      height,
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    }

    // For make infinite at least total > 1
    if (total > 1) {
      // Re-design a loop model for avoid img flickering
      pages = Object.keys(children)
      if (loop) {
        pages.unshift(total - 1 + '')
        pages.push('0')
      }

      pages = pages.map((page, i) => {
        if (loadMinimal) {
          if (
            i >= index + loopVal - loadMinimalSize &&
            i <= index + loopVal + loadMinimalSize
          ) {
            return (
              <View style={pageStyle} key={i}>
                {children[page]}
              </View>
            )
          } else {
            return (
              <View style={pageStyleLoading} key={i}>
                {loadMinimalLoader || <ActivityIndicator />}
              </View>
            )
          }
        } else {
          return (
            <View style={pageStyle} key={i}>
              {children[page]}
            </View>
          )
        }
      })
    } else {
      pages = (
        <View style={pageStyle} key={0}>
          {children}
        </View>
      )
    }

    return (
      <View style={[styles.container, containerStyle]} onLayout={this.onLayout}>
        {this.renderScrollView(pages)}
        {showsPagination &&
          (renderPagination
            ? renderPagination(index, total, this)
            : this.renderPagination())}
        {this.renderTitle()}
        {showsButtons && this.renderButtons()}
      </View>
    )
  }
}
