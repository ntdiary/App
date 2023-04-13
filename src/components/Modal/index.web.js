import React from 'react';
import withWindowDimensions from '../withWindowDimensions';
import BaseModal from './BaseModal';
import {propTypes, defaultProps} from './modalPropTypes';
import * as StyleUtils from '../../styles/StyleUtils';
import themeColors from '../../styles/themes/default';

const Modal = (props) => {
    const onModalHide = props.onModalHide;
    const fullscreen = props.fullscreen;
    const shouldCallBeforeModalHide = props.shouldCallBeforeModalHide;

    const [trapActive, setTrapActive] = React.useState(true);

    const setStatusBarColor = React.useCallback((color = themeColors.appBG) => {
        if (!fullscreen) {
            return;
        }

        // Change the color of the status bar to align with the modal's backdrop (refer to https://github.com/Expensify/App/issues/12156).
        document.querySelector('meta[name=theme-color]').content = color;
    }, [fullscreen]);

    const hideModal = React.useCallback(() => {
        setStatusBarColor();
        if (shouldCallBeforeModalHide) {
            return;
        }
        onModalHide();
    }, [shouldCallBeforeModalHide, setStatusBarColor, onModalHide]);

    const showModal = () => {
        setTrapActive(true);
        setStatusBarColor(StyleUtils.getThemeBackgroundColor());
        props.onModalShow();
    };

    const willHideModal = React.useCallback(() => {
        setTrapActive(false);
        if (shouldCallBeforeModalHide) {
            onModalHide();
        }
    }, [shouldCallBeforeModalHide, onModalHide]);

    return (
        <BaseModal
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            isTrapActive={trapActive}
            onModalHide={hideModal}
            onModalShow={showModal}
            onModalWillHide={willHideModal}
        >
            {props.children}
        </BaseModal>
    );
};

Modal.propTypes = propTypes;
Modal.defaultProps = defaultProps;
Modal.displayName = 'Modal';
export default withWindowDimensions(Modal);
