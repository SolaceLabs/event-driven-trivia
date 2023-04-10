import { PropTypes } from 'prop-types';
import React, { useContext } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import Dashboard from '../Templates/Dashboard';
import {
  Category,
  NotFound,
  Question,
  Trivia,
  TriviaDashboard,
  LoginTrivia
} from '../pageListAsync';

import { AppContext } from './ThemeWrapper';

function Application(props) {
  const { history } = props;
  const changeMode = useContext(AppContext);

  return (
    <Dashboard history={history} changeMode={changeMode}>
      <Switch>
        <Route exact path="/app"><Redirect to="/app/trivia/dashboard" /> </Route>
        <Route exact path="/app/trivia"><Redirect to="/app/trivia/dashboard" /> </Route>
        <Route exact path="/app/trivia" component={TriviaDashboard} />
        <Route exact path="/app/trivia/dashboard" component={TriviaDashboard} />
        <Route exact path="/app/trivia/trivia" component={Trivia} />
        <Route exact path="/app/trivia/question" component={Question} />
        <Route exact path="/app/trivia/category" component={Category} />
        <Route component={NotFound} />
      </Switch>
    </Dashboard>
  );
}

Application.propTypes = {
  history: PropTypes.object.isRequired
};

export default Application;
