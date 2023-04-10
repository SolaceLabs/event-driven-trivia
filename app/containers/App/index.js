import { PropTypes } from 'prop-types';
import React from 'react';
import {
  Route,
  Router,
  Switch,
  Redirect
} from 'react-router-dom';
import {
  NotFound
} from '../pageListAsync';
import Application from './Application';
import Auth from './Auth';
import ThemeWrapper from './ThemeWrapper';

window.__MUI_USE_NEXT_TYPOGRAPHY_VARIANTS__ = true;

function App(props) {
  const { history } = props;
  return (
    <ThemeWrapper>
      <Router history={history}>
        <Switch>
          <Route path="/app" component={Application} />
          <Route component={Auth} />
          <Route component={NotFound} />
        </Switch>
      </Router>
    </ThemeWrapper>
  );
}

App.propTypes = {
  history: PropTypes.object.isRequired,
};

export default App;
