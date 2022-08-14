import { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { MdArrowForward, MdFolderOpen } from 'react-icons/md';

import ButtonSelect from '../components/ButtonSelect';
import FileInput from '../components/FileInput';
import Icon from '../components/Icon';
import URLInput from '../components/URLInput';
import { getObject, createObjectURL, revokeObjectURL } from '../utils/BlobUtils';
import { isURL } from '../utils/Validators';

const FilePickerInputMode = {
    WEB: 'web',
    FILE: 'file'
};

export default class FilePickerInput extends Component {
    static propTypes = {
        label: PropTypes.node,
        name: PropTypes.string,
        value: PropTypes.string,
        accept: PropTypes.string,
        onChange: PropTypes.func,
        isValidFileType: PropTypes.func
    };

    static defaultProps = {
        label: 'Select File',
        onChange: () => {}
    };

    constructor(props) {
        super(props);

        this.state = {
            inputMode: FilePickerInputMode.WEB,
            url: '',
            hasSubmittedURL: false
        };

        this.validateURL = this.validateURL.bind(this);

        this.handleModeChange = this.handleModeChange.bind(this);
        this.handleURLChange = this.handleURLChange.bind(this);
        this.handleURLSubmit = this.handleURLSubmit.bind(this);
        this.handleFileChange = this.handleFileChange.bind(this);
    }

    componentDidMount() {
        const { value } = this.props;

        this.updateURL(value);
    }

    componentDidUpdate(prevProps) {
        const { value } = this.props;

        if (prevProps.value !== value) {
            this.updateURL(value);
        }
    }

    validateURL(value) {
        const { hasSubmittedURL } = this.state;

        return (
            (hasSubmittedURL && (!value || !isURL(value)))
                ? {
                    valid: false,
                    feedback: 'Please enter a valid URL.'
                }
                : { valid: true }
        );
    }

    handleModeChange(name, value) {
        this.setState({
            inputMode: value,
            hasSubmittedURL: false
        });
    }

    handleURLChange(e) {
        this.setState({
            url: e.target.value,
            hasSubmittedURL: false
        });
    }

    handleURLSubmit() {
        const { name, onChange } = this.props;
        const { url } = this.state;

        this.setState({ hasSubmittedURL: true });

        onChange(name, url);
    }

    handleFileChange(inputName, file) {
        const { name, value, onChange } = this.props;

        this.setState({ url: '' });

        revokeObjectURL(value);

        onChange(name, createObjectURL(file));
    }

    updateURL(value) {
        this.setState({
            url: value && !getObject(value) ? value : ''
        });
    }

    render() {
        const { label, value, accept, isValidFileType } = this.props;
        const { inputMode, url } = this.state;

        return (
            <div className="form-group">
                <fieldset className="field-group">
                    <legend className="field-group-legend">
                        {label}
                    </legend>

                    <div className="field-group-body">
                        <ButtonSelect
                            label="From"
                            name="inputMode"
                            value={inputMode}
                            options={[
                                {
                                    label: 'Web',
                                    value: FilePickerInputMode.WEB
                                },
                                {
                                    label: 'File',
                                    value: FilePickerInputMode.FILE
                                }
                            ]}
                            block
                            onChange={this.handleModeChange}
                        />

                        {inputMode === FilePickerInputMode.WEB && (
                            <URLInput
                                label="URL"
                                name="url"
                                value={url}
                                buttonText={(
                                    <Fragment>
                                        <Icon component={MdArrowForward} />
                                        <span className="sr-only">Submit</span>
                                    </Fragment>
                                )}
                                validator={this.validateURL}
                                onChange={this.handleURLChange}
                                onSubmit={this.handleURLSubmit}
                            />
                        )}

                        {inputMode === FilePickerInputMode.FILE && (
                            <FileInput
                                label="File"
                                name="file"
                                value={getObject(value)}
                                accept={accept}
                                defaultText="Select file..."
                                buttonText={(
                                    <Fragment>
                                        <Icon component={MdFolderOpen} />
                                        <span className="sr-only">Browse</span>
                                    </Fragment>
                                )}
                                onChange={this.handleFileChange}
                                isValidFileType={isValidFileType}
                            />
                        )}
                    </div>
                </fieldset>
            </div>
        );
    }
}
