import { PropTypes } from 'prop-types';
import React, { useContext } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import DashboardTemplate from '../Templates/DashboardTemplate';
import {
  Member,
  Category,
  NotFound,
  Question,
  Trivia,
  Dashboard,
  Faq,
  LoginTrivia
} from '../pageListAsync';

import { AppContext } from './ThemeWrapper';
function Application(props) {
  const { history } = props;
  const changeMode = useContext(AppContext);
  const ts = localStorage.getItem('ts') ? localStorage.getItem('ts') : new Date().getTime();
  const expired = (new Date().getTime()) - ts < 86400000;
  return (
    <DashboardTemplate history={history} changeMode={changeMode}>
      <Switch>
        <Route exact path="/app"><Redirect to="/app/trivia/dashboard" /> </Route>
        <Route exact path="/app/trivia"><Redirect to="/app/trivia/dashboard" /> </Route>
        <Route exact path="/app/trivia" component={Dashboard} />
        <Route exact path="/app/trivia/dashboard" component={Dashboard} />
        <Route exact path="/app/trivia/trivia" component={Trivia} />
        <Route exact path="/app/trivia/question" component={Question} />
        <Route exact path="/app/trivia/category" component={Category} />
        <Route exact path="/app/trivia/member" component={Member} />
        <Route exact path="/app/trivia/faq" component={Faq} />
        <Route component={NotFound} />
      </Switch>
    </DashboardTemplate>
  );
}

Application.propTypes = {
  history: PropTypes.object.isRequired
};

export default Application;
