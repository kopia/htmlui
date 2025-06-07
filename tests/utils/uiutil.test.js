import { toAlgorithmOption } from "../../src/utils/uiutil";

describe("toAlgorithmOption", () => {
  it("creates basic option element", () => {
    const algorithm = { id: "sha256" };
    const option = toAlgorithmOption(algorithm);
    expect(option.props.value).toBe("sha256");
    expect(option.props.children).toBe("sha256");
  });

  it("marks recommended algorithm", () => {
    const algorithm = { id: "sha256" };
    const option = toAlgorithmOption(algorithm, "sha256");
    expect(option.props.children).toBe("sha256 (RECOMMENDED)");
  });

  it("marks deprecated algorithm", () => {
    const algorithm = { id: "md5", deprecated: true };
    const option = toAlgorithmOption(algorithm);
    expect(option.props.children).toBe("md5 (NOT RECOMMENDED)");
  });
});
