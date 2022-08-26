import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {useDrawerProgress, useDrawerStatus} from '@react-navigation/drawer';
import {call, useCode} from 'react-native-reanimated';
import _ from 'underscore';
import getComponentDisplayName from '../libs/getComponentDisplayName';
import CONST from '../CONST';

const withDrawerProgressPropTypes = {
    progress: PropTypes.oneOf(_.values(CONST.SIDEBAR_TRANSITION)),
};

let prevReportID = null;

export default function withDrawerProgress(WrappedComponent) {
    const WightDrawerProgress = (props) => {
        const [progress, setProgress] = useState(null);

        let previousValue = 0;
        const drawerProgress = useDrawerProgress();

        useCode(() => call([drawerProgress], ([val]) => {
            if (val <= 0) {
                setProgress(CONST.SIDEBAR_TRANSITION.CLOSED);
            } else if (val >= 1) {
                setProgress(CONST.SIDEBAR_TRANSITION.OPENED);
            } else if (val > previousValue) {
                setProgress(CONST.SIDEBAR_TRANSITION.OPENING);
            } else if (val < previousValue) {
                setProgress(CONST.SIDEBAR_TRANSITION.CLOSING);
            }
            previousValue = val;
        }), [drawerProgress]);

        const drawerStatus = useDrawerStatus();
        if (drawerStatus === 'closed') {
            prevReportID = props.route.params.reportID;
        } else if (progress === CONST.SIDEBAR_TRANSITION.OPENED) {
            prevReportID = props.route.params.reportID;
        }
        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                ref={props.forwardedRef}
                reportId={prevReportID}
                progress={progress}
            />
        );
    };

    WightDrawerProgress.displayName = `withDrawerProgress(${getComponentDisplayName(WrappedComponent)})`;
    WightDrawerProgress.propTypes = {
        forwardedRef: PropTypes.oneOfType([
            PropTypes.func,
            PropTypes.shape({current: PropTypes.instanceOf(React.Component)}),
        ]),
        route: PropTypes.shape({
            /** Route specific parameters used on this screen */
            params: PropTypes.shape({
                /** The ID of the report this screen should display */
                reportID: PropTypes.string,
            }).isRequired,
        }).isRequired,
    };
    WightDrawerProgress.defaultProps = {
        forwardedRef: undefined,
    };
    return React.forwardRef((props, ref) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <WightDrawerProgress {...props} forwardedRef={ref} />
    ));
}

export {
    withDrawerProgressPropTypes,
};
