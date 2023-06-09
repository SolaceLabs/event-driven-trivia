import React, { useState } from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import RemoveRedEyeIcon from '@material-ui/icons/RemoveRedEye';
import AddIcon from '@material-ui/icons/AddSharp';
import RefreshIcon from '@material-ui/icons/RefreshSharp';
import { withStyles } from '@material-ui/core/styles';

const defaultToolbarStyles = {
  iconButton: {
  },
};

function CategoriesCustomToolbar(props) {
  const {
    classes, openModal, refreshCategories, showDeleted, toggleDeleted
  } = props;

  return (
    <React.Fragment>
      <Tooltip title={'Add Category'}>
        <IconButton className={classes.iconButton} onClick={() => { openModal(); }} >
          <AddIcon className={classes.deleteIcon}/>
        </IconButton>
      </Tooltip>
      <Tooltip title={ showDeleted ? 'Show Active Categories' : 'Show Deleted Categories'}>
        <IconButton className={classes.iconButton} onClick={() => { toggleDeleted(); }} >
          {showDeleted
            && <RemoveRedEyeIcon className={classes.deleteIcon}/>}
          {!showDeleted
            && <VisibilityOffIcon className={classes.deleteIcon}/>}
        </IconButton>
      </Tooltip>
      <Tooltip title={'Refresh Categories'}>
        <IconButton className={classes.iconButton} onClick={() => { refreshCategories(); }} >
          <RefreshIcon className={classes.deleteIcon}/>
        </IconButton>
      </Tooltip>
    </React.Fragment>
  );
}

CategoriesCustomToolbar.propTypes = {
  openModal: PropTypes.func.isRequired,
  refreshCategories: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired
};

export default withStyles(defaultToolbarStyles, { name: 'CategoriesCustomToolbar' })(CategoriesCustomToolbar);
