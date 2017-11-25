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
  },

  buttonText: {
    fontSize: 50,
    color: '#007aff',
    fontFamily: 'Arial'
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3
  }
})

type State = {
  autoplayEnd: boolean,
  loopJump: boolean,
  offset: Object,
  total: number,
  index: number,
  dir: 'x' | 'y',
  width: number,
  height: number,
  isScrolling: boolean
}

type Props = {
  horizontal: boolean,
  children?: any,
  containerStyle?: StyleObj,
  style?: StyleObj,
  width?: number,
  height?: number,
  scrollViewStyle?: StyleObj,
  loadMinimal: boolean,
  loadMinimalSize: number,
  loadMinimalLoader?: any, // element
  loop: boolean,
  autoplay: boolean,
  autoplayTimeout: number,
  autoplayDirection: boolean,
  index: number,

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
  nextButton?: any, // element
  disableNextButton: boolean,
  prevButton?: any, // element

  // Functions
  // Called when the index has changed because the user swiped.
  onIndexChanged: (index: number) => void,
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
    const state = {
      width: 0,
      height: 0,
      offset: { x: 0, y: 0 },
      ...(this.state || {})
    }

    const total = props.children ? Children.toArray(props.children).length : 0

    // Default horizontal
    const dir = props.horizontal === false ? 'y' : 'x'

    return {
      autoplayEnd: false,
      loopJump: false,
      offset: {
        x: dir === 'x' ? width * props.index : 0,
        y: dir === 'y' ? height * props.index : 0
      },
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
        : this.state && this.state.height ? this.state.height : height,
      isScrolling: false
    }
  }

  onLayout = (event: Event) => {
    const { width, height } = event.nativeEvent.layout
    const { offset } = this.state
    const state = { width, height }

    if (this.state.total > 1) {
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
      state.offset = offset
    }

    // related to https://github.com/leecade/react-native-swiper/issues/570
    // contentOffset is not working in react 0.48.x so we need to use scrollTo
    // to emulate offset.
    if (Platform.OS === 'ios') {
      if (this.initialRender && this.state.total > 1) {
        if (this.scrollView) {
          this.scrollView.scrollTo({ ...offset, animated: false })
        }
        this.initialRender = false
      }
    }

    this.setState(state)
  }

  loopJump = () => {
    if (!this.state.loopJump) return
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
    if (
      !Array.isArray(this.props.children) ||
      !this.props.autoplay ||
      this.state.isScrolling ||
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
    this.setState({ isScrolling: true })

    if (this.props.onScrollBeginDrag) {
      this.props.onScrollBeginDrag(e, this.state, this)
    }
  }

  /**
   * Scroll end handle
   * @param  {object} e native event
   */
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
    const { horizontal, children } = this.props
    const { index, offset } = this.state
    const previousOffset = horizontal ? offset.x : offset.y
    const newOffset = horizontal ? contentOffset.x : contentOffset.y

    if (
      previousOffset === newOffset &&
      (index === 0 || index === Children.toArray(children).length - 1)
    ) {
      this.setState({ isScrolling: false })
    }
  }

  updateIndex = (offset: Object, cb: () => void) => {
    const { dir } = this.state
    let { index } = this.state
    const diff = offset[dir] - this.state.offset[dir]

    // Do nothing if offset no change.
    if (diff === 0) return

    const step = dir === 'x' ? this.state.width : this.state.height

    // Note: if touch very very quickly and continuous,
    // the variation of `index` more than 1.
    // parseInt() ensures it's always an integer
    index = parseInt(index + Math.round(diff / step))

    if (this.props.loop) {
      if (index <= -1) {
        index = this.state.total - 1
        offset[dir] = step * this.state.total
      } else if (index >= this.state.total) {
        index = 0
        offset[dir] = step
      }
    }

    const newState = {
      index,
      loopJump: this.props.loop,
      offset
    }

    // only update offset in state if loopJump is true
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
    if (this.state.isScrolling || this.state.total < 2) return

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

  /**
   * Render pagination
   * @return {object} react-dom
   */
  renderPagination = () => {
    // By default, dots only show when `total` >= 2
    if (this.state.total <= 1) return null

    const DefaultDot = ({ active }: { active: boolean }) => (
      <View
        style={[
          styles.dot,
          { backgroundColor: active ? '#007aff' : 'rgba(0,0,0,.2)' }
        ]}
      />
    )

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
        {arrayWithLength(this.state.total).map(index => (
          <Dot key={index} active={index === this.state.index} />
        ))}
      </View>
    )
  }

  renderTitle = () => {
    const child = Children.toArray(this.props.children)[this.state.index]
    const title = child && child.props && child.props.title

    return title ? <View style={styles.title}>{title}</View> : null
  }

  renderNextButton = () => {
    if (this.props.loop || this.state.index !== this.state.total - 1) {
      return (
        <TouchableOpacity
          onPress={() => this.scrollBy(1)}
          disabled={this.props.disableNextButton}
        >
          <View>
            {this.props.nextButton || <Text style={styles.buttonText}>›</Text>}
          </View>
        </TouchableOpacity>
      )
    }

    return null
  }

  renderPrevButton = () => {
    if (this.props.loop || this.state.index !== 0) {
      return (
        <TouchableOpacity onPress={() => this.scrollBy(-1)}>
          <View>
            {this.props.prevButton || <Text style={styles.buttonText}>‹</Text>}
          </View>
        </TouchableOpacity>
      )
    }

    return null
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

  setScrollViewRef = (
    scrollView: ?React$ElementRef<ScrollView | ViewPagerAndroid>
  ) => {
    this.scrollView = scrollView
  }

  renderScrollView = (pages: Array<any>) => {
    if (Platform.OS === 'ios') {
      return (
        <ScrollView
          ref={this.setScrollViewRef}
          {...this.props}
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
        ref={this.setScrollViewRef}
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

    const pageStyle = [{ width, height }, styles.slide]
    const pageStyleLoading = [{ width, height }, styles.loading]

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
          }

          return (
            <View style={pageStyleLoading} key={i}>
              {loadMinimalLoader || <ActivityIndicator />}
            </View>
          )
        }
        return (
          <View style={pageStyle} key={i}>
            {children[page]}
          </View>
        )
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

        {showsPagination
          ? renderPagination
            ? renderPagination(index, total, this)
            : this.renderPagination()
          : null}

        {this.renderTitle()}

        {showsButtons ? this.renderButtons() : null}
      </View>
    )
  }
}
