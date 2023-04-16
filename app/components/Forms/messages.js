/*
 * User Form Messages
 *
 * This contains all the text for the Form components.
 */
import { defineMessages } from 'react-intl';

export const scope = 'boilerplate.components.Forms';

export default defineMessages({
  createNewAccount: {
    id: `${scope}.Login.create`,
    defaultMessage: 'Create new account',
  },
  login: {
    id: `${scope}.Login.signin`,
    defaultMessage: 'Sign in',
  },
  loginOr: {
    id: `${scope}.Login.or`,
    defaultMessage: 'Or sign in with',
  },
  registerOr: {
    id: `${scope}.Register.or`,
    defaultMessage: 'Or register with',
  },
  loginFieldName: {
    id: `${scope}.Register.field.name`,
    defaultMessage: 'Your Name',
  },
  loginFieldEmail: {
    id: `${scope}.Login.field.email`,
    defaultMessage: 'Your Email',
  },
  loginFieldPassword: {
    id: `${scope}.Login.field.password`,
    defaultMessage: 'Your Password',
  },
  loginFieldRetypePassword: {
    id: `${scope}.Register.field.retypePassword`,
    defaultMessage: 'Re-type Password',
  },
  loginForgotPassword: {
    id: `${scope}.Login.field.forgot`,
    defaultMessage: 'Forgot Password',
  },
  resendVerificationLink: {
    id: `${scope}.Login.field.resend`,
    defaultMessage: 'Resend verification link',
  },
  resentVerificationLink: {
    id: `${scope}.Login.field.resent`,
    defaultMessage: 'Email verification is sent to registered email address, check your spam folders in case if you did not receive verification email',
  },
  loginRemember: {
    id: `${scope}.Login.field.remember`,
    defaultMessage: 'Remember',
  },
  loginButtonContinue: {
    id: `${scope}.Login.button.continue`,
    defaultMessage: 'Continue',
  },
  toAccount: {
    id: `${scope}.Register.create`,
    defaultMessage: 'Already have account ?',
  },
  register: {
    id: `${scope}.Register.signup`,
    defaultMessage: 'Register',
  },
  tabEmail: {
    id: `${scope}.Register.tab.email`,
    defaultMessage: 'With Email',
  },
  tabSocial: {
    id: `${scope}.Register.tab.social`,
    defaultMessage: 'With Social Media',
  },
  aggree: {
    id: `${scope}.Register.agree`,
    defaultMessage: 'Agree with',
  },
  terms: {
    id: `${scope}.Register.terms`,
    defaultMessage: 'Terms & Condition',
  },
  emailVerificationTitle: {
    id: `${scope}.Verify.title`,
    defaultMessage: 'Email Verification',
  },
  emailVerificationSubtitle: {
    id: `${scope}.Verify.subtitle`,
    defaultMessage: 'Verifying your email address...',
  },
  resetTitle: {
    id: `${scope}.Reset.title`,
    defaultMessage: 'Reset Password',
  },
  resetSubtitle: {
    id: `${scope}.Reset.subtitle`,
    defaultMessage: 'Send reset password link to Your email',
  },
  resetButton: {
    id: `${scope}.Reset.button`,
    defaultMessage: 'Send Reset Link',
  },
  logoutTitle: {
    id: `${scope}.Logout.title`,
    defaultMessage: 'Logout Fireball Trivia',
  },
  logoutSubtitle: {
    id: `${scope}.Logout.subtitle`,
    defaultMessage: 'Are you sure you ant to log out?',
  },
  logoutConfirmButton: {
    id: `${scope}.Logout.confirm.button`,
    defaultMessage: 'Yes, I will come back later!',
  },
  logoutCancelButton: {
    id: `${scope}.Logout.cancel.button`,
    defaultMessage: 'Ok, let me hang around some more time',
  },
  lockHint: {
    id: `${scope}.Lock.hint`,
    defaultMessage: 'Hint: Type anything to unlock!',
  },
  requiredForm: {
    id: `${scope}.Required.text`,
    defaultMessage: 'Required',
  },
});
