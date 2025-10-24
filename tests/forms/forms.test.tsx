import { OptionalDirectory } from "../../src/forms/OptionalDirectory";
import { OptionalBoolean } from "../../src/forms/OptionalBoolean";
import { LogDetailSelector } from "../../src/forms/LogDetailSelector";
import { RequiredBoolean } from "../../src/forms/RequiredBoolean";
import { isInvalidNumber, stateProperty, validateRequiredFields, valueToNumber } from "../../src/forms";
import { listToMultilineString, multilineStringToList, StringList } from "../../src/forms/StringList";
import { fireEvent, render } from "@testing-library/react";
import React from "react";
import { RequiredField } from "../../src/forms/RequiredField";
import { OptionalField } from "../../src/forms/OptionalField";
import { OptionalFieldNoLabel } from "../../src/forms/OptionalFieldNoLabel";
import { RequiredNumberField } from "../../src/forms/RequiredNumberField";
import { OptionalNumberField } from "../../src/forms/OptionalNumberField";
import { TimesOfDayList } from "../../src/forms/TimesOfDayList";
import { RequiredDirectory } from "../../src/forms/RequiredDirectory";
import { vi } from "vitest";
import PropTypes from "prop-types";
import { handleChange } from "../../src/forms";

// Mock component class to simulate React component behavior
export class MockComponent extends React.Component {
  state: { [key: string]: any } = {}; // Define state as class property
  _isTestComponent: boolean;
  handleChange: unknown;

  constructor(props) {
    super(props);
    this.handleChange = handleChange.bind(this);
    this._isTestComponent = true; // Mark this as a test component
  }

  setState(newState) {
    const mergedState = { ...this.state, ...newState };
    // For testing purposes, directly assign to state to avoid unmounted component warnings
    // eslint-disable-next-line react/no-direct-mutation-state
    this.state = mergedState;
    // Only call super.setState if this is not a test component
    if (!this._isTestComponent) {
      super.setState(mergedState);
    }
  }

  // Helper method for tests to set state without warnings
  setTestState(newState) {
    // eslint-disable-next-line react/no-direct-mutation-state
    this.state = { ...this.state, ...newState };
  }
}

// Test form component that uses all field types
export function TestFormComponent({ component }) {
  return (
    <form>
      {RequiredField(component, "Required Text", "requiredText")}
      {OptionalField(component, "Optional Text", "optionalText")}
      {OptionalFieldNoLabel(component, "", "noLabelField")}
      {RequiredNumberField(component, "Required Number", "requiredNumber")}
      {OptionalNumberField(component, "Optional Number", "optionalNumber")}
      {RequiredBoolean(component, "Required Boolean", "requiredBool")}
      {OptionalBoolean(component, "Optional Boolean", "optionalBool", "Choose option")}
      {LogDetailSelector(component, "logLevel")}
      {StringList(component, "stringList")}
      {TimesOfDayList(component, "timesOfDay")}
      {RequiredDirectory(component, "Required Dir", "requiredDir")}
      {OptionalDirectory(component, "Optional Dir", "optionalDir")}
    </form>
  );
}

TestFormComponent.propTypes = {
  component: PropTypes.object.isRequired,
};

describe("Forms Utility Functions", () => {
  let component;

  beforeEach(() => {
    component = new MockComponent({});
  });

  describe("validateRequiredFields", () => {
    it("should return true when all required fields are present", () => {
      component.setTestState({ field1: "value1", field2: "value2" });
      const result = validateRequiredFields(component, ["field1", "field2"]);
      expect(result).toBe(true);
    });

    it("should return false and set empty strings when required fields are missing", () => {
      component.setTestState({ field1: "value1" });
      const result = validateRequiredFields(component, ["field1", "field2"]);
      expect(result).toBe(false);
      expect(component.state.field2).toBe("");
    });

    it("should handle empty state", () => {
      const result = validateRequiredFields(component, ["field1"]);
      expect(result).toBe(false);
      expect(component.state.field1).toBe("");
    });
  });

  describe("stateProperty", () => {
    it("should return state value when present", () => {
      component.setTestState({ test: "value" });
      expect(stateProperty(component, "test")).toBe("value");
    });

    it("should return default value when property undefined", () => {
      expect(stateProperty(component, "missing")).toBe("");
      expect(stateProperty(component, "missing", "default")).toBe("");
    });

    it("should handle nested properties", () => {
      component.setTestState({ nested: { prop: "value" } });
      expect(stateProperty(component, "nested.prop")).toBe("value");
    });
  });

  describe("valueToNumber", () => {
    it("should return undefined for empty string", () => {
      expect(valueToNumber({ value: "" })).toBeUndefined();
    });

    it("should parse valid integers", () => {
      expect(valueToNumber({ value: "123" })).toBe(123);
    });

    it("should return string for invalid numbers", () => {
      expect(valueToNumber({ value: "abc" })).toBe("abc");
    });

    it("should handle zero", () => {
      expect(valueToNumber({ value: "0" })).toBe(0);
    });

    it("should handle decimal numbers by parsing integer part", () => {
      // parseInt("12.5") returns 12, not "12.5"
      expect(valueToNumber({ value: "12.5" })).toBe(12);
    });
  });

  describe("isInvalidNumber", () => {
    it("should return false for undefined or empty", () => {
      expect(isInvalidNumber(undefined)).toBe(false);
      expect(isInvalidNumber("")).toBe(false);
    });

    it("should return false for valid numbers", () => {
      expect(isInvalidNumber("123")).toBe(false);
      expect(isInvalidNumber("0")).toBe(false);
    });

    it("should return true for invalid numbers", () => {
      expect(isInvalidNumber("abc")).toBe(true);
      // Note: 12.5 is actually parsed as 12 by parseInt, so it's not invalid
      expect(isInvalidNumber("12.5")).toBe(false);
    });
  });
});

