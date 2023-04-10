import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import Icon from '@material-ui/core/Icon';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import ArrowForward from '@material-ui/icons/ArrowForward';
import classNames from 'classnames';
import brand from 'enl-api/fireball/brand';
import logo from 'enl-images/fireball-logo.svg';
import { closeMsgAction } from 'enl-redux/actions/authActions';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { Field, reduxForm } from 'redux-form';
import MessagesForm from './MessagesForm';
import { CheckboxRedux, TextFieldRedux } from './ReduxFormMUI';
import messages from './messages';
import styles from './user-jss';

// validation functions
const required = value => (value === null ? 'Required' : undefined);
const email = value => (
  value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)
    ? 'Invalid email'
    : undefined
);

const passwordsMatch = (value, allValues) => {
  if (value !== allValues.password) {
    return 'Passwords dont match';
  }
  return undefined;
};

const LinkBtn = React.forwardRef(function LinkBtn(props, ref) { // eslint-disable-line
  return <NavLink to={props.to} {...props} innerRef={ref} />; // eslint-disable-line
});

function RegisterForm(props) {
  const {
    classes,
    handleSubmit,
    pristine,
    submitting,
    intl,
    messagesAuth,
    closeMsg,
    loading
  } = props;

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
          <FormattedMessage {...messages.register} />
        </Typography>
        <Button size="small" className={classes.buttonLink} component={LinkBtn} to="/login">
          <Icon className={classNames(classes.icon, classes.signArrow)}>arrow_forward</Icon>
          <FormattedMessage {...messages.toAccount} />
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
      <section>
        <form onSubmit={handleSubmit}>
          <div>
            <FormControl className={classes.formControl}>
              <Field
                name="name"
                component={TextFieldRedux}
                placeholder={intl.formatMessage(messages.loginFieldName)}
                label={intl.formatMessage(messages.loginFieldName)}
                required
                className={classes.field}
              />
            </FormControl>
          </div>
          <div>
            <FormControl className={classes.formControl}>
              <Field
                name="email"
                component={TextFieldRedux}
                placeholder={intl.formatMessage(messages.loginFieldEmail)}
                label={intl.formatMessage(messages.loginFieldEmail)}
                required
                validate={[required, email]}
                className={classes.field}
              />
            </FormControl>
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
          <div>
            <FormControlLabel control={<Field name="checkbox" required component={CheckboxRedux} className={classes.agree} />} label={intl.formatMessage(messages.aggree)} />
            <a href="/terms-conditions" target="_blank" className={classes.link}>
              <FormattedMessage {...messages.terms} />
            </a>
          </div>
          <div className={classes.btnArea}>
            <Button variant="contained" fullWidth disabled={loading} color="primary" type="submit">
              {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
              <FormattedMessage {...messages.loginButtonContinue} />
              {!loading && <ArrowForward className={classNames(classes.rightIcon, classes.iconSmall, classes.signArrow)} disabled={submitting || pristine} />}
            </Button>
          </div>
        </form>
      </section>
      {/* <h5 className={classes.divider}>
        <span>
          <FormattedMessage {...messages.registerOr} />
        </span>
      </h5>
      <section className={classes.socmedSideLogin}>
        <Button
          variant="contained"
          className={classes.redBtn}
          type="button"
          size="large"
        >
          <i className="ion-logo-google" />
          Google
        </Button>
        <Button
          variant="contained"
          className={classes.cyanBtn}
          type="button"
          size="large"
        >
          <i className="ion-logo-twitter" />
          Twitter
        </Button>
        <Button
          variant="contained"
          className={classes.greyBtn}
          type="button"
          size="large"
        >
          <i className="ion-logo-github" />
          Github
        </Button>
      </section> */}
    </Paper>
  );
}

RegisterForm.propTypes = {
  classes: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  pristine: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
  intl: PropTypes.object.isRequired,
  messagesAuth: PropTypes.string,
  closeMsg: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

RegisterForm.defaultProps = {
  messagesAuth: null
};

const RegisterFormReduxed = reduxForm({
  form: 'registerForm',
  enableReinitialize: true,
})(RegisterForm);

const mapDispatchToProps = {
  closeMsg: closeMsgAction
};

const mapStateToProps = state => ({
  messagesAuth: state.authReducer.message,
  loading: state.authReducer.loading
});

const RegisterFormMapped = connect(
  mapStateToProps,
  mapDispatchToProps
)(RegisterFormReduxed);

export default withStyles(styles)(injectIntl(RegisterFormMapped));
