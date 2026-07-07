import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AuthPage from "./authPage";
import { BrowserRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const MockAuthPage = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthPage />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe("AuthPage Component", () => {
  it("renders login form by default", () => {
    render(<MockAuthPage />);
    expect(screen.getByRole("heading", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/username/i)).not.toBeInTheDocument();
  });

  it("switches to register form when clicking the link", () => {
    render(<MockAuthPage />);
    // Testing Library separates text in nested elements, so finding "Register" alone is safer
    const registerLink = screen.getByText("Register");
    fireEvent.click(registerLink);

    expect(
      screen.getByRole("heading", { name: /create an account/i }),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/^name$/i)).toBeInTheDocument();
  });

  it("switches back to login form", () => {
    render(<MockAuthPage />);
    fireEvent.click(screen.getByText("Register"));
    fireEvent.click(screen.getByText("Login", { selector: "b" })); // targets the <b>Login</b> tag

    expect(screen.getByRole("heading", { name: /login/i })).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/username/i)).not.toBeInTheDocument();
  });
});
