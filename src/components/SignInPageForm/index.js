import React from 'react';
import FormElement from '../FormElement';
import AutofillProvider from '../../vendors/AutofillProvider';

class Form extends React.Component {
    componentDidMount() {
        if (!this.form) {
            return;
        }

        // Password Managers need these attributes to be able to identify the form elements properly.
        this.form.setAttribute('method', 'post');
        this.form.setAttribute('action', '/');
    }

    render() {
        return (
            <AutofillProvider>
                <FormElement
                    ref={el => this.form = el}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...this.props}
                />
            </AutofillProvider>
        );
    }
}

export default Form;
