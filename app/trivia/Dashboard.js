import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import brand from 'enl-api/fireball/brand';
import { Helmet } from 'react-helmet';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import { PapperBlock } from 'enl-components';
import Snackbar from '@material-ui/core/Snackbar';
import DashboardCounter from './dashboard/DashboardCounter';
import UpcomingTrivias from './dashboard/UpcomingTrivias';
import SnackBarWrapper from './common/SnackBarWrapper';

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  rootGeneral: {
    padding: theme.spacing(3)
  },
  divider: {
    margin: `${theme.spacing(1.5)}px 0`,
    background: 'none',
    display: 'block',
  },
  sliderWrap: {
    position: 'relative',
    display: 'block',
    boxShadow: theme.shadows[1],
    width: '100%',
    borderRadius: theme.rounded.medium,
    overflow: 'hidden'
  },
  noPadding: {
    paddingTop: '0 !important',
    paddingBottom: '0 !important',
    [theme.breakpoints.up('sm')]: {
      padding: '0 !important'
    }
  }
});

function Dashboard(props) {
  const { classes, history } = props;
  useEffect(() => {
    if (localStorage.getItem('token') === null) history.push('/login');
  }, []);

  const [openStyle, setOpen] = useState(false);
  const [variant, setVariant] = useState('');
  const [message, setMessage] = useState('');

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

  const title = 'Trivia Dashboard';
  const description = brand.desc;
  return (
    <div>
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
      <PapperBlock
        whiteBg
        icon="table_chart"
        title={title}
        desc={description}
      >
        <Grid container className={classes.root}>
          < DashboardCounter />
        </Grid>
      </PapperBlock>
      <PapperBlock>
        <UpcomingTrivias />
      </PapperBlock>
    </div>
  );
}

Dashboard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Dashboard);
