import { render, act } from "@testing-library/react";
import React from "react";
import PropTypes from "prop-types";
import { TimesOfDayList } from "../../src/forms/TimesOfDayList";
import { changeControlValue } from "../testutils";

// Mock component to simulate the form component that would use TimesOfDayList
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
    return TimesOfDayList(this, this.props.fieldName, this.props.props);
  }
}

describe("TimesOfDayList", () => {
  it("renders empty textarea when no times are set", () => {
    const { getByRole } = render(<MockFormComponent fieldName="testField" />);

    const textarea = getByRole("textbox");
    expect(textarea.value).toBe("");
  });

  it("displays existing times in multiline format", () => {
    const initialState = {
      testField: [
        { hour: 9, min: 30 },
        { hour: 15, min: 45 },
        { hour: 23, min: 0 },
      ],
    };

    const { getByRole } = render(<MockFormComponent fieldName="testField" initialState={initialState} />);

    const textarea = getByRole("textbox");
    expect(textarea.value).toBe("9:30\n15:45\n23:00");
  });

  it("displays raw string values for unparsed times", () => {
    const initialState = {
      testField: [{ hour: 9, min: 30 }, "invalid-time", { hour: 15, min: 45 }],
    };

    const { getByRole } = render(<MockFormComponent fieldName="testField" initialState={initialState} />);

    const textarea = getByRole("textbox");
    expect(textarea.value).toBe("9:30\ninvalid-time\n15:45");
  });

  it("parses valid time strings correctly", () => {
    let ref = React.createRef();
    const { getByRole } = render(<MockFormComponent ref={ref} fieldName="testField" />);

    const textarea = getByRole("textbox");

    act(() => {
      changeControlValue(textarea, "9:30\n15:45\n23:00");
    });

    expect(ref.current.state.testField).toEqual([
      { hour: 9, min: 30 },
      { hour: 15, min: 45 },
      { hour: 23, min: 0 },
    ]);
  });

  it("handles mixed valid and invalid time strings", () => {
    let ref = React.createRef();
    const { getByRole } = render(<MockFormComponent ref={ref} fieldName="testField" />);

    const textarea = getByRole("textbox");

    act(() => {
      changeControlValue(textarea, "9:30\ninvalid\n15:45\n25:00\n12:5");
    });

    expect(ref.current.state.testField).toEqual([
      { hour: 9, min: 30 },
      "invalid",
      { hour: 15, min: 45 },
      "25:00", // Invalid hour (>= 24)
      "12:5", // Invalid minute format (single digit)
    ]);
  });

  it("validates hour range (0-23)", () => {
    let ref = React.createRef();
    const { getByRole } = render(<MockFormComponent ref={ref} fieldName="testField" />);

    const textarea = getByRole("textbox");

    act(() => {
      changeControlValue(textarea, "0:00\n23:59\n24:00\n-1:00");
    });

    expect(ref.current.state.testField).toEqual([
      { hour: 0, min: 0 },
      { hour: 23, min: 59 },
      "24:00", // Invalid - hour >= 24
      { hour: 1, min: 0 }, // Regex captures "1:00" from "-1:00"
    ]);
  });

  it("validates minute range (0-59)", () => {
    let ref = React.createRef();
    const { getByRole } = render(<MockFormComponent ref={ref} fieldName="testField" />);

    const textarea = getByRole("textbox");

    act(() => {
      changeControlValue(textarea, "12:00\n12:59\n12:60\n12:-1");
    });

    expect(ref.current.state.testField).toEqual([
      { hour: 12, min: 0 },
      { hour: 12, min: 59 },
      "12:60", // Invalid - minute >= 60
      "12:-1", // Invalid - negative minute
    ]);
  });

  it("requires two-digit minute format for single digits", () => {
    let ref = React.createRef();
    const { getByRole } = render(<MockFormComponent ref={ref} fieldName="testField" />);

    const textarea = getByRole("textbox");

    act(() => {
      changeControlValue(textarea, "12:05\n12:5\n12:00\n12:9");
    });

    expect(ref.current.state.testField).toEqual([
      { hour: 12, min: 5 }, // Valid - two digits
      "12:5", // Invalid - single digit minute
      { hour: 12, min: 0 }, // Valid - 00 is two digits
      "12:9", // Invalid - single digit minute
    ]);
  });

  it("handles empty string input", () => {
    let ref = React.createRef();
    const { getByRole } = render(<MockFormComponent ref={ref} fieldName="testField" />);

    const textarea = getByRole("textbox");

    act(() => {
      changeControlValue(textarea, "");
    });

    expect(ref.current.state.testField).toBeUndefined();
  });

  it("handles whitespace and empty lines", () => {
    let ref = React.createRef();
    const { getByRole } = render(<MockFormComponent ref={ref} fieldName="testField" />);

    const textarea = getByRole("textbox");

    act(() => {
      changeControlValue(textarea, "9:30\n\n15:45\n   \n23:00");
    });

    expect(ref.current.state.testField).toEqual([
      { hour: 9, min: 30 },
      "",
      { hour: 15, min: 45 },
      "   ",
      { hour: 23, min: 0 },
    ]);
  });

  it("formats minutes with leading zeros in display", () => {
    const initialState = {
      testField: [
        { hour: 9, min: 5 },
        { hour: 12, min: 0 },
        { hour: 15, min: 30 },
      ],
    };

    const { getByRole } = render(<MockFormComponent fieldName="testField" initialState={initialState} />);

    const textarea = getByRole("textbox");
    expect(textarea.value).toBe("9:05\n12:00\n15:30");
  });

  it("preserves order of times", () => {
    let ref = React.createRef();
    const { getByRole } = render(<MockFormComponent ref={ref} fieldName="testField" />);

    const textarea = getByRole("textbox");

    act(() => {
      changeControlValue(textarea, "23:59\n00:01\n12:30\n06:15");
    });

    expect(ref.current.state.testField).toEqual([
      { hour: 23, min: 59 },
      { hour: 0, min: 1 },
      { hour: 12, min: 30 },
      { hour: 6, min: 15 },
    ]);
  });

  it("handles complex regex edge cases", () => {
    let ref = React.createRef();
    const { getByRole } = render(<MockFormComponent ref={ref} fieldName="testField" />);

    const textarea = getByRole("textbox");

    act(() => {
      changeControlValue(textarea, "1:2:3\n12:\n:30\n12:30:00\n12.30");
    });

    expect(ref.current.state.testField).toEqual([
      "1:2:3", // Invalid - matches regex but has extra number
      "12:", // Invalid - no minutes
      ":30", // Invalid - no hours
      { hour: 12, min: 30 }, // Valid - regex captures "12:30" from "12:30:00"
      "12.30", // Invalid - wrong separator
    ]);
  });

  it("passes through additional props to Form.Control", () => {
    const props = {
      placeholder: "Enter times",
      disabled: true,
      "data-testid": "times-input",
    };

    const { getByTestId } = render(<MockFormComponent fieldName="testField" props={props} />);

    const textarea = getByTestId("times-input");
    expect(textarea.placeholder).toBe("Enter times");
    expect(textarea.disabled).toBe(true);
  });

  it("has correct textarea attributes", () => {
    const { getByRole } = render(<MockFormComponent fieldName="testField" />);

    const textarea = getByRole("textbox");
    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea.rows).toBe(5);
    expect(textarea.name).toBe("testField");
  });

  it("displays validation feedback message", () => {
    const { container } = render(<MockFormComponent fieldName="testField" />);

    const feedback = container.querySelector(".invalid-feedback");
    expect(feedback).toBeTruthy();
    expect(feedback.textContent).toBe("Invalid Times of Day");
  });

  it("updates display when component state changes", () => {
    let ref = React.createRef();
    const { getByRole } = render(
      <MockFormComponent ref={ref} fieldName="testField" initialState={{ testField: [{ hour: 9, min: 30 }] }} />,
    );

    let textarea = getByRole("textbox");
    expect(textarea.value).toBe("9:30");

    // Update the component state and rerender
    act(() => {
      ref.current.setState({ testField: [{ hour: 15, min: 45 }] });
    });

    textarea = getByRole("textbox");
    expect(textarea.value).toBe("15:45");
  });
});
