/// <reference types="jest" />

import {isAccountDeactivatedError} from '../moderation';
import {launchGoogleAuthBrowserFlow} from '../googleAuth';
import {launchAppleSignIn} from '../appleAuth';

describe('isAccountDeactivatedError', () => {
  it('detects ACCOUNT_INACTIVE code', () => {
    expect(
      isAccountDeactivatedError({
        status: 403,
        code: 'ACCOUNT_INACTIVE',
        message: 'nope',
      }),
    ).toBe(true);
  });

  it('detects deactivated message on 403', () => {
    expect(
      isAccountDeactivatedError({
        status: 403,
        message: 'This account has been deactivated.',
      }),
    ).toBe(true);
  });

  it('ignores unrelated auth errors', () => {
    expect(
      isAccountDeactivatedError({
        status: 401,
        message: 'invalid email or password',
      }),
    ).toBe(false);
    expect(
      isAccountDeactivatedError({
        status: 400,
        code: 'TERMS_REQUIRED',
        message: 'you must accept the Terms of Use to continue',
      }),
    ).toBe(false);
  });
});

describe('auth terms gate', () => {
  it('blocks Google browser auth when terms are not accepted', async () => {
    const result = await launchGoogleAuthBrowserFlow(false);
    expect(result).toEqual({
      kind: 'error',
      message: 'Please accept the Terms of Use to continue.',
    });
  });

  it('blocks Apple sign-in when terms are not accepted', async () => {
    const result = await launchAppleSignIn(false);
    expect(result.kind).toBe('error');
    if (result.kind === 'error') {
      expect(result.message).toBe('Please accept the Terms of Use to continue.');
    }
  });
});
