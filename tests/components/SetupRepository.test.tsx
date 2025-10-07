import { findByTestId, render, waitFor, act } from "@testing-library/react";
import React from "react";
import { SetupRepository } from "../../src/components/SetupRepository";
import { setupAPIMock } from "../testutils/api-mocks";
import { fireEvent } from "@testing-library/react";

// Mockup for the server
let serverMock;

// Initialize the server mock before each test
beforeEach(() => {
  serverMock = setupAPIMock();
});

it("can create new repository when not initialized", async () => {
  // first attempt to connect says - NOT_INITIALIZED
  serverMock
    .onPost("/api/v1/repo/exists", {
      storage: { type: "filesystem", config: { path: "some-path" } },
    })
    .reply(400, {
      code: "NOT_INITIALIZED",
      error: "repository not initialized",
    });

  // second attempt to create is success.
  serverMock
    .onPost("/api/v1/repo/create", {
      storage: { type: "filesystem", config: { path: "some-path" } },
      password: "foo",
      options: {
        blockFormat: { hash: "h-bar", encryption: "e-baz" },
        objectFormat: { splitter: "s-foo" },
      },
    })
    .reply(200, {});

  const { getByTestId, container } = await act(() => render(<SetupRepository />));

  fireEvent.click(getByTestId("provider-filesystem"));

  fireEvent.change(await findByTestId(container, "control-path"), { target: { value: "some-path" } });
  await act(() => fireEvent.click(getByTestId("submit-button")));

  fireEvent.change(await findByTestId(container, "control-password"), { target: { value: "foo" } });

  fireEvent.click(getByTestId("submit-button"));
  await waitFor(() => serverMock.history.post.length == 1);
  fireEvent.change(await findByTestId(container, "control-encryption"), { target: { value: "e-baz" } });
  fireEvent.change(getByTestId("control-splitter"), { target: { value: "s-foo" } });
  fireEvent.change(getByTestId("control-hash"), { target: { value: "h-bar" } });
  fireEvent.change(getByTestId("control-confirmPassword"), { target: { value: "foo" } });

  fireEvent.click(getByTestId("submit-button"));
  await waitFor(() => serverMock.history.post.length == 2);
});

it("can connect to existing repository when already initialized", async () => {
  // first attempt to connect is immediately successful.
  serverMock
    .onPost("/api/v1/repo/exists", {
      storage: { type: "filesystem", config: { path: "some-path" } },
    })
    .reply(200, {});

  const { getByTestId, container } = await act(() => render(<SetupRepository />));
  fireEvent.click(getByTestId("provider-filesystem"));
  fireEvent.change(await findByTestId(container, "control-path"), { target: { value: "some-path" } });
  await act(() => fireEvent.click(getByTestId("submit-button")));
  fireEvent.change(await findByTestId(container, "control-password"), { target: { value: "foo" } });

  await act(() => fireEvent.click(getByTestId("submit-button")));
  await waitFor(() => serverMock.history.post.length == 1);
});

it("can connect to existing repository using token", async () => {
  serverMock
    .onPost("/api/v1/repo/connect", {
      token: "my-token",
    })
    .reply(200, {});

  const { getByTestId, container } = await act(() => render(<SetupRepository />));
  fireEvent.click(getByTestId("provider-_token"));
  fireEvent.change(await findByTestId(container, "control-token"), { target: { value: "my-token" } });

  await act(() => fireEvent.click(getByTestId("submit-button")));
  await waitFor(() => serverMock.history.post.length == 1);
});
