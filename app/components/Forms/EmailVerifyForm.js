import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { Field, reduxForm } from 'redux-form';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import brand from 'enl-api/fireball/brand';
import logo from 'enl-images/fireball-logo.svg';
import Type from 'enl-styles/Typography.scss';
import { injectIntl, FormattedMessage } from 'react-intl';
import { closeMsgAction } from 'enl-redux/actions/authActions';
import messages from './messages';
import styles from './user-jss';

function EmailVerifyForm(props) {
  const {
    classes,
    handleSubmit,
    pristine,
    submitting,
    intl,
    messagesAuth,
    closeMsg,
    loading,
    success,
    message,
    messageType,
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
          <FormattedMessage {...messages.emailVerificationTitle} />
        </Typography>
        <Typography variant="caption" component="p" className={classes.subtitle} gutterBottom align="center">
          <FormattedMessage {...messages.emailVerificationSubtitle} />
        </Typography>
        {messageType
        && <div color={messageType === 'error' ? '#ec407a' : 'primary'}>
          <br/>
          <Typography variant="caption" component="p" className={classes.subtitle} gutterBottom align="center">
            {message}
          </Typography>
        </div>}
      </Paper>
    </section>
  );
}

EmailVerifyForm.propTypes = {
  classes: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  pristine: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
  intl: PropTypes.object.isRequired,
  messagesAuth: PropTypes.string,
  closeMsg: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  message: PropTypes.string,
  messageType: PropTypes.string,
};

EmailVerifyForm.defaultProps = {
  message: null,
  messageType: null
};

const EmailVerifyFormReduxed = reduxForm({
  form: 'EmailVerifyForm',
  enableReinitialize: true,
})(EmailVerifyForm);

const mapDispatchToProps = {
  closeMsg: closeMsgAction
};

const mapStateToProps = state => ({
  messagesAuth: state.authReducer.message
});

const EmailVerifyFormMapped = connect(
  mapStateToProps,
  mapDispatchToProps
)(EmailVerifyFormReduxed);

export default withStyles(styles)(injectIntl(EmailVerifyFormMapped));
