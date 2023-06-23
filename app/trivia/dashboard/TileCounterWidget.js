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
  counter: {
    color: theme.palette.common.white,
    fontSize: 28,
    fontWeight: 500
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
    value,
    title,
    children,
  } = props;

  return (
    <Paper className={classNames(classes.root, classes.tileColor)}>
      <div>
        <Typography className={classes.counter}>
          {value}
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
