import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { Field, reduxForm } from 'redux-form';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import ArrowForward from '@material-ui/icons/ArrowForward';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import brand from 'enl-api/fireball/brand';
import logo from 'enl-images/fireball-logo.svg';
import Type from 'enl-styles/Typography.scss';
import { injectIntl, FormattedMessage } from 'react-intl';
import { closeMsgAction } from 'enl-redux/actions/authActions';
import Grid from '@material-ui/core/Grid';
import { TextField } from '@material-ui/core';
import { TextFieldRedux } from './ReduxFormMUI';
import MessagesForm from './MessagesForm';
import messages from './messages';
import styles from './user-jss';

// validation functions
const required = value => (value === null ? 'Required' : undefined);
const passwordsMatch = (value, allValues) => {
  if (value !== allValues.password) {
    return 'Passwords dont match';
  }
  return undefined;
};

function ResetPasswordForm(props) {
  const {
    classes,
    handleSubmit,
    pristine,
    submitting,
    intl,
    messagesAuth,
    closeMsg,
    email
  } = props;

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
          <FormattedMessage {...messages.resetTitle} />
        </Typography>
        <section className={classes.formWrap}>
          <form onSubmit={handleSubmit}>
            <div>
              <Typography variant="caption" component="p" className={classes.subtitle} gutterBottom align="center">
                <b>Email:</b> {email}
              </Typography>
            </div>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl className={classes.formControl}>
                  <Field
                    name="password"
                    component={TextFieldRedux}
                    type="password"
                    label={intl.formatMessage(messages.loginFieldPassword)}
                    required
                    validate={[required, passwordsMatch]}
                    className={classes.field}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl className={classes.formControl}>
                  <Field
                    name="passwordConfirm"
                    component={TextFieldRedux}
                    type="password"
                    label={intl.formatMessage(messages.loginFieldRetypePassword)}
                    required
                    validate={[required, passwordsMatch]}
                    className={classes.field}
                  />
                </FormControl>
              </Grid>
            </Grid>

            <div className={classes.btnArea}>
              <Button variant="contained" color="primary" type="submit">
                <FormattedMessage {...messages.resetButton} />
                <ArrowForward className={classNames(classes.rightIcon, classes.iconSmall, classes.signArrow)} disabled={submitting || pristine} />
              </Button>
            </div>
          </form>
        </section>
      </Paper>
    </section>
  );
}

ResetPasswordForm.propTypes = {
  classes: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  pristine: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
  closeMsg: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired
};

const ResetPasswordFormReduxed = reduxForm({
  form: 'resetPasswordForm',
  enableReinitialize: true,
})(ResetPasswordForm);

const mapDispatchToProps = {
  closeMsg: closeMsgAction
};

const mapStateToProps = (state) => ({
  initialValues: {
    email: state.email
  }
});

const ResetPasswordFormMapped = connect(
  mapStateToProps,
  mapDispatchToProps
)(ResetPasswordFormReduxed);

export default withStyles(styles)(injectIntl(ResetPasswordFormMapped));