describe("StringList Component", () => {
  describe("listToMultilineString", () => {
    it("should convert array to multiline string", () => {
      expect(listToMultilineString(["line1", "line2", "line3"])).toBe("line1\nline2\nline3");
    });

    it("should return empty string for null/undefined", () => {
      expect(listToMultilineString(null)).toBe("");
      expect(listToMultilineString(undefined)).toBe("");
    });
  });

  describe("multilineStringToList", () => {
    it("should convert multiline string to array", () => {
      expect(multilineStringToList({ value: "line1\nline2\nline3" } as HTMLTextAreaElement)).toEqual([
        "line1",
        "line2",
        "line3",
      ]);
    });

    it("should return undefined for empty string", () => {
      expect(multilineStringToList({ value: "" } as HTMLTextAreaElement)).toBeUndefined();
    });
  });

  it("should render and handle changes", () => {
    const component = new MockComponent({});
    component.setTestState({ stringList: ["item1", "item2"] });

    const { container } = render(<div>{StringList(component, "stringList")}</div>);

    const textarea = container.querySelector('textarea[name="stringList"]')!;
    expect((textarea as HTMLTextAreaElement)!.value).toBe("item1\nitem2");

    fireEvent.change(textarea, { target: { value: "new1\nnew2\nnew3" } });
    expect(component.state.stringList).toEqual(["new1", "new2", "new3"]);
  });
});

