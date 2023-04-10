import React from 'react';
import PropTypes from 'prop-types';
import { withStyles, alpha } from '@material-ui/core/styles';

import Grid from '@material-ui/core/Grid';
import {
  BarChart, Bar,
  AreaChart, Area,
  LineChart, Line,
} from 'recharts';
import AssignmentReturned from '@material-ui/icons/AssignmentReturned';
import { injectIntl } from 'react-intl';
import TileCounterWidget from './TileCounterWidget';
import styles from '../styles/widget-jss';

export const data1 = [
  {
    name: 'Page A',
    uv: 4000,
    pv: 2400,
    amt: 2400
  },
  {
    name: 'Page B',
    uv: 3000,
    pv: 1398,
    amt: 2210
  },
  {
    name: 'Page C',
    uv: 2000,
    pv: 9800,
    amt: 2290
  },
  {
    name: 'Page D',
    uv: 2780,
    pv: 3908,
    amt: 2000
  },
  {
    name: 'Page E',
    uv: 1890,
    pv: 4800,
    amt: 2181
  },
];

function DashboardCounter(props) {
  const { classes, intl, theme } = props;
  return (
    <div className={classes.rootCounter}>
      <Grid container spacing={2}>
        <Grid item md={3} xs={6}>
          <TileCounterWidget
            color="secondary-dark"
            start={0}
            end={20}
            duration={3}
            title={'Monthly'}
            unitBefore="$ "
            unitAfter="k"
          >
            <AssignmentReturned className={classes.counterIcon} />
          </TileCounterWidget>
        </Grid>
        <Grid item md={3} xs={6}>
          <TileCounterWidget
            color="secondary-main"
            start={0}
            end={20}
            duration={3}
            title={'Weekly'}
          >
            <BarChart width={100} height={40} data={data1}>
              <Bar dataKey="uv" fill={theme.palette.secondary.main} />
            </BarChart>
          </TileCounterWidget>
        </Grid>
        <Grid item md={3} xs={6}>
          <TileCounterWidget
            color="secondary-main"
            start={0}
            end={321}
            duration={3}
            title={'New Customers'}
          >
            <AreaChart width={100} height={60} data={data1}>
              <Area type="monotone" dataKey="uv" stroke={theme.palette.secondary.main} fill={alpha(theme.palette.secondary.main, 0.5)} />
            </AreaChart>
          </TileCounterWidget>
        </Grid>
        <Grid item md={3} xs={6}>
          <TileCounterWidget
            color="secondary-main"
            start={0}
            end={82}
            duration={3}
            title={'Active Users'}
          >
            <LineChart width={100} height={80} data={data1}>
              <Line type="monotone" dataKey="pv" stroke={theme.palette.secondary.main} strokeWidth={2} />
            </LineChart>
          </TileCounterWidget>
        </Grid>
      </Grid>
    </div>
  );
}

DashboardCounter.propTypes = {
  classes: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(injectIntl(DashboardCounter));
