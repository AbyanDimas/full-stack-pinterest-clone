import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import UserButton from "../../src/components/userButton/userButton";
import { BrowserRouter } from "react-router";
import apiRequest from "../../src/utils/apiRequest";

// Mock react-router
const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock apiRequest
vi.mock("../../src/utils/apiRequest", () => ({
  default: {
    post: vi.fn(),
  },
}));

// Mock Image component
vi.mock("../../src/components/image/image", () => ({
  default: ({ path, alt, className }) => (
    <img src={path} alt={alt} className={className} data-testid="mock-image" />
  ),
}));

// Mock auth store
let mockCurrentUser = null;
const mockRemoveCurrentUser = vi.fn();
vi.mock("../../src/utils/authStore", () => ({
  default: () => ({
    currentUser: mockCurrentUser,
    removeCurrentUser: mockRemoveCurrentUser,
  }),
}));

describe("UserButton Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows login link when user is not logged in", () => {
    mockCurrentUser = null;
    render(
      <BrowserRouter>
        <UserButton />
      </BrowserRouter>,
    );
    expect(screen.getByText("Login / Sign Up")).toBeInTheDocument();
  });

  it("shows user avatar when user is logged in", () => {
    mockCurrentUser = { username: "johndoe", img: "/test-avatar.png" };
    render(
      <BrowserRouter>
        <UserButton />
      </BrowserRouter>,
    );

    // Check if the avatar image is rendered
    const images = screen.getAllByTestId("mock-image");
    expect(images[0]).toHaveAttribute("src", "/test-avatar.png");
  });

  it("toggles dropdown menu on click", () => {
    mockCurrentUser = { username: "johndoe", img: "/test-avatar.png" };
    render(
      <BrowserRouter>
        <UserButton />
      </BrowserRouter>,
    );

    expect(screen.queryByText("Profile")).not.toBeInTheDocument();

    // Click the arrow (the second image)
    const arrow = screen.getAllByTestId("mock-image")[1];
    fireEvent.click(arrow.parentElement);

    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Setting")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();

    // Click again to close
    fireEvent.click(arrow.parentElement);
    expect(screen.queryByText("Profile")).not.toBeInTheDocument();
  });

  it("handles logout correctly", async () => {
    mockCurrentUser = { username: "johndoe", img: "/test-avatar.png" };
    apiRequest.post.mockResolvedValueOnce({ data: "success" });

    render(
      <BrowserRouter>
        <UserButton />
      </BrowserRouter>,
    );

    // Open menu
    const arrow = screen.getAllByTestId("mock-image")[1];
    fireEvent.click(arrow.parentElement);

    // Click logout
    const logoutBtn = screen.getByText("Logout");
    fireEvent.click(logoutBtn);

    await waitFor(() => {
      expect(apiRequest.post).toHaveBeenCalledWith("/users/auth/logout", {});
      expect(mockRemoveCurrentUser).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/auth");
    });
  });
});
