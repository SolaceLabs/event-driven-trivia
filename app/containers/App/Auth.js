import NotFound from 'containers/Pages/Standalone/NotFoundDedicated';
import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import Outer from '../Templates/Outer';
import {
  ComingSoon,
  LoginTrivia,
  LogoutTrivia,
  Maintenance,
  RegisterTrivia,
  ResetPasswordTrivia,
  AccountActivationTrivia,
} from '../pageListAsync';

function Auth() {
  return (
    <Outer>
      <Switch>
        <Route exact path="/"><Redirect to="/login" /> </Route>
        <Route path="/login" component={LoginTrivia} />
        <Route path="/logout" component={LogoutTrivia} />
        <Route path="/register" component={RegisterTrivia} />
        <Route path="/reset-password" component={ResetPasswordTrivia} />
        <Route path="/account-activation" component={AccountActivationTrivia} />
        <Route path="/maintenance" component={Maintenance} />
        <Route path="/coming-soon" component={ComingSoon} />
        <Route component={NotFound} />
      </Switch>
    </Outer>
  );
}

export default Auth;
