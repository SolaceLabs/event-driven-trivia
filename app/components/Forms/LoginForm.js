import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import { NavLink } from 'react-router-dom';
import Hidden from '@material-ui/core/Hidden';
import { Field, reduxForm } from 'redux-form';
import Button from '@material-ui/core/Button';
import { connect } from 'react-redux';
import IconButton from '@material-ui/core/IconButton';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import InputAdornment from '@material-ui/core/InputAdornment';
import Typography from '@material-ui/core/Typography';
import FormControl from '@material-ui/core/FormControl';
import TriviaWrapper from 'enl-api/trivia/TriviaWrapper';
import ArrowForward from '@material-ui/icons/ArrowForward';
import Paper from '@material-ui/core/Paper';
import Icon from '@material-ui/core/Icon';
import CircularProgress from '@material-ui/core/CircularProgress';
import brand from 'enl-api/fireball/brand';
import logo from 'enl-images/fireball-logo.svg';
import { injectIntl, FormattedMessage } from 'react-intl';
import { closeMsgAction } from 'enl-redux/actions/authActions';
import { CheckboxRedux, TextFieldRedux } from './ReduxFormMUI';
import MessagesForm from './MessagesForm';
import messages from './messages';
import styles from './user-jss';

// validation functions
const required = value => (value === null ? 'Required' : undefined);
const email = value => (
  value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)
    ? 'Invalid email'
    : undefined
);

const LinkBtn = React.forwardRef(function LinkBtn(props, ref) { // eslint-disable-line
  return <NavLink to={props.to} {...props} innerRef={ref} />; // eslint-disable-line
});

const api = new TriviaWrapper();

function LoginForm(props) {
  const {
    classes,
    handleSubmit,
    pristine,
    submitting,
    intl,
    messagesAuth,
    closeMsg,
    loading,
    errorType,
    updateResult
  } = props;
  const [resendConfirmation, setResendConfirmation] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = event => event.preventDefault();
  const emailInput = useRef();

  const resendVerificationLink = async () => {
    const response = await api.resendVerification({ email: emailInput.current.value });
    if (!response.success) {
      updateResult('error', response.message);
      return;
    }

    updateResult('success', 'Email verification is sent to registered email address');
  };

  return (
    <Paper className={classes.sideWrap}>
      <Hidden mdUp>
        <div className={classes.headLogo}>
          <NavLink to="/" className={classes.brand}>
            <img src={logo} alt={brand.name} />
            {brand.name}
          </NavLink>
        </div>
      </Hidden>
      <div className={classes.topBar}>
        <Typography variant="h4" className={classes.title}>
          <FormattedMessage {...messages.login} />
        </Typography>
        <Button size="small" className={classes.buttonLink} component={LinkBtn} to="/register">
          <Icon className={classNames(classes.icon, classes.signArrow)}>arrow_forward</Icon>
          <FormattedMessage {...messages.createNewAccount} />
        </Button>
      </div>
      {
        messagesAuth !== null || ''
          ? (
            <MessagesForm
              variant="error"
              className={classes.msgUser}
              message={messagesAuth}
              onClose={closeMsg}
            />
          )
          : ''
      }
      <section className={classes.pageFormSideWrap}>
        <form onSubmit={handleSubmit}>
          <div>
            <FormControl className={classes.formControl}>
              <Field
                name="email"
                ref={emailInput}
                component={TextFieldRedux}
                placeholder={intl.formatMessage(messages.loginFieldEmail)}
                label={intl.formatMessage(messages.loginFieldEmail)}
                required
                validate={[required, email]}
                className={classes.field}
              />
            </FormControl>
          </div>
          <div>
            <FormControl className={classes.formControl}>
              <Field
                name="password"
                component={TextFieldRedux}
                type={showPassword ? 'text' : 'password'}
                label={intl.formatMessage(messages.loginFieldPassword)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="Toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                required
                validate={required}
                className={classes.field}
              />
            </FormControl>
          </div>
          <div className={classes.optArea}>
            <Button size="small" component={LinkBtn} to="/reset-password" className={classes.buttonLink}>
              <FormattedMessage {...messages.loginForgotPassword} />
            </Button>
            {errorType === 'Email not verified'
            && <Button size="small" color='#ec407a' className={classes.buttonLink} onClick={resendVerificationLink}>
              <FormattedMessage {...messages.resendVerificationLink} />
            </Button>}
          </div>
          <div className={classes.btnArea}>
            <Button variant="contained" disabled={loading} fullWidth color="primary" size="large" type="submit">
              {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
              <FormattedMessage {...messages.loginButtonContinue} />
              {!loading && <ArrowForward className={classNames(classes.rightIcon, classes.iconSmall, classes.signArrow)} disabled={submitting || pristine} />}
            </Button>
          </div>
          {resendConfirmation
          && <div className={classes.optArea}>
            <FormattedMessage {...messages.resentVerificationLink} />
          </div>}
        </form>
      </section>
    </Paper>
  );
}

LoginForm.propTypes = {
  classes: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  pristine: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
  intl: PropTypes.object.isRequired,
  messagesAuth: PropTypes.string,
  loading: PropTypes.bool,
  closeMsg: PropTypes.func.isRequired,
};

LoginForm.defaultProps = {
  messagesAuth: null,
  loading: false
};

const LoginFormReduxed = reduxForm({
  form: 'loginForm',
  enableReinitialize: true,
})(LoginForm);

const mapDispatchToProps = {
  closeMsg: closeMsgAction
};

const mapStateToProps = state => ({
  messagesAuth: state.authReducer.message,
  loading: state.authReducer.loading
});

const LoginFormMapped = connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginFormReduxed);

export default withStyles(styles)(injectIntl(LoginFormMapped));
