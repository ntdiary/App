import React, {PureComponent} from 'react';
import {View, Dimensions} from 'react-native';
import PropTypes from 'prop-types';
import ReactNativeModal from 'react-native-modal';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';
import styles from '../../styles/styles';
import * as StyleUtils from '../../styles/StyleUtils';
import themeColors from '../../styles/themes/default';
import {propTypes as modalPropTypes, defaultProps as modalDefaultProps} from './modalPropTypes';
import * as Modal from '../../libs/actions/Modal';
import getModalStyles from '../../styles/getModalStyles';

const propTypes = {
    ...modalPropTypes,

    /** The ref to the modal container */
    forwardedRef: PropTypes.func,
};

const defaultProps = {
    ...modalDefaultProps,
    forwardedRef: () => {},
};

class BaseModal extends PureComponent {
    constructor(props) {
        super(props);

        this.hideModal = this.hideModal.bind(this);

        this.onDimensionChange = this.onDimensionChange.bind(this);
        const initialDimensions = Dimensions.get('window');
        this.dimensionsEventListener = null;
        this.state = {
            windowHeight: initialDimensions.height,
        };
    }

    componentDidMount() {
        this.dimensionsEventListener = Dimensions.addEventListener('change', this.onDimensionChange);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.isVisible === this.props.isVisible) {
            return;
        }

        Modal.willAlertModalBecomeVisible(this.props.isVisible);
    }

    componentWillUnmount() {
        // we don't want to call the onModalHide on unmount
        this.hideModal(this.props.isVisible);
        if (!this.dimensionsEventListener) {
            return;
        }
        this.dimensionsEventListener.remove();
    }

    /**
     * Stores the application window's width and height in a component state variable.
     * Called each time the application's window dimensions or screen dimensions change.
     * @link https://reactnative.dev/docs/dimensions
     * @param {Object} newDimensions Dimension object containing updated window and screen dimensions
     */
    onDimensionChange(newDimensions) {
        const {window} = newDimensions;
        this.setState({
            windowHeight: window.height,
        });
    }

    /**
     * Hides modal
     * @param {Boolean} [callHideCallback=true] Should we call the onModalHide callback
     */
    hideModal(callHideCallback = true) {
        if (this.props.shouldSetModalVisibility) {
            Modal.setModalVisibility(false);
        }
        if (callHideCallback) {
            this.props.onModalHide();
        }
    }

    render() {
        const {
            modalStyle,
            modalContainerStyle,
            swipeDirection,
            animationIn,
            animationOut,
            shouldAddTopSafeAreaPadding,
            shouldAddBottomSafeAreaPadding,
            hideBackdrop,
        } = getModalStyles(
            this.props.type,
            {
                windowWidth: this.props.windowWidth,
                windowHeight: this.props.windowHeight,
                isSmallScreenWidth: this.props.isSmallScreenWidth,
            },
            this.props.popoverAnchorPosition,
            this.props.containerStyle,
        );
        return (
            <ReactNativeModal
                onBackdropPress={(e) => {
                    if (e && e.type === 'keydown' && e.key === 'Enter') {
                        return;
                    }
                    this.props.onClose();
                }}

                // Note: Escape key on web/desktop will trigger onBackButtonPress callback
                // eslint-disable-next-line react/jsx-props-no-multi-spaces
                onBackButtonPress={this.props.onClose}
                onModalShow={() => {
                    if (this.props.shouldSetModalVisibility) {
                        Modal.setModalVisibility(true);
                    }
                    this.props.onModalShow();
                }}
                propagateSwipe={this.props.propagateSwipe}
                onModalHide={this.hideModal}
                onSwipeComplete={this.props.onClose}
                swipeDirection={swipeDirection}
                isVisible={this.props.isVisible}
                backdropColor={themeColors.modalBackdrop}
                backdropOpacity={hideBackdrop ? 0 : 0.5}
                backdropTransitionOutTiming={0}
                hasBackdrop={this.props.fullscreen}
                coverScreen={this.props.fullscreen}
                style={modalStyle}
                deviceHeight={this.state.windowHeight}
                deviceWidth={this.props.windowWidth}
                animationIn={this.props.animationIn || animationIn}
                animationOut={this.props.animationOut || animationOut}
                useNativeDriver={this.props.useNativeDriver}
                hideModalContentWhileAnimating={this.props.hideModalContentWhileAnimating}
                animationInTiming={this.props.animationInTiming}
                animationOutTiming={this.props.animationOutTiming}
                statusBarTranslucent={this.props.statusBarTranslucent}
            >
                <SafeAreaInsetsContext.Consumer>
                    {(insets) => {
                        const {
                            paddingTop: safeAreaPaddingTop,
                            paddingBottom: safeAreaPaddingBottom,
                            paddingLeft: safeAreaPaddingLeft,
                            paddingRight: safeAreaPaddingRight,
                        } = StyleUtils.getSafeAreaPadding(insets);

                        const modalPaddingStyles = StyleUtils.getModalPaddingStyles({
                            safeAreaPaddingTop,
                            safeAreaPaddingBottom,
                            safeAreaPaddingLeft,
                            safeAreaPaddingRight,
                            shouldAddBottomSafeAreaPadding,
                            shouldAddTopSafeAreaPadding,
                            modalContainerStylePaddingTop: modalContainerStyle.paddingTop,
                            modalContainerStylePaddingBottom: modalContainerStyle.paddingBottom,
                        });

                        return (
                            <View
                                style={{
                                    ...styles.defaultModalContainer,
                                    ...modalContainerStyle,
                                    ...modalPaddingStyles,
                                }}
                                ref={this.props.forwardedRef}
                            >
                                {this.props.children}
                            </View>
                        );
                    }}
                </SafeAreaInsetsContext.Consumer>
            </ReactNativeModal>
        );
    }
}

BaseModal.propTypes = propTypes;
BaseModal.defaultProps = defaultProps;

export default React.forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <BaseModal {...props} forwardedRef={ref} />
));
