// @flow

import React, { Component } from 'react';
import { Linking, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { type Dispatch } from 'redux';

import { openDialog } from '../../../../base/dialog';
import { translate } from '../../../../base/i18n';
import {
    HeaderWithNavigation,
    LoadingIndicator,
    SlidingView
} from '../../../../base/react';
import { connect } from '../../../../base/redux';

import { hideDialInSummary } from '../../../actions';
import { getDialInfoPageURLForURIString } from '../../../functions';

import DialInSummaryErrorDialog from './DialInSummaryErrorDialog';
import styles, { INDICATOR_COLOR } from './styles';

type Props = {

    /**
     * The URL to display the summary for.
     */
    _summaryUrl: ?string,

    dispatch: Dispatch<any>
};

/**
 * Implements a React native component that displays the dial in info page for a specific room.
 */
class DialInSummary extends Component<Props> {

    /**
     * Initializes a new instance.
     *
     * @inheritdoc
     */
    constructor(props: Props) {
        super(props);

        this._onCloseView = this._onCloseView.bind(this);
        this._onError = this._onError.bind(this);
        this._onNavigate = this._onNavigate.bind(this);
        this._renderLoading = this._renderLoading.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        const { _summaryUrl } = this.props;

        return (
            <SlidingView
                onHide = { this._onCloseView }
                position = 'bottom'
                show = { Boolean(_summaryUrl) } >
                <View style = { styles.webViewWrapper }>
                    <HeaderWithNavigation
                        headerLabelKey = 'info.label'
                        onPressBack = { this._onCloseView } />
                    <WebView
                        onError = { this._onError }
                        onShouldStartLoadWithRequest = { this._onNavigate }
                        renderLoading = { this._renderLoading }
                        source = {{ uri: getDialInfoPageURLForURIString(_summaryUrl) }}
                        startInLoadingState = { true }
                        style = { styles.webView } />
                </View>
            </SlidingView>
        );
    }

    _onCloseView: () => boolean;

    /**
     * Closes the view.
     *
     * @returns {boolean}
     */
    _onCloseView() {
        if (this.props._summaryUrl) {
            this.props.dispatch(hideDialInSummary());

            return true;
        }

        return false;
    }

    _onError: () => void;

    /**
     * Callback to handle the error if the page fails to load.
     *
     * @returns {void}
     */
    _onError() {
        this.props.dispatch(hideDialInSummary());
        this.props.dispatch(openDialog(DialInSummaryErrorDialog));
    }

    _onNavigate: Object => Boolean;

    /**
     * Callback to intercept navigation inside the webview and make the native app handle the dial requests.
     *
     * NOTE: We don't navigate to anywhere else form that view.
     *
     * @param {any} request - The request object.
     * @returns {boolean}
     */
    _onNavigate(request) {
        const { url } = request;

        if (url.startsWith('tel:')) {
            Linking.openURL(url);
            this.props.dispatch(hideDialInSummary());
        }

        return url === getDialInfoPageURLForURIString(this.props._summaryUrl);
    }

    _renderLoading: () => React$Component<any>;

    /**
     * Renders the loading indicator.
     *
     * @returns {React$Component<any>}
     */
    _renderLoading() {
        return (
            <View style = { styles.indicatorWrapper }>
                <LoadingIndicator
                    color = { INDICATOR_COLOR }
                    size = 'large' />
            </View>
        );
    }
}

/**
 * Maps part of the Redux state to the props of this component.
 *
 * @param {Object} state - The Redux state.
 * @returns {{
 *      _summaryUrl: ?string
 * }}
 */
function _mapStateToProps(state) {
    return {
        _summaryUrl: state['features/invite'].summaryUrl
    };
}

export default translate(connect(_mapStateToProps)(DialInSummary));
