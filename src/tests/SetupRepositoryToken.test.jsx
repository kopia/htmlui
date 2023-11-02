import { render, act } from '@testing-library/react';
import React from 'react';
import { SetupRepositoryToken } from '../components/SetupRepositoryToken';
import { changeControlValue } from './testutils';

it('can set fields', async () => {
  let ref = React.createRef();
  const { getByTestId } = render(<SetupRepositoryToken ref={ref} />)

  act(()=>expect(ref.current.validate()).toBe(false));
  // required
  changeControlValue(getByTestId("control-token"), "some-token");
  expect(ref.current.validate()).toBe(true);

  expect(ref.current.state).toStrictEqual({
    "token": "some-token",
  });
});
