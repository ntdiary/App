import React from 'react';
import PropTypes from 'prop-types';
import Onyx, {withOnyx} from 'react-native-onyx';
import ReactDOM from 'react-dom';
import {Pressable, View} from 'react-native';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import Text from '../components/Text';
import withLocalize from '../components/withLocalize';
import compose from '../libs/compose';
import AutofillContext from './AutofillContext';

const propTypes = {
    /** Rendered child component */
    type: PropTypes.string.isRequired,

    candidates: PropTypes.arrayOf(PropTypes.shape({})),
};

const defaultProps = {
    candidates: [],
};

const styles = {
    container: {
        position: 'fixed',
        paddingVertical: 5,
        borderRadius: 5,
        width: 200,
        minWidth: 100,
        maxWidth: 300,
        minHeight: 28,
        maxHeight: 300,
        lineHeight: 28,
        fontSize: 14,
        background: 'rgba(255, 255, 255, 1)',
        boxShadow: '0 0 5px 1px rgba(0, 0, 0, .3)',
        cursor: 'default',
    },
    li: {
        paddingHorizontal: 10,
    },
    hovered: {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    title: {
        fontSize: 14,
        lineHeight: 28,
    },
    description: {
        fontSize: 14,
        lineHeight: 28,
    },
    line: {
        marginVertical: 5,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    admin: {
        paddingHorizontal: 10,
        fontSize: 14,
        lineHeight: 28,
    },
};

class AutofillDropdown extends React.Component {
    constructor(props) {
        super(props);
        this.setItem = this.setItem.bind(this);
        this.calculatePosition = this.calculatePosition.bind(this);
        this.renderPassword = this.renderPassword.bind(this);
        this.renderCard = this.renderCard.bind(this);
        this.renderContainer = this.renderContainer.bind(this);
    }

    setItem(item) {
        this.context.select(item);
    }

    calculatePosition() {
        const input = this.context.input;
        if (!input) {
            return;
        }
        const el = lodashGet(input.node, input.domPath);
        if (!el) {
            return;
        }
        const rect = el.getBoundingClientRect();
        const bodyRect = document.body.getBoundingClientRect();
        if ((bodyRect.width - rect.right) < 200) {
            return {
                top: rect.top - 10,
                left: 'auto',
                right: (bodyRect.width - rect.left) + 20,
            };
        }
        return {
            top: rect.top - 10,
            left: rect.right + 20,
            right: 'auto',
        };
    }

    renderPassword() {
        return _.map(this.props.candidates, (item, index) => {
            const maskLength = item.password.length > 10 ? 10 : item.password.length;
            const desc = '*'.repeat(maskLength);
            return (
                <Pressable key={index} onMouseDown={() => this.setItem(item)}>
                    {({hovered}) => (
                        <View style={[styles.li, hovered ? styles.hovered : undefined]}>
                            <Text style={styles.title}>{item.username}</Text>
                            <Text style={styles.description}>{desc}</Text>
                        </View>
                    )}
                </Pressable>
            );
        });
    }

    renderCard() {
        return _.map(this.props.candidates, (item, index) => {
            const desc = `**** ${item.cardNumber.slice(-4, -1)}, expires on ${item.expirationDate}`;
            return (
                <Pressable key={index} onMouseDown={() => this.setItem(item)}>
                    {({hovered}) => (
                        <View style={[styles.li, hovered ? styles.hovered : undefined]}>
                            <Text style={styles.title}>{item.nameOnCard}</Text>
                            <Text style={styles.description}>{desc}</Text>
                        </View>
                    )}
                </Pressable>
            );
        });
    }

    renderContainer() {
        const text = this.props.type === 'password' ? 'Manage Passwords...' : 'Manage Cards...';
        return (
            <View style={[styles.container, this.calculatePosition()]}>
                {this.props.type === 'password' ? this.renderPassword() : this.renderCard()}
                <View style={styles.line} />
                <Pressable onMouseDown={() => window.alert('development')}>
                    {({hovered}) => (
                        <Text style={[styles.admin, hovered ? styles.hovered : undefined]}>{text}</Text>
                    )}
                </Pressable>
            </View>
        );
    }

    render() {
        if (!this.props.candidates || this.props.candidates.length < 1) {
            return (<></>);
        }
        return ReactDOM.createPortal(this.renderContainer(), document.body);
    }
}

AutofillDropdown.propTypes = propTypes;
AutofillDropdown.contextType = AutofillContext;
AutofillDropdown.defaultProps = defaultProps;

// TODO:delete
Onyx.set('password', [
    {
        username: '2471314@gmail.com',
        password: '1111111111',
    },
    {
        username: '2471314+1@gmail.com',
        password: '22222',
    },
]);

Onyx.set('card', [
    {
        nameOnCard: 'Randy Mayoral',
        cardNumber: '4261 5790 7998 2970',
        expirationDate: '10/26',
        securityCode: '333',
    },
    {
        nameOnCard: 'Laine Catt',
        cardNumber: '4416 8240 4467 0787',
        expirationDate: '07/23',
        securityCode: '496',
    },
]);

export default compose(
    withLocalize,
    withOnyx({
        candidates: {
            key: props => (props.type === 'password' ? 'password' : 'card'),
        },
    }),
)(AutofillDropdown);
