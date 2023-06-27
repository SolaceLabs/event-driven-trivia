import React, { useState } from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import AddIcon from '@material-ui/icons/AddSharp';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import RemoveRedEyeIcon from '@material-ui/icons/RemoveRedEye';
import PlaylistAddCheck from '@material-ui/icons/PlaylistAddCheck';
import RefreshIcon from '@material-ui/icons/RefreshSharp';
import { withStyles } from '@material-ui/core/styles';

const defaultToolbarStyles = {
  iconButton: {
  },
};

function QuestionsCustomToolbar(props) {
  const {
    classes, openModal, openFilterDialog, refreshQuestions, showDeleted, toggleDeleted
  } = props;

  return (
    <React.Fragment>
      <Tooltip title={'Add Question'}>
        <IconButton className={classes.iconButton} onClick={() => { openModal(); }} >
          <AddIcon className={classes.deleteIcon}/>
        </IconButton>
      </Tooltip>
      <Tooltip title={'Choose Categories'}>
        <IconButton className={classes.iconButton} onClick={() => { openFilterDialog(); }} >
          <PlaylistAddCheck className={classes.deleteIcon}/>
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
      <Tooltip title={'Refresh Questions'}>
        <IconButton className={classes.iconButton} onClick={() => { refreshQuestions(); }} >
          <RefreshIcon className={classes.deleteIcon}/>
        </IconButton>
      </Tooltip>
    </React.Fragment>
  );
}

QuestionsCustomToolbar.propTypes = {
  openModal: PropTypes.func.isRequired,
  refreshQuestions: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired
};

export default withStyles(defaultToolbarStyles, { name: 'QuestionsCustomToolbar' })(QuestionsCustomToolbar);
