import { withStyles } from '@material-ui/core/styles';
import brand from 'enl-api/fireball/brand';
import TriviaWrapper from 'enl-api/trivia/TriviaWrapper';
import classNames from 'classnames';
import { NavLink } from 'react-router-dom';
import logo from 'enl-images/fireball-logo.svg';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import Type from 'enl-styles/Typography.scss';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from 'react-intl';
import styles from '../../components/Forms/user-jss';
import messages from '../../components/Forms/messages';

const api = new TriviaWrapper();

function AccountActivationTrivia(props) {
  const {
    classes, history, msgType, msg
  } = props;

  const title = brand.name + ' - Account Activation';
  const description = brand.desc;
  const [result, setResult] = useState('');
  const [resultType, setResultType] = useState('');

  useEffect(async () => {
    const searchParams = new URLSearchParams(document.location.search);

    const response = await api.activateAccount({ token: searchParams.get('token') });
    if (!response.success) {
      setResultType('error');
      setResult(response.message);
    } else {
      setResultType('info');
      setResult(response.message);
      setTimeout(() => {
        history.push('/login');
      }, 2000);
    }
  }, []);

  return (
    <div className={classes.root}>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
      </Helmet>
      <div className={classes.container}>
        <div className={classes.userFormWrap}>
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
              {resultType
              && <Typography variant="caption" component="p"
                className={classNames(classes.subtitle, resultType === 'error' ? Type.textError : Type.textSuccess)}
                gutterBottom align="center">
                {result}
              </Typography>}
            </Paper>
          </section>
        </div>
      </div>
    </div>
  );
}

AccountActivationTrivia.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(AccountActivationTrivia);