describe("Form Field Components", () => {
  let component;

  beforeEach(() => {
    component = new MockComponent({});
  });

  describe("RequiredField", () => {
    it("should render with validation error when empty", () => {
      component.setTestState({ test: "" });
      const { container } = render(<div>{RequiredField(component, "Test Label", "test")}</div>);

      const input = container.querySelector('input[name="test"]')!;
      expect(input.classList.contains("is-invalid")).toBe(true);

      const label = container.querySelector("label")!;
      expect(label.classList.contains("required")).toBe(true);
      expect(label.textContent).toBe("Test Label");
    });

    it("should not show validation error when filled", () => {
      component.setTestState({ test: "value" });
      const { container } = render(<div>{RequiredField(component, "Test Label", "test")}</div>);

      const input = container.querySelector('input[name="test"]')!;
      expect(input.classList.contains("is-invalid")).toBe(false);
    });
  });

  describe("OptionalField", () => {
    it("should render without validation styling", () => {
      const { container } = render(<div>{OptionalField(component, "Optional Label", "optional")}</div>);

      const input = container.querySelector('input[name="optional"]')!;
      expect(input.classList.contains("is-invalid")).toBe(false);

      const label = container.querySelector("label")!;
      expect(label.classList.contains("required")).toBe(false);
    });
  });

  describe("OptionalFieldNoLabel", () => {
    it("should render without label", () => {
      const { container } = render(<div>{OptionalFieldNoLabel(component, "", "noLabel")}</div>);

      const label = container.querySelector("label");
      expect(label).toBeNull();
    });
  });

  describe("RequiredNumberField", () => {
    it("should show validation error for invalid numbers", () => {
      component.setTestState({ num: "abc" });
      const { container } = render(<div>{RequiredNumberField(component, "Number", "num")}</div>);

      const input = container.querySelector('input[name="num"]')!;
      expect(input.classList.contains("is-invalid")).toBe(true);
    });

    it("should not show error for valid numbers", () => {
      component.setTestState({ num: "123" });
      const { container } = render(<div>{RequiredNumberField(component, "Number", "num")}</div>);

      const input = container.querySelector('input[name="num"]')!;
      expect(input.classList.contains("is-invalid")).toBe(false);
    });
  });

  describe("OptionalNumberField", () => {
    it("should handle optional number validation", () => {
      component.setTestState({ optNum: "invalid" });
      const { container } = render(<div>{OptionalNumberField(component, "Optional Number", "optNum")}</div>);

      const input = container.querySelector('input[name="optNum"]')!;
      expect(input.classList.contains("is-invalid")).toBe(true);
    });

    it("should allow empty values", () => {
      component.setTestState({ optNum: "" });
      const { container } = render(<div>{OptionalNumberField(component, "Optional Number", "optNum")}</div>);

      const input = container.querySelector('input[name="optNum"]')!;
      expect(input.classList.contains("is-invalid")).toBe(false);
    });
  });

  describe("RequiredBoolean", () => {
    it("should render checkbox with correct state", () => {
      component.setTestState({ bool: true });
      const { container } = render(<div>{RequiredBoolean(component, "Boolean Field", "bool")}</div>);

      const checkbox = container.querySelector('input[type="checkbox"]')! as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    it("should handle checkbox changes", () => {
      const { container } = render(<div>{RequiredBoolean(component, "Boolean Field", "bool")}</div>);

      const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
      fireEvent.click(checkbox);
      expect(component.state.bool).toBe(true);
    });
  });

  describe("OptionalBoolean", () => {
    it("should render select with three options", () => {
      const { container } = render(<div>{OptionalBoolean(component, "Optional Bool", "optBool", "Default")}</div>);

      const select = container.querySelector("select") as HTMLSelectElement;
      const options = select.querySelectorAll("option");
      expect(options).toHaveLength(3);
      expect(options[0].textContent).toBe("Default");
      expect(options[1].textContent).toBe("yes");
      expect(options[2].textContent).toBe("no");
    });

    it("should handle value changes", () => {
      const { container } = render(<div>{OptionalBoolean(component, "Optional Bool", "optBool", "Default")}</div>);

      const select = container.querySelector("select") as HTMLSelectElement;
      fireEvent.change(select, { target: { value: "true" } });
      expect(component.state.optBool).toBe(true);

      fireEvent.change(select, { target: { value: "false" } });
      expect(component.state.optBool).toBe(false);
    });
  });

  describe("LogDetailSelector", () => {
    it("should render with proper options", () => {
      const { container } = render(<div>{LogDetailSelector(component, "logLevel")}</div>);

      const select = container.querySelector("select") as HTMLSelectElement;
      const options = select.querySelectorAll("option");
      expect(options.length).toBeGreaterThan(10);
      expect(options[0].textContent).toBe("(inherit from parent)");
    });

    it("should handle numeric values", () => {
      const { container } = render(<div>{LogDetailSelector(component, "logLevel")}</div>);

      const select = container.querySelector("select") as HTMLSelectElement;
      fireEvent.change(select, { target: { value: "5" } });
      expect(component.state.logLevel).toBe(5);
    });
  });

  describe("TimesOfDayList", () => {
    it("should handle valid time format", () => {
      component.setTestState({
        times: [
          { hour: 9, min: 30 },
          { hour: 17, min: 0 },
        ],
      });
      const { container } = render(<div>{TimesOfDayList(component, "times")}</div>);

      const textarea = container.querySelector('textarea[name="times"]') as HTMLTextAreaElement;
      expect(textarea!.value).toBe("9:30\n17:00");
    });

    it("should parse time strings correctly", () => {
      const { container } = render(<div>{TimesOfDayList(component, "times")}</div>);

      const textarea = container.querySelector('textarea[name="times"]') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: "09:30\n17:00\ninvalid" } });

      expect(component.state.times).toEqual([{ hour: 9, min: 30 }, { hour: 17, min: 0 }, "invalid"]);
    });
  });

  describe("Directory Components", () => {
    it("should render RequiredDirectory with validation", () => {
      component.setTestState({ dir: "" });
      const { container } = render(<div>{RequiredDirectory(component, "Required Dir", "dir")}</div>);

      const input = container.querySelector('input[name="dir"]')!;
      expect(input.classList.contains("is-invalid")).toBe(true);

      const label = container.querySelector("label")!;
      expect(label.classList.contains("required")).toBe(true);
    });

    it("should render OptionalDirectory without validation", () => {
      const { container } = render(<div>{OptionalDirectory(component, "Optional Dir", "dir")}</div>);

      const input = container.querySelector('input[name="dir"]')!;
      expect(input.classList.contains("is-invalid")).toBe(false);
    });

    it("should not show button when kopiaUI is not available", () => {
      const { container } = render(<div>{RequiredDirectory(component, "Dir", "dir")}</div>);

      const button = container.querySelector("button");
      expect(button).toBeNull();
    });

    it("should show button when kopiaUI is available", () => {
      // Mock window.kopiaUI
      const mockSelectDirectory = vi.fn();
      (globalThis.window as unknown as { kopiaUI }).kopiaUI = { selectDirectory: mockSelectDirectory };

      const { container } = render(<div>{RequiredDirectory(component, "Dir", "dir")}</div>);

      const button = container.querySelector("button");
      expect(button).toBeTruthy();

      // Clean up
      delete (globalThis.window as unknown as { kopiaUI }).kopiaUI;
    });
  });
});

