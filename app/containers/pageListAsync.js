/* eslint-disable */

import Loading from 'enl-components/Loading';
import React from 'react';
import loadable from '../utils/loadable';

// Trivia Auth
export const LoginTrivia = loadable(() =>import ('../trivia/users/LoginTrivia'), {
  fallback: <Loading />,
});
export const LogoutTrivia = loadable(() =>import ('../trivia/users/LogoutTrivia'), {
  fallback: <Loading />,
});
export const RegisterTrivia = loadable(() => import ('../trivia/users/RegisterTrivia'), {
  fallback: <Loading />,
});
export const ResetPasswordTrivia = loadable(() => import ('../trivia/users/ResetPasswordTrivia'), {
  fallback: <Loading />,
});
export const AccountActivationTrivia = loadable(() => import ('../trivia/users/AccountActivationTrivia'), {
  fallback: <Loading />,
});

// Trivia Question Category
export const TriviaDashboard = loadable(() => import ('../trivia/Dashboard'), {
  fallback: <Loading />,
});
export const Trivia = loadable(() => import ('../trivia/Trivia'), {
  fallback: <Loading />,
});
export const Category = loadable(() => import('../trivia/Category'), {
  fallback: <Loading />,
});
export const Question = loadable(() => import('../trivia/Question'), {
  fallback: <Loading />,
});
export const Member = loadable(() => import('../trivia/Member'), {
  fallback: <Loading />,
});

export const ComingSoon = loadable(() =>
  import ('./Pages/ComingSoon'), {
    fallback: <Loading />,
  });
export const BlankPage = loadable(() =>
  import ('./Pages/BlankPage'), {
    fallback: <Loading />,
  });
export const NotFound = loadable(() =>
  import ('./NotFound/NotFound'), {
    fallback: <Loading />,
  });
export const Error = loadable(() =>
  import ('./Pages/Error'), {
    fallback: <Loading />,
  });
export const Maintenance = loadable(() =>
  import ('./Pages/Maintenance'), {
    fallback: <Loading />,
  });
export const Parent = loadable(() =>
  import ('./Parent'), {
    fallback: <Loading />,
  });