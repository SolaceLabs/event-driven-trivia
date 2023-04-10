import React, { useEffect, useState } from 'react';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import { NavLink } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import brand from 'enl-api/fireball/brand';
import logo from 'enl-images/fireball-logo.svg';
import Type from 'enl-styles/Typography.scss';
import { injectIntl, FormattedMessage } from 'react-intl';
import messages from './messages';
import styles from './user-jss';

function LogoutForm(props) {
  const {
    history,
    classes,
    onSubmit,
    onCancel
  } = props;

  const handleCancel = () => {
    onCancel();
  };

  const handleSubmit = (values) => {
    onSubmit(values);
  };

  return (
    <section>
      <div className={Type.textCenter}>
        <NavLink to="/" className={classNames(classes.brand, classes.centerFlex)}>
          <img src={logo} alt={brand.name} />
          {brand.name}
        </NavLink>
      </div>
      <Paper className={classes.paperWrap}>
        <Typography variant="h4" className={classNames(classes.title, Type.textCenter)} gutterBottom>
          <FormattedMessage {...messages.logoutTitle} />
        </Typography>
        <Typography variant="caption" component="p" className={classes.subtitle} gutterBottom align="center">
          <FormattedMessage {...messages.logoutSubtitle} />
        </Typography>
        <div className={classes.btnArea}>
          <Button variant="contained" color="primary" type="button" onClick={() => handleSubmit()}>
            <FormattedMessage {...messages.logoutConfirmButton} />
          </Button>
          <Button variant="contained" color="secondary" type="button" onClick={() => handleCancel()} >
            <FormattedMessage {...messages.logoutCancelButton} />
          </Button>
        </div>
      </Paper>
    </section>
  );
}

export default withStyles(styles)(LogoutForm);
