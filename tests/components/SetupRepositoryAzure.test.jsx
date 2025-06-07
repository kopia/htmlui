import { render, act } from "@testing-library/react";
import React from "react";
import { SetupRepositoryAzure } from "../../src/components/SetupRepositoryAzure";
import { fireEvent } from "@testing-library/react";

it("can set fields", async () => {
  let ref = React.createRef();
  const { getByTestId } = render(<SetupRepositoryAzure ref={ref} />);

  act(() => expect(ref.current.validate()).toBe(false));
  // required
  fireEvent.change(getByTestId("control-container"), { target: { value: "some-container" } });
  fireEvent.change(getByTestId("control-storageAccount"), { target: { value: "some-storageAccount" } });
  expect(ref.current.validate()).toBe(true);
  // optional
  fireEvent.change(getByTestId("control-storageKey"), { target: { value: "some-storageKey" } });
  fireEvent.change(getByTestId("control-sasToken"), { target: { value: "some-sas-token" } });
  fireEvent.change(getByTestId("control-storageDomain"), { target: { value: "some-storage-domain" } });
  fireEvent.change(getByTestId("control-prefix"), { target: { value: "some-prefix" } });
  expect(ref.current.validate()).toBe(true);

  expect(ref.current.state).toStrictEqual({
    storageAccount: "some-storageAccount",
    container: "some-container",
    prefix: "some-prefix",
    storageKey: "some-storageKey",
    sasToken: "some-sas-token",
    storageDomain: "some-storage-domain",
  });
});
