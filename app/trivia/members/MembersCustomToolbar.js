import React, { useState } from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import RemoveRedEyeIcon from '@material-ui/icons/RemoveRedEye';
import RefreshIcon from '@material-ui/icons/RefreshSharp';
import { withStyles } from '@material-ui/core/styles';

const defaultToolbarStyles = {
  iconButton: {
  },
};

function MembersCustomToolbar(props) {
  const {
    classes, refreshMembers, showDeleted, toggleDeleted
  } = props;

  return (
    <React.Fragment>
      <Tooltip title={ showDeleted ? 'Show Active Members' : 'Show Deleted Members'}>
        <IconButton className={classes.iconButton} onClick={() => { toggleDeleted(); }} >
          {showDeleted
            && <RemoveRedEyeIcon className={classes.deleteIcon}/>}
          {!showDeleted
            && <VisibilityOffIcon className={classes.deleteIcon}/>}
        </IconButton>
      </Tooltip>
      <Tooltip title={'Refresh Members'}>
        <IconButton className={classes.iconButton} onClick={() => { refreshMembers(); }} >
          <RefreshIcon className={classes.deleteIcon}/>
        </IconButton>
      </Tooltip>
    </React.Fragment>
  );
}

MembersCustomToolbar.propTypes = {
  refreshMembers: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired
};

export default withStyles(defaultToolbarStyles, { name: 'MembersCustomToolbar' })(MembersCustomToolbar);
