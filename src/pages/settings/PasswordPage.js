import React, {Component} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import _ from 'underscore';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import ScreenWrapper from '../../components/ScreenWrapper';
import Text from '../../components/Text';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';
import * as ValidationUtils from '../../libs/ValidationUtils';
import * as User from '../../libs/actions/User';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import TextInput from '../../components/TextInput';
import * as Session from '../../libs/actions/Session';
import PasswordConfirmationScreen from './PasswordConfirmationScreen';
import Form from '../../components/Form';

const propTypes = {
    /* Onyx Props */

    /** Holds information about the users account that is logging in */
    account: PropTypes.shape({
        /** An error message to display to the user */
        error: PropTypes.string,

        /** Success message to display when necessary */
        success: PropTypes.string,

        /** Whether a sign on form is loading (being submitted) */
        loading: PropTypes.bool,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    account: {},
};
class PasswordPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            shouldShowNewPasswordPrompt: true,
        };

        this.submit = this.submit.bind(this);
        this.validate = this.validate.bind(this);
        this.onFormValidated = this.onFormValidated.bind(this);
        this.formRef = null;
    }

    componentWillUnmount() {
        Session.clearAccountMessages();
    }

    onFormValidated(errors) {
        this.setState({
            shouldShowNewPasswordPrompt: _.isUndefined(errors.newPassword),
        });
    }

    /**
     * @param {Object} values - form input values passed by the Form component
     * @returns {Boolean}
     */
    validate(values) {
        const errors = {};

        if (!values.currentPassword) {
            errors.currentPassword = this.props.translate('passwordPage.errors.currentPassword');
        }

        if (!values.newPassword || !ValidationUtils.isValidPassword(values.newPassword)) {
            errors.newPassword = this.props.translate('passwordPage.errors.newPassword');
        }

        if (values.currentPassword && values.newPassword && _.isEqual(values.currentPassword, values.newPassword)) {
            errors.newPassword = this.props.translate('passwordPage.errors.newPasswordSameAsOld');
        }
        return errors;
    }

    /**
     * @param {Object} values - form input values passed by the Form component
     */
    submit(values) {
        User.updatePassword(values.currentPassword, values.newPassword);
    }

    render() {
        return (
            <ScreenWrapper onTransitionEnd={(e) => {
                if (!this.formRef || (e && e.data && e.data.closing)) {
                    return;
                }
                this.formRef.focus('currentPassword');
            }}
            >
                <HeaderWithCloseButton
                    title={this.props.translate('passwordPage.changePassword')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.goBack()}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />
                {!_.isEmpty(this.props.account.success)
                    ? (
                        <PasswordConfirmationScreen />
                    ) : (
                        <Form
                            formID={ONYXKEYS.ACCOUNT}
                            validate={this.validate}
                            onSubmit={this.submit}
                            submitButtonText={this.props.translate('common.save')}
                            style={[styles.flexGrow1, styles.mh5]}
                            onFormValidated={this.onFormValidated}
                            ref={el => this.formRef = el}
                        >
                            <Text style={[styles.mb6]}>
                                {this.props.translate('passwordPage.changingYourPasswordPrompt')}
                            </Text>
                            <View style={styles.mb6}>
                                <TextInput
                                    inputID="currentPassword"
                                    label={`${this.props.translate('passwordPage.currentPassword')}*`}
                                    secureTextEntry
                                    autoCompleteType="password"
                                    textContentType="password"
                                    returnKeyType="done"
                                />
                            </View>
                            <View style={styles.mb6}>
                                <TextInput
                                    inputID="newPassword"
                                    label={`${this.props.translate('passwordPage.newPassword')}*`}
                                    secureTextEntry
                                    autoCompleteType="password"
                                    textContentType="password"
                                />
                                {this.state.shouldShowNewPasswordPrompt && (
                                    <Text
                                        style={[
                                            styles.textLabelSupporting,
                                            styles.mt1,
                                        ]}
                                    >
                                        {this.props.translate('passwordPage.newPasswordPrompt')}
                                    </Text>
                                )}
                            </View>
                        </Form>
                    )}
            </ScreenWrapper>
        );
    }
}

PasswordPage.propTypes = propTypes;
PasswordPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        account: {
            key: ONYXKEYS.ACCOUNT,
        },
    }),
)(PasswordPage);
