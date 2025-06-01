import { render, act } from "@testing-library/react";
import React from "react";
import PropTypes from "prop-types";
import { StringList } from "../../src/forms/StringList";
import { changeControlValue } from "../testutils";
import { listToMultilineString, multilineStringToList } from "../../src/forms/StringList";

// Mock component to simulate the form component that would use StringList
class MockFormComponent extends React.Component {
  static propTypes = {
    fieldName: PropTypes.string.isRequired,
    initialState: PropTypes.object,
    props: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = props.initialState || {};
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event, valueGetter = (x) => x.value) {
    const name = event.target.name;
    const value = valueGetter(event.target);
    this.setState({ [name]: value });
  }

  render() {
    return StringList(this, this.props.fieldName, this.props.props);
  }
}

describe("listToMultilineString", () => {
  it("converts array to multiline string", () => {
    expect(listToMultilineString(["first", "second", "third"])).toBe("first\nsecond\nthird");
  });

  it("handles empty array", () => {
    expect(listToMultilineString([])).toBe("");
  });

  it("handles single item array", () => {
    expect(listToMultilineString(["single"])).toBe("single");
  });

  it("handles undefined input", () => {
    expect(listToMultilineString(undefined)).toBe("");
  });

  it("handles null input", () => {
    expect(listToMultilineString(null)).toBe("");
  });

  it("handles array with empty strings", () => {
    expect(listToMultilineString(["first", "", "third"])).toBe("first\n\nthird");
  });
});

describe("multilineStringToList", () => {
  it("converts multiline string to array", () => {
    const target = { value: "first\nsecond\nthird" };
    expect(multilineStringToList(target)).toEqual(["first", "second", "third"]);
  });

  it("returns undefined for empty string", () => {
    const target = { value: "" };
    expect(multilineStringToList(target)).toBeUndefined();
  });

  it("handles single line string", () => {
    const target = { value: "single line" };
    expect(multilineStringToList(target)).toEqual(["single line"]);
  });

  it("handles strings with empty lines", () => {
    const target = { value: "first\n\nthird" };
    expect(multilineStringToList(target)).toEqual(["first", "", "third"]);
  });

  it("handles strings with carriage returns", () => {
    const target = { value: "first\r\nsecond" };
    expect(multilineStringToList(target)).toEqual(["first\r", "second"]);
  });

  it("handles trailing newline", () => {
    const target = { value: "first\nsecond\n" };
    expect(multilineStringToList(target)).toEqual(["first", "second", ""]);
  });
});

describe("StringList component", () => {
  it("renders empty textarea when no value is set", () => {
    const { getByRole } = render(<MockFormComponent fieldName="testField" />);

    const textarea = getByRole("textbox");
    expect(textarea.value).toBe("");
    expect(textarea.name).toBe("testField");
  });

  it("displays existing string list values", () => {
    const initialState = {
      testField: ["item 1", "item 2", "item 3"],
    };

    const { getByRole } = render(<MockFormComponent fieldName="testField" initialState={initialState} />);

    const textarea = getByRole("textbox");
    expect(textarea.value).toBe("item 1\nitem 2\nitem 3");
  });

  it("handles onChange event and updates state", () => {
    let ref = React.createRef();
    const { getByRole } = render(<MockFormComponent ref={ref} fieldName="testField" />);

    const textarea = getByRole("textbox");

    act(() => {
      changeControlValue(textarea, "new item 1\nnew item 2");
    });

    expect(ref.current.state.testField).toEqual(["new item 1", "new item 2"]);
  });

  it("clears state when input is empty", () => {
    let ref = React.createRef();
    const initialState = {
      testField: ["existing", "items"],
    };

    const { getByRole } = render(<MockFormComponent ref={ref} fieldName="testField" initialState={initialState} />);

    const textarea = getByRole("textbox");

    act(() => {
      changeControlValue(textarea, "");
    });

    expect(ref.current.state.testField).toBeUndefined();
  });

  it("has correct textarea attributes", () => {
    const { getByRole } = render(<MockFormComponent fieldName="testField" />);

    const textarea = getByRole("textbox");
    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea.rows).toBe(5);
    expect(textarea.classList.contains("form-control-sm")).toBe(true);
  });

  it("passes additional props to Form.Control", () => {
    const props = {
      placeholder: "Enter items",
      disabled: true,
      "data-testid": "string-list-input",
      className: "custom-class",
    };

    const { getByTestId } = render(<MockFormComponent fieldName="testField" props={props} />);

    const textarea = getByTestId("string-list-input");
    expect(textarea.placeholder).toBe("Enter items");
    expect(textarea.disabled).toBe(true);
    expect(textarea.classList.contains("custom-class")).toBe(true);
  });

  it("handles component state updates", () => {
    let ref = React.createRef();
    const { getByRole } = render(
      <MockFormComponent ref={ref} fieldName="testField" initialState={{ testField: ["initial"] }} />,
    );

    let textarea = getByRole("textbox");
    expect(textarea.value).toBe("initial");

    // Update the component state
    act(() => {
      ref.current.setState({ testField: ["updated", "list"] });
    });

    textarea = getByRole("textbox");
    expect(textarea.value).toBe("updated\nlist");
  });

  it("handles nested field names via stateProperty", () => {
    const initialState = {
      nested: {
        field: ["nested", "value"],
      },
    };

    const { getByRole } = render(<MockFormComponent fieldName="nested.field" initialState={initialState} />);

    const textarea = getByRole("textbox");
    expect(textarea.value).toBe("nested\nvalue");
  });

  it("maintains proper Form.Group structure", () => {
    const { container } = render(<MockFormComponent fieldName="testField" />);

    const formGroup = container.querySelector(".col");
    expect(formGroup).toBeTruthy();
    expect(formGroup.querySelector("textarea.form-control")).toBeTruthy();
  });

  it("preserves whitespace in list items", () => {
    let ref = React.createRef();
    const { getByRole } = render(<MockFormComponent ref={ref} fieldName="testField" />);

    const textarea = getByRole("textbox");

    act(() => {
      changeControlValue(textarea, "  item with spaces  \n\ttabbed item\n normal item");
    });

    expect(ref.current.state.testField).toEqual(["  item with spaces  ", "\ttabbed item", " normal item"]);
  });
});
