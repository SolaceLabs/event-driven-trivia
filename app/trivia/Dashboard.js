import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import brand from 'enl-api/fireball/brand';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import { PapperBlock } from 'enl-components';
import DashboardCounter from './dashboard/DashboardCounter';
import UpcomingTrivias from './dashboard/UpcomingTrivias';
import SharedTrivias from './dashboard/SharedTrivias';
import SharedCategories from './dashboard/SharedCategories';

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
  });

  const title = 'Dashboard';
  const description = brand.desc;
  return (
    <div>
      <PapperBlock
        whiteBg
        icon="dashboard"
        title={title}
        // desc={description}
      >
        <Grid container className={classes.root}>
          <DashboardCounter />
        </Grid>
      </PapperBlock>
      <PapperBlock>
        <Grid className={classes.root}>
          <UpcomingTrivias />
        </Grid>
      </PapperBlock>
      <PapperBlock>
        <Grid className={classes.root}>
          <SharedTrivias />
        </Grid>
      </PapperBlock>
      {/* <PapperBlock>
        <Grid className={classes.root}>
          <SharedCategories />
        </Grid>
      </PapperBlock> */}
    </div>
  );
}

Dashboard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Dashboard);
