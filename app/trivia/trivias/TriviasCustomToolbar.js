import React, { useState } from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import AddIcon from '@material-ui/icons/AddSharp';
import RefreshIcon from '@material-ui/icons/RefreshSharp';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import RemoveRedEyeIcon from '@material-ui/icons/RemoveRedEye';
import { withStyles } from '@material-ui/core/styles';

const defaultToolbarStyles = {
  iconButton: {
  },
};

function TriviasCustomToolbar(props) {
  const {
    classes, openModal, refreshTrivias, showDeleted, toggleDeleted
  } = props;

  return (
    <React.Fragment>
      <Tooltip title={'Add Trivia'}>
        <IconButton className={classes.iconButton} onClick={() => { openModal(); }} >
          <AddIcon className={classes.deleteIcon}/>
        </IconButton>
      </Tooltip>
      <Tooltip title={ showDeleted ? 'Hide Deleted' : 'Show Deleted'}>
        <IconButton className={classes.iconButton} onClick={() => { toggleDeleted(); }} >
          {showDeleted
            && <VisibilityOffIcon className={classes.deleteIcon}/>}
          {!showDeleted
            && <RemoveRedEyeIcon className={classes.deleteIcon}/>}
        </IconButton>
      </Tooltip>
      <Tooltip title={'Refresh Trivias'}>
        <IconButton className={classes.iconButton} onClick={() => { refreshTrivias(); }} >
          <RefreshIcon className={classes.deleteIcon}/>
        </IconButton>
      </Tooltip>
    </React.Fragment>
  );
}

TriviasCustomToolbar.propTypes = {
  openModal: PropTypes.func.isRequired,
  refreshTrivias: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired
};

export default withStyles(defaultToolbarStyles, { name: 'TriviasCustomToolbar' })(TriviasCustomToolbar);
