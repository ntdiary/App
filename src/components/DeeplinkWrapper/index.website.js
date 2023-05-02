import PropTypes from 'prop-types';
import {PureComponent} from 'react';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import CONST from '../../CONST';
import CONFIG from '../../CONFIG';
import * as Browser from '../../libs/Browser';
import ONYXKEYS from '../../ONYXKEYS';
import * as Session from '../../libs/actions/Session';
import ROUTES from '../../ROUTES';

const propTypes = {
    /** Children to render. */
    children: PropTypes.node.isRequired,

    /** Session info for the currently logged-in user. */
    session: PropTypes.shape({

        /** Currently logged-in user email */
        email: PropTypes.string,

        /** Currently logged-in user authToken */
        authToken: PropTypes.string,

        /** The short-lived auth token for navigating to desktop app */
        shortLivedAuthToken: PropTypes.string,
    }),
};

const defaultProps = {
    session: {
        email: '',
        authToken: '',
        shortLivedAuthToken: '',
    },
};

class DeeplinkWrapper extends PureComponent {
    constructor(props) {
        super(props);
        this.hasPopupBeenOpenedBefore = false;
    }

    componentDidMount() {
        if (!this.isMacOSWeb() || CONFIG.ENVIRONMENT === CONST.ENVIRONMENT.DEV) {
            return;
        }

        // If the current url path is /transition..., meaning it was opened from oldDot, during this transition period:
        // 1. The session.authToken may not exist, because sign-in has not been completed yet.
        // 2. There may be non-idempotent operations (e.g. create a new workspace), which obviously should not be executed again in the desktop app.
        // So we need to wait until after sign-in and navigation are complete before starting the deeplink redirect.
        if (Str.startsWith(window.location.pathname, Str.normalizeUrl(ROUTES.USER_AUTH_REDIRECT))) {
            Session.getShortLivedAuthTokenAfterTransition();
            return;
        }

        if (!this.props.session.authToken) {
            this.openRouteInDesktopApp();
            return;
        }

        Session.getShortLivedAuthToken();
    }

    componentDidUpdate(prevProps) {
        if (!this.props.session.shortLivedAuthToken || this.props.session.shortLivedAuthToken === prevProps.session.shortLivedAuthToken) {
            return;
        }

        // Now that there is a new shortLivedAuthToken, the route to the desktop app can be opened.
        this.openRouteInDesktopApp();
    }

    openRouteInDesktopApp() {
        if (this.hasPopupBeenOpenedBefore) {
            return;
        }

        // We need to record whether the popup window has been opened before,
        // otherwise when there are multiple tabs, if the user only refreshes tab 1,
        // onyx will synchronize and update the short-lived auth tokens of the other tabs,
        // which will cause the other tabs to also display the popup window.
        this.hasPopupBeenOpenedBefore = true;

        const params = new URLSearchParams();
        params.set('exitTo', `${window.location.pathname}${window.location.search}${window.location.hash}`);
        const session = this.props.session;
        if (session.email && session.shortLivedAuthToken) {
            params.set('email', session.email);
            params.set('shortLivedAuthToken', session.shortLivedAuthToken);
        }
        const expensifyUrl = new URL(CONFIG.EXPENSIFY.NEW_EXPENSIFY_URL);
        const expensifyDeeplinkUrl = `${CONST.DEEPLINK_BASE_URL}${expensifyUrl.host}/transition?${params.toString()}`;

        // This check is necessary for Safari, otherwise, if the user
        // does NOT have the Expensify desktop app installed, it's gonna
        // show an error in the page saying that the address is invalid
        if (CONST.BROWSER.SAFARI === Browser.getBrowser()) {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
            iframe.contentWindow.location.href = expensifyDeeplinkUrl;

            // Since we're creating an iframe for Safari to handle deeplink,
            // we need to give Safari some time to open the pop-up window.
            // After that we can just remove the iframe.
            setTimeout(() => {
                if (!iframe.parentNode) {
                    return;
                }
                iframe.parentNode.removeChild(iframe);
            }, 0);
        } else {
            window.location.href = expensifyDeeplinkUrl;
        }
    }

    isMacOSWeb() {
        return !Browser.isMobile() && (
            typeof navigator === 'object'
            && typeof navigator.userAgent === 'string'
            && /Mac/i.test(navigator.userAgent)
            && !/Electron/i.test(navigator.userAgent)
        );
    }

    render() {
        return this.props.children;
    }
}

DeeplinkWrapper.propTypes = propTypes;
DeeplinkWrapper.defaultProps = defaultProps;
export default withOnyx({
    session: {key: ONYXKEYS.SESSION},
})(DeeplinkWrapper);