describe("Integrated Form Component", () => {
  let component;

  beforeEach(() => {
    component = new MockComponent({});
  });

  it("should render all field types together", () => {
    const { getByTestId, container } = render(<TestFormComponent component={component} />);

    // Test that all form fields render
    expect(getByTestId("control-requiredText")).toBeTruthy();
    expect(getByTestId("control-optionalText")).toBeTruthy();
    expect(getByTestId("control-requiredNumber")).toBeTruthy();
    expect(getByTestId("control-optionalNumber")).toBeTruthy();
    expect(getByTestId("control-requiredBool")).toBeTruthy();
    expect(getByTestId("control-requiredDir")).toBeTruthy();
    expect(getByTestId("control-optionalDir")).toBeTruthy();

    // Test specific elements without testid
    expect(container.querySelector('select[name="optionalBool"]')).toBeTruthy();
    expect(container.querySelector('select[name="logLevel"]')).toBeTruthy();
    expect(container.querySelector('textarea[name="stringList"]')).toBeTruthy();
    expect(container.querySelector('textarea[name="timesOfDay"]')).toBeTruthy();
  });

  it("should handle state changes across all field types", () => {
    const { getByTestId, container } = render(<TestFormComponent component={component} />);

    // Test text fields
    fireEvent.change(getByTestId("control-requiredText"), { target: { value: "test value" } });
    expect(component.state.requiredText).toBe("test value");

    fireEvent.change(getByTestId("control-optionalText"), { target: { value: "optional value" } });
    expect(component.state.optionalText).toBe("optional value");

    // Test number fields
    fireEvent.change(getByTestId("control-requiredNumber"), { target: { value: "123" } });
    expect(component.state.requiredNumber).toBe(123);

    fireEvent.change(getByTestId("control-optionalNumber"), { target: { value: "456" } });
    expect(component.state.optionalNumber).toBe(456);

    // Test boolean field
    fireEvent.click(getByTestId("control-requiredBool"));
    expect(component.state.requiredBool).toBe(true);

    // Test select fields
    const optionalBoolSelect = container.querySelector('select[name="optionalBool"]')!;
    fireEvent.change(optionalBoolSelect, { target: { value: "true" } });
    expect(component.state.optionalBool).toBe(true);

    const logLevelSelect = container.querySelector('select[name="logLevel"]')!;
    fireEvent.change(logLevelSelect, { target: { value: "5" } });
    expect(component.state.logLevel).toBe(5);

    // Test textarea fields
    const stringListTextarea = container.querySelector('textarea[name="stringList"]')!;
    fireEvent.change(stringListTextarea, { target: { value: "item1\nitem2" } });
    expect(component.state.stringList).toEqual(["item1", "item2"]);

    const timesTextarea = container.querySelector('textarea[name="timesOfDay"]')!;
    fireEvent.change(timesTextarea, { target: { value: "09:30\n17:00" } });
    expect(component.state.timesOfDay).toEqual([
      { hour: 9, min: 30 },
      { hour: 17, min: 0 },
    ]);
  });

  it("should validate required fields correctly", () => {
    const requiredFields = ["requiredText", "requiredNumber", "requiredDir"];

    // Initially all required fields should fail validation
    expect(validateRequiredFields(component, requiredFields)).toBe(false);

    // Fill in all required fields
    component.setTestState({
      requiredText: "filled",
      requiredNumber: 123,
      requiredDir: "/some/path",
    });

    expect(validateRequiredFields(component, requiredFields)).toBe(true);
  });

  it("should handle complex state with nested properties", () => {
    component.setTestState({
      nested: {
        deep: {
          value: "test",
        },
      },
    });

    expect(stateProperty(component, "nested.deep.value")).toBe("test");
    expect(stateProperty(component, "nested.missing", "default")).toBe("");
  });

  it("should handle edge cases in number validation", () => {
    const testCases = [
      { input: "", expected: undefined },
      { input: "0", expected: 0 },
      { input: "123", expected: 123 },
      { input: "abc", expected: "abc" },
      { input: "12.5", expected: 12 }, // parseInt parses this as 12
    ];

    testCases.forEach(({ input, expected }) => {
      expect(valueToNumber({ value: input })).toBe(expected);
    });
  });
});
