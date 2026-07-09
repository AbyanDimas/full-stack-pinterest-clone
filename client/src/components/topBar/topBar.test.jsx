import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import TopBar from "./topBar";

// Mock react-router
const mockNavigate = vi.fn();
vi.mock("react-router", () => ({
  useNavigate: () => mockNavigate,
}));

// Mock child components to isolate TopBar
vi.mock("../image/image", () => ({
  default: () => <div data-testid="mock-image">Mock Image</div>,
}));

vi.mock("../userButton/userButton", () => ({
  default: () => <div data-testid="mock-user-button">Mock User Button</div>,
}));

describe("TopBar Component", () => {
  it("renders correctly", () => {
    render(<TopBar />);
    expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();
    expect(screen.getByTestId("mock-image")).toBeInTheDocument();
    expect(screen.getByTestId("mock-user-button")).toBeInTheDocument();
  });

  it("handles search submission correctly", () => {
    render(<TopBar />);
    const input = screen.getByPlaceholderText("Search");
    const form = input.closest("form");

    // Type a query
    fireEvent.change(input, { target: { value: "cats" } });

    // Submit the form
    fireEvent.submit(form);

    // Should navigate to /search?search=cats
    expect(mockNavigate).toHaveBeenCalledWith("/search?search=cats");
  });
});
