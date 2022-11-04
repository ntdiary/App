import React from 'react';
import PropTypes from 'prop-types';
import AutofillContext from './AutofillContext';
import AutofillManager from './AutofillManager';
import AutofillDropdown from './AutofillDropdown';

const propTypes = {
    /** Rendered child component */
    children: PropTypes.node.isRequired,
};

class AutofillProvider extends React.Component {
    constructor(props) {
        super(props);
        this.manager = new AutofillManager(true);
        this.state = {
            type: null,
        };
        this.manager.form = this;
        this.toggleDropdown = this.toggleDropdown.bind(this);
    }

    toggleDropdown(type) {
        this.setState({
            type,
        });
    }

    render() {
        return (
            <AutofillContext.Provider value={this.manager}>
                <>
                    {this.props.children}
                    {
                        this.state.type && (<AutofillDropdown type={this.state.type} />)
                    }
                </>
            </AutofillContext.Provider>
        );
    }
}

AutofillProvider.propTypes = propTypes;

export default AutofillProvider;
