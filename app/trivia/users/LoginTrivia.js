import Hidden from '@material-ui/core/Hidden';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import brand from 'enl-api/fireball/brand';
import TriviaWrapper from 'enl-api/trivia/TriviaWrapper';
import { LoginForm } from 'enl-components';
import logo from 'enl-images/fireball-logo.svg';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { NavLink } from 'react-router-dom';
import Snackbar from '@material-ui/core/Snackbar';
import styles from '../../components/Forms/user-jss';
import SnackBarWrapper from '../common/SnackBarWrapper';

const scope = 'boilerplate.containers.Users';
const messages = {
  welcomeTitle: {
    id: `${scope}.Welcome.title`,
    defaultMessage: 'Welcome to',
  },
  welcomeSubtitle: {
    id: `${scope}.Welcome.subtitle`,
    defaultMessage: 'Please sign in to continue',
  },
  greetingTitle: {
    id: `${scope}.Greeting.title`,
    defaultMessage: 'Hi...nice to meet you',
  },
  greetingSubtitle: {
    id: `${scope}.Greeting.subtitle`,
    defaultMessage: 'Register to create and host a Fireball Trivia',
  },
};

const api = new TriviaWrapper();

function LoginTrivia(props) {
  const { classes, history } = props;
  useEffect(() => {
    if (localStorage.getItem('token') !== null) history.push('/app/trivia/dashboard');
  }, []);

  const title = brand.name + ' - Login';
  const description = brand.desc;
  const [variant, setVariant] = useState('');
  const [message, setMessage] = useState('');
  const [openStyle, setOpen] = useState(false);
  const [errorType, setErrorType] = useState(false);

  const updateResult = React.useCallback((_variant, _message) => {
    console.log('updateResult called');
    setVariant(_variant);
    setMessage(_message);
    setOpen(true);
  });

  const submitForm = async (values) => {
    console.log(`You submitted:\n\n${values.email}`); // eslint-disable-line
    const response = await api.login(values);
    if (!response.success) {
      setErrorType(response.type);
      updateResult('error', response.message);
      return;
    }

    updateResult('info', response.message);
    localStorage.setItem('token', response.token);
    localStorage.setItem('name', response.name);
    localStorage.setItem('id', response.id);
    localStorage.setItem('ts', response.ts);
    setTimeout(() => {
      history.push('/app/trivia/dashboard');
    }, 1000);
  };

  const handleCloseStyle = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return (
    <div className={classes.rootFull}>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={openStyle}
        autoHideDuration={6000}
        onClose={() => handleCloseStyle()}
      >
        <SnackBarWrapper
          onClose={() => handleCloseStyle()}
          variant={variant}
          message={message}
          className={classes.margin}
        />
      </Snackbar>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
      </Helmet>
      <div className={classes.containerSide}>
        <Hidden smDown>
          <div className={classes.opening}>
            <div className={classes.openingWrap}>
              <div className={classes.openingHead}>
                <NavLink to="/" className={classes.brand}>
                  <img src={logo} alt={brand.name} />
                  {brand.name}
                </NavLink>
              </div>
              <Typography variant="h3" component="h1" gutterBottom>
                <FormattedMessage {...messages.welcomeTitle} />
                &nbsp;
                {brand.name}
              </Typography>
              <Typography variant="h6" component="p" className={classes.subpening}>
                <FormattedMessage {...messages.welcomeSubtitle} />
              </Typography>
            </div>
          </div>
        </Hidden>
        <div className={classes.sideFormWrap}>
          <LoginForm updateResult={updateResult} errorType={errorType} onSubmit={(values) => submitForm(values)} />
        </div>
      </div>
    </div>
  );
}

LoginTrivia.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(LoginTrivia);
