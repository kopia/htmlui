import { render, act } from '@testing-library/react';
import React from 'react';
import { EmailNotificationMethod } from '../../components/notifications/EmailNotificationMethod';
import { changeControlValue } from '../testutils';

it('can set fields', async () => {
  let ref = React.createRef();
  const { getByTestId } = render(<EmailNotificationMethod ref={ref} />)

  act(() => expect(ref.current.validate()).toBe(false));
  // required
  changeControlValue(getByTestId("control-smtpServer"), "some-smtpServer");
  changeControlValue(getByTestId("control-smtpPort"), 25);
  changeControlValue(getByTestId("control-smtpUsername"), "some-username");
  changeControlValue(getByTestId("control-smtpPassword"), "some-password");
  changeControlValue(getByTestId("control-from"), "some-from@example.com");
  changeControlValue(getByTestId("control-to"), "some-to@example.com");
  expect(ref.current.validate()).toBe(true);
  // optional
  changeControlValue(getByTestId("control-smtpIdentity"), "some-identity");
  expect(ref.current.validate()).toBe(true);

  expect(ref.current.state).toStrictEqual({
    "smtpServer": "some-smtpServer",
    "smtpPort": 25,
    "smtpUsername": "some-username",
    "smtpPassword": "some-password",
    "smtpIdentity": "some-identity",
    "from": "some-from@example.com",
    "to": "some-to@example.com",
    "format": "txt",
  });
});
