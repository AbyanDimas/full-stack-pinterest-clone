import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Skeleton from "../../src/components/skeleton/skeleton";

describe("Skeleton Component", () => {
  it("renders 21 skeleton items", () => {
    const { container } = render(<Skeleton />);

    // The wrapper should have the class "skeleton-masonry"
    expect(container.firstChild).toHaveClass("skeleton-masonry");

    // It should render exactly 21 items
    const items = container.querySelectorAll(".skeleton-item");
    expect(items.length).toBe(21);
  });

  it("assigns sequential size classes to items", () => {
    const { container } = render(<Skeleton />);
    const items = container.querySelectorAll(".skeleton-item");

    // (index % 5) + 1 logic means sizes go 1, 2, 3, 4, 5, 1, 2...
    expect(items[0]).toHaveClass("size-1");
    expect(items[1]).toHaveClass("size-2");
    expect(items[2]).toHaveClass("size-3");
    expect(items[3]).toHaveClass("size-4");
    expect(items[4]).toHaveClass("size-5");
    expect(items[5]).toHaveClass("size-1"); // loops back
    expect(items[20]).toHaveClass("size-1"); // 20 % 5 = 0, + 1 = 1
  });
});
