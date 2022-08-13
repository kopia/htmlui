import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

export function setupAPIMock() {
    let axiosMock = new MockAdapter(axios);
    axiosMock.reset();

    axiosMock.onGet("/api/v1/repo/algorithms").reply(200, {
        defaultEncryption: "e-bar",
        encryption: [{"id":"e-foo"}, {"id":"e-bar"}, {"id":"e-baz"}],

        defaultEcc: "ecc-bar",
        ecc: [{"id":"ecc-foo"}, {"id":"ecc-bar"}, {"id":"ecc-baz"}],

        defaultSplitter: "s-bar",
        splitter: [{"id":"s-foo"}, {"id":"s-bar"}, {"id":"s-baz"}],

        defaultHash: "h-bar",
        hash: [{"id":"h-foo"}, {"id":"h-bar"}, {"id":"h-baz"}],

        compression: [{"id":"c-foo"}, {"id":"c-bar"}, {"id":"c-baz", "deprecated": true}],
    });

    axiosMock.onGet("/api/v1/current-user").reply(200, {
        username: "someuser",
        hostname: "somehost",
    });

    return axiosMock;
}
