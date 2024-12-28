import { render, act } from '@testing-library/react';
import React from 'react';
import { WebHookNotificationMethod } from '../../components/notifications/WebHookNotificationMethod';
import { changeControlValue } from '../testutils';

it('can set fields', async () => {
  let ref = React.createRef();
  const { getByTestId } = render(<WebHookNotificationMethod ref={ref} />)

  act(() => expect(ref.current.validate()).toBe(false));
  // required
  changeControlValue(getByTestId("control-endpoint"), "http://some-endpoint:12345");
  expect(ref.current.validate()).toBe(true);
  // optional
  changeControlValue(getByTestId("control-headers"), "some:header\nanother:header");
  expect(ref.current.validate()).toBe(true);

  expect(ref.current.state).toStrictEqual({
    "endpoint": "http://some-endpoint:12345",
    "method": "POST",
    "format": "txt",
    "headers": "some:header\nanother:header",
  });
});
