import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

const styles = theme => ({
  demo: {
    height: 'auto',
  },
  divider: {
    margin: `${theme.spacing(3)}px 0`,
  },
  field: {
    margin: `${theme.spacing(3)}px 5px`,
  },
  button: {
    margin: theme.spacing(1),
  },
  doMoreButton: {
    margin: theme.spacing(1),
    color: theme.palette.text.main,
    backgroundColor: '#fafafa',
  },
  inputUpload: {
    display: 'none',
  },
  leftIcon: {
    marginRight: theme.spacing(1),
  },
  rightIcon: {
    marginLeft: theme.spacing(1),
  },
  iconSmall: {
    fontSize: 20,
  },
});

const MembersShowHelp = (props) => {
  const { classes } = props;

  return (
    <Button className={classes.doMoreButton} variant="contained" color="primary" onClick={() => props.setShow(prev => !prev)}>
      Do More
    </Button>
  );
};

MembersShowHelp.propTypes = {
  classes: PropTypes.object.isRequired,
  setShow: PropTypes.func
};

export default withStyles(styles)(MembersShowHelp);
