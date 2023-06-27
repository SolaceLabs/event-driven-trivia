import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';

const styles = theme => ({
  root: {
    flexGrow: 1,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 10,
    height: 190,
    marginBottom: 6,
    display: 'flex',
    [theme.breakpoints.up('sm')]: {
      height: 126,
      marginBottom: -1,
      alignItems: 'flex-end',
    },
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
    },
  },
  title: {
    color: theme.palette.common.white,
    fontSize: 14,
    [theme.breakpoints.up('sm')]: {
      fontSize: 16,
    },
    fontWeight: 400
  },
  counterYours: {
    color: theme.palette.secondary.main,
    fontSize: 28,
    fontWeight: 500
  },
  counterOverall: {
    color: theme.palette.secondary.main,
    fontSize: 18,
    fontWeight: 500
  },
  counter: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    height: '100%'
  },
  customContent: {
    color: theme.palette.secondary.main,
    textAlign: 'right'
  },
  tileColor: {
    background: '#e5f2f3',
    borderColor: theme.palette.secondary.main,
    '& $title, $counter': {
      color: theme.palette.secondary.main,
    }
  },
});

function TileCounterWidget(props) {
  const {
    classes,
    yours,
    overall,
    title,
    children,
  } = props;

  return (
    <Paper className={classNames(classes.root, classes.tileColor)}>
      <div className={classes.counter}>
        <Typography className={classes.counterYours}>
          {yours} <span className={classes.counterOverall}> / {overall} </span>
        </Typography>

        <Typography className={classes.title} variant="subtitle1">{title}</Typography>
      </div>
      <div className={classes.customContent}>
        {children}
      </div>
    </Paper>
  );
}

TileCounterWidget.propTypes = {
  classes: PropTypes.object.isRequired,
  value: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default withStyles(styles)(TileCounterWidget);
