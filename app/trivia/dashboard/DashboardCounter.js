import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles, alpha } from '@material-ui/core/styles';
import QuestionAnswer from '@material-ui/icons/QuestionAnswer';
import LiveHelp from '@material-ui/icons/LiveHelp';
import Category from '@material-ui/icons/Category';
import TouchApp from '@material-ui/icons/TouchApp';
import Grid from '@material-ui/core/Grid';
import TriviaWrapper from 'enl-api/trivia/TriviaWrapper';
import Snackbar from '@material-ui/core/Snackbar';
import TileCounterWidget from './TileCounterWidget';
import SnackBarWrapper from '../common/SnackBarWrapper';

const styles = theme => ({
  rootCounter: {
    flexGrow: 1,
  },
  largeIcon: {
    fontSize: 64
  },
});

const api = new TriviaWrapper();

function DashboardCounter(props) {
  const { classes } = props;
  const [metrics, setMetrics] = useState({
    trivias: 'N/A', categories: 'N/A', questions: 'N/A', engagements: 'N/A'
  });
  const [openStyle, setOpen] = useState(false);
  const [variant, setVariant] = useState('');
  const [message, setMessage] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);

  const updateResult = React.useCallback((_variant, _message) => {
    console.log('updateResult called');
    setVariant(_variant);
    setMessage(_message);
    setOpen(true);
  });

  const handleCloseStyle = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  useEffect(async () => {
    const response = await api.getDashboardMetrics();
    if (!response.success) {
      setMetrics({
        trivias: 'N/A', categories: 'N/A', questions: 'N/A', engagements: 'N/A'
      });
      updateResult('error', response.message);
    } else {
      setMetrics(response.data);
      console.log('SharedTrivias', response.data);
    }
  }, [showDeleted]);

  return (
    <div className={classes.rootCounter}>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={openStyle}
        autoHideDuration={6000}
        onClose={() => handleCloseStyle()}
      >
        <SnackBarWrapper
          onClose={() => handleCloseStyle()}
          variant={variant}
          message={message}
          className={classes.margin}
        />
      </Snackbar>

      <Grid container spacing={2}>
        <Grid item md={3} xs={6}>
          <TileCounterWidget
            value={metrics.trivias}
            title={'Trivias'}
          >
            <QuestionAnswer className={classes.largeIcon} />
          </TileCounterWidget>
        </Grid>
        <Grid item md={3} xs={6}>
          <TileCounterWidget
            value={metrics.categories}
            title={'Categories'}
          >
            <Category className={classes.largeIcon} />
          </TileCounterWidget>
        </Grid>
        <Grid item md={3} xs={6}>
          <TileCounterWidget
            value={metrics.questions}
            title={'Questions'}
          >
            <LiveHelp className={classes.largeIcon} />
          </TileCounterWidget>
        </Grid>
        <Grid item md={3} xs={6}>
          <TileCounterWidget
            value={metrics.engagements}
            title={'Engagement'}
          >
            <TouchApp className={classes.largeIcon} />
          </TileCounterWidget>
        </Grid>
      </Grid>
    </div>
  );
}

DashboardCounter.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(DashboardCounter);
