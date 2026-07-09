import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Image from "../../src/components/image/image";

describe("Image Component", () => {
  it("renders correctly with local path", () => {
    render(<Image path="/general/logo.png" alt="Logo" w={100} h={100} />);
    const img = screen.getByAltText("Logo");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/general/logo.png");
    expect(img).toHaveAttribute("width", "100");
    expect(img).toHaveAttribute("height", "100");
  });

  it("renders correctly with external path (imgproxy formatting)", () => {
    // Note: Since VITE_IMGPROXY_URL is undefined in this test env, it will fallback to defaults
    render(<Image path="test-image.jpg" alt="External" w={500} h={500} />);
    const img = screen.getByAltText("External");
    expect(img).toBeInTheDocument();

    // We just verify it transforms the URL using the fallback values in the component
    const src = img.getAttribute("src");
    expect(src).toContain("insecure");
    expect(src).toContain("rs:fill:500:500");
    expect(src).toContain("test-image.jpg");
  });

  it("renders correctly when width/height are undefined (unscaled)", () => {
    render(
      <Image path="test-native.jpg" alt="Native" w={undefined} h={undefined} />,
    );
    const img = screen.getByAltText("Native");
    expect(img).toBeInTheDocument();

    // Verify it doesn't include resize params
    const src = img.getAttribute("src");
    expect(src).toContain("plain/s3");
    expect(src).not.toContain("rs:fill");
    expect(img).not.toHaveAttribute("width");
  });
});
