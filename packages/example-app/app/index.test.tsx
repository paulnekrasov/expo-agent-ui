import { render } from "@testing-library/react-native";

import App from "../App";

describe("example app", () => {
  it("renders the settings screen with stable Agent UI IDs", () => {
    const screen = render(<App />);

    expect(screen.getByTestId("example.home.scroll")).toBeTruthy();
    expect(screen.getByTestId("example.home.runtime.form")).toBeTruthy();
    expect(screen.getByPlaceholderText("Project name")).toBeTruthy();
    expect(screen.getByPlaceholderText("Pairing token")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Run primitive example" })
    ).toBeTruthy();
  });
});
