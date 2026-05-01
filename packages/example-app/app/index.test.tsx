import { fireEvent, render } from "@testing-library/react-native";

import App from "../App";

describe("example app", () => {
  it("renders the settings screen with stable Agent UI IDs", () => {
    const screen = render(<App />);

    expect(screen.getByTestId("example.home.scroll")).toBeTruthy();
    expect(screen.getByTestId("example.home.runtime.form")).toBeTruthy();
    expect(screen.getByPlaceholderText("Project name")).toBeTruthy();
    expect(screen.getByPlaceholderText("Pairing token")).toBeTruthy();
    expect(
      screen.getByRole("switch", { name: "Enable runtime bridge" })
    ).toBeTruthy();
    expect(screen.getByTestId("example.home.automation.confidence")).toBeTruthy();
    expect(screen.getByTestId("example.home.session.mode")).toBeTruthy();
    expect(screen.getByTestId("example.home.retry.count")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Run primitive example" })
    ).toBeTruthy();
  });

  it("exposes accessibility metadata for control primitives", () => {
    const screen = render(<App />);

    const toggle = screen.getByRole("switch", {
      name: "Enable runtime bridge"
    });
    expect(toggle.props.accessibilityState).toEqual({
      checked: false,
      disabled: false
    });

    const slider = screen.getByTestId("example.home.automation.confidence");
    expect(slider.props.accessibilityRole).toBe("adjustable");
    expect(slider.props.accessibilityValue).toEqual({
      max: 100,
      min: 0,
      now: 75,
      text: "75%"
    });

    const localOption = screen.getByTestId("example.home.session.mode.local");
    const cloudOption = screen.getByTestId("example.home.session.mode.cloud");
    expect(localOption.props.accessibilityRole).toBe("radio");
    expect(localOption.props.accessibilityState).toEqual({
      checked: true,
      disabled: false,
      selected: true
    });

    fireEvent.press(cloudOption);
    expect(
      screen.getByTestId("example.home.session.mode.cloud").props
        .accessibilityState
    ).toEqual({
      checked: true,
      disabled: false,
      selected: true
    });

    const stepper = screen.getByTestId("example.home.retry.count");
    expect(stepper.props.accessibilityRole).toBe("adjustable");
    expect(stepper.props.accessibilityValue).toEqual({
      max: 5,
      min: 0,
      now: 2,
      text: "2"
    });

    fireEvent.press(screen.getByTestId("example.home.retry.count.increment"));
    expect(
      screen.getByTestId("example.home.retry.count").props.accessibilityValue
    ).toEqual({
      max: 5,
      min: 0,
      now: 3,
      text: "3"
    });
  });
});
