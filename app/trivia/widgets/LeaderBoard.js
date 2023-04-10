import Chip from '@material-ui/core/Chip';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import FilterCenterFocus from '@material-ui/icons/FilterCenterFocus';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import '../styles/widget-jss';

const styles = theme => ({
  widgetBox: {
    padding: 10,
    boxShadow: '4px 4px 4px 1px rgba(0, 0, 0, 0.2)'
  },
  gridCenter: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartFluid: {
    width: '100%',
    minWidth: 500,
    // height: 200,
    // minHeight: 350
  },
  rechartsLegendWrapper: {
    width: '100%',
  },
  rechartsText: {
    fontSize: 11,
    fill: '#0c46c3',
  },
  darkMode: {
    fill: '#ededed'
  },
  // rechartsText: {
  //   fill: '#ededed'
  // },
  lightMode: {
    fill: '#0c46c3',
  },
  // rechartsText: {
  //   fill: '#0c46c3',
  // },
  rechartsLegendItemText: {
    fontSize: 12,
  },
  leaderName: {
    fontSize: '0.75rem',
    marginRight: 15
  },
  boardTitle: {
    color: '#0c46c3'
  },
  leaderChip: {
    color: 'white',
    backgroundColor: '#0c46c3'
  },
  leaderLine: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leaderScore: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  leaderRow: {
    marginTop: 15
  },
  chip: {
    margin: theme.spacing(1),
  },
});

const LeaderBoard = (props) => {
  const {
    classes,
  } = props;

  return (
    <div style={{ height: 400 }}>
      <Grid container spacing={3} >
        <Grid item xs={12}>
          <Typography className={classNames(classes.smallTitle, classes.boardTitle)} variant="button">
            <FilterCenterFocus className={classes.leftIcon} />
            Leader Board
          </Typography>
          <Divider className={classes.divider} />
          <div style={{ marginTop: 15 }}>
            <ul className={classes.secondaryWrap}>
              <li className={classes.leaderRow}>
                <div className={classes.leaderLine}>
                  <span className={classes.leaderLine}>
                    <Chip label="1" size="small" className={classNames(classes.chip, classes.leaderChip)} color="primary" />
                    <Typography gutterBottom className={classes.leaderName}>Finish 100 task</Typography>
                  </span>
                  <Chip label={<span>10 / 10&nbsp;&nbsp;&nbsp;<b>747</b></span>}
                    size="small" variant="outlined" className={classNames(classes.chip, classes.leaderChip)} color="primary" />
                </div>
                <LinearProgress
                  variant="determinate" className={classNames(classes.progress, classes.leaderLinearLine)} value={24} />
              </li>
              <li className={classes.leaderRow}>
                <div className={classes.leaderLine}>
                  <span className={classes.leaderLine}>
                    <Chip label="2" size="small" className={classNames(classes.chip, classes.leaderChip)} color="primary" />
                    <Typography gutterBottom className={classes.leaderName}>Finish 100 task</Typography>
                  </span>
                  <Chip label={<span>2 / 10&nbsp;&nbsp;&nbsp;<b>47</b></span>}
                    size="small" variant="outlined" className={classNames(classes.chip, classes.leaderChip)} color="primary" />
                </div>
                <LinearProgress variant="determinate" className={classNames(classes.progress, classes.purpleProgress)} value={89} />
              </li>
              <li className={classes.leaderRow}>
                <Typography gutterBottom className={classes.leaderName}>Get less than 10 complaint</Typography>
                <LinearProgress variant="determinate" className={classNames(classes.progress, classes.orangeProgress)} value={78} />
              </li>
              <li className={classes.leaderRow}>
                <Typography gutterBottom className={classes.leaderName}>Upload 5 videos or articles</Typography>
                <LinearProgress variant="determinate" className={classNames(classes.progress, classes.greenProgress)} value={55} />
              </li>
              <li className={classes.leaderRow}>
                <Typography gutterBottom className={classes.leaderName}>Completing profile</Typography>
                <LinearProgress variant="determinate" className={classNames(classes.progress, classes.blueProgress)} value={80} />
              </li>
              <li className={classes.leaderRow}>
                <Typography gutterBottom className={classes.leaderName}>Completing profile</Typography>
                <LinearProgress variant="determinate" className={classNames(classes.progress, classes.blueProgress)} value={80} />
              </li>
              <li className={classes.leaderRow}>
                <Typography gutterBottom className={classes.leaderName}>Completing profile</Typography>
                <LinearProgress variant="determinate" className={classNames(classes.progress, classes.blueProgress)} value={80} />
              </li>
              <li className={classes.leaderRow}>
                <Typography gutterBottom className={classes.leaderName}>Completing profile</Typography>
                <LinearProgress variant="determinate" className={classNames(classes.progress, classes.blueProgress)} value={80} />
              </li>
              <li className={classes.leaderRow}>
                <Typography gutterBottom className={classes.leaderName}>Completing profile</Typography>
                <LinearProgress variant="determinate" className={classNames(classes.progress, classes.blueProgress)} value={80} />
              </li>
              <li className={classes.leaderRow}>
                <Typography gutterBottom className={classes.leaderName}>Completing profile</Typography>
                <LinearProgress variant="determinate" className={classNames(classes.progress, classes.blueProgress)} value={80} />
              </li>
              <li className={classes.leaderRow}>
                <Typography gutterBottom className={classes.leaderName}>Completing profile</Typography>
                <LinearProgress variant="determinate" className={classNames(classes.progress, classes.blueProgress)} value={80} />
              </li>
              <li className={classes.leaderRow}>
                <Typography gutterBottom className={classes.leaderName}>Completing profile</Typography>
                <LinearProgress variant="determinate" className={classNames(classes.progress, classes.blueProgress)} value={80} />
              </li>
              <li className={classes.leaderRow}>
                <Typography gutterBottom className={classes.leaderName}>Completing profile</Typography>
                <LinearProgress variant="determinate" className={classNames(classes.progress, classes.blueProgress)} value={80} />
              </li>
              <li className={classes.leaderRow}>
                <Typography gutterBottom className={classes.leaderName}>Completing profile</Typography>
                <LinearProgress variant="determinate" className={classNames(classes.progress, classes.blueProgress)} value={80} />
              </li>
              <li className={classes.leaderRow}>
                <Typography gutterBottom className={classes.leaderName}>Completing profile</Typography>
                <LinearProgress variant="determinate" className={classNames(classes.progress, classes.blueProgress)} value={80} />
              </li>
              <li className={classes.leaderRow}>
                <Typography gutterBottom className={classes.leaderName}>Completing profile</Typography>
                <LinearProgress variant="determinate" className={classNames(classes.progress, classes.blueProgress)} value={80} />
              </li>
              <li className={classes.leaderRow}>
                <Typography gutterBottom className={classes.leaderName}>Completing profile</Typography>
                <LinearProgress variant="determinate" className={classNames(classes.progress, classes.blueProgress)} value={80} />
              </li>
            </ul>
          </div>
        </Grid>

      </Grid>
    </div>
  );
};

LeaderBoard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(LeaderBoard);
