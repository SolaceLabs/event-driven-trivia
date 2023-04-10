import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import AlarmIcon from '@material-ui/icons/Alarm';
import EmojiEventsIcon from '@material-ui/icons/EmojiEvents';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import PropTypes from 'prop-types';
import React from 'react';

import styles from '../styles/widget-jss';
import CounterWidget from './CounterWidget';

function MetricsWidget(props) {
  const { classes, data } = props;
  console.log('WIDGET   data', data);
  return (
    <div className={classes.rootCounterFull}>
      <Grid container spacing={2}>
        <Grid item xs={6} md={3}>
          <CounterWidget
            color="secondary-main"
            start={0}
            end={data.no_of_questions}
            duration={3}
            title={'Questions'}
          >
            <HelpOutlineIcon className={classes.counterIcon} />
          </CounterWidget>
        </Grid>
        <Grid item xs={6} md={3}>
          <CounterWidget
            color="secondary-main"
            start={0}
            end={data.time_limit}
            duration={3}
            title={'Time Limit (s)'}
          >
            <AlarmIcon className={classes.counterIcon} />
          </CounterWidget>
        </Grid>
        <Grid item xs={6} md={3}>
          <CounterWidget
            color="secondary-main"
            start={data.participants}
            // end={data.participants ? data.participants : 0}
            // duration={0}
            title={'Participants'}
          >
            <SupervisorAccountIcon className={classes.counterIcon} />
          </CounterWidget>
        </Grid>
        <Grid item xs={6} md={3}>
          <CounterWidget
            color="secondary-main"
            start={0}
            end={data.winners ? data.winners : 0}
            duration={3}
            title={'Winners'}
          >
            <EmojiEventsIcon className={classes.counterIcon} />
          </CounterWidget>
        </Grid>
      </Grid>
    </div>
  );
}

MetricsWidget.propTypes = {
  classes: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
};

export default withStyles(styles)(MetricsWidget);
