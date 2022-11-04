import _ from 'underscore';

const PasswordType = ['username', 'password'];

const CardType = ['nameOnCard', 'cardNumber', 'expirationDate', 'securityCode'];

function needAutocomplete(node) {
    const name = node ? node.props.name : '';
    return name && (_.contains(PasswordType, name) || _.contains(CardType, name));
}

class AutofillManager {
    /**
     * manager status
     */
    active;

    /**
     * current form provider
     */
    form;

    /**
     * current input object
     */
    input;

    /**
     * current input form type
     */
    type;

    /**
     * current candidate
     */
    item;

    /**
     * input group
     */
    inputs;

    constructor(active) {
        this.active = active;
        this.inputs = {};
    }

    addInput(node, domPath, valuePath, setValue) {
        if (!this.active || !needAutocomplete(node)) {
            return;
        }
        const name = node.props.name;
        if (_.has(this.inputs, name)) {
            return;
        }
        this.inputs[name] = {
            node,
            domPath,
            valuePath,
            setValue,
        };
    }

    isValid(node) {
        if (!this.active || !needAutocomplete(node)) {
            return false;
        }
        return _.get(this.inputs, node.props.name);
    }

    showDropdown(node) {
        const input = this.isValid(node);
        if (!input) {
            return;
        }
        this.input = input;
        if (_.contains(PasswordType, node.props.name)) {
            this.type = 'password';
        } else if (_.contains(CardType, node.props.name)) {
            this.type = 'card';
        } else {
            this.type = null;
        }
        if (this.form) {
            this.form.toggleDropdown(this.type);
        }
    }

    hideDropdown(node) {
        if (!this.isValid(node)) {
            return;
        }

        // type
        if (!this.form) {
            return;
        }
        this.form.toggleDropdown(null);
    }

    preview() {
        // todo
    }

    select(item) {
        const keys = this.type === 'password' ? PasswordType : CardType;
        keys.forEach((key) => {
            const input = this.inputs[key];
            if (!input) {
                return;
            }
            const node = input.node;
            if (node.props.name === key) {
                input.setValue(item[key]);
            }
        });
    }

    submit() {
        // todo
    }
}

export default AutofillManager;
