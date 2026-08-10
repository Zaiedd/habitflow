import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PricingSection } from "./pricing-section";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("next/link", async () => {
  const React = await import("react");
  return {
    default: ({
      children,
      ...props
    }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
      href: string;
      children: React.ReactNode;
    }) => React.createElement("a", props, children),
  };
});

vi.mock("@/lib/i18n/locale-context", async () => {
  const { getDictionary } = await import("@/lib/i18n/dictionaries");
  return { useLocale: () => ({ locale: "en", dict: getDictionary("en") }) };
});

const { createCheckoutSession } = vi.hoisted(() => ({
  createCheckoutSession: vi.fn(),
}));
vi.mock("@/lib/api", () => ({ createCheckoutSession }));

const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }));
vi.mock("@/lib/session", () => ({ getSession }));

describe("PricingSection", () => {
  const assign = vi.fn();

  beforeEach(() => {
    assign.mockClear();
    push.mockClear();
    createCheckoutSession.mockReset();
    getSession.mockReset();
    Object.defineProperty(window, "location", {
      writable: true,
      value: { assign },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders all three plans and links the free plan to register", () => {
    render(<PricingSection />);

    expect(screen.getByText("Free")).toBeTruthy();
    expect(screen.getByText("Pro")).toBeTruthy();
    expect(screen.getByText("Family")).toBeTruthy();

    const freeCta = screen.getByText("Start for free");
    expect(freeCta.closest("a")).toHaveAttribute("href", "/en/register");
  });

  it("starts a Stripe checkout for a signed-in user", async () => {
    getSession.mockReturnValue({
      user: { id: "u1" },
      tokens: { accessToken: "access-token" },
    });
    createCheckoutSession.mockResolvedValue({
      ok: true,
      data: { url: "https://checkout.stripe.com/c/pay" },
    });

    render(<PricingSection />);
    fireEvent.click(screen.getByText("Start 14-day trial"));

    expect(createCheckoutSession).toHaveBeenCalledWith(
      "access-token",
      "pro",
      "year",
      "en",
    );
    await waitFor(() =>
      expect(assign).toHaveBeenCalledWith("https://checkout.stripe.com/c/pay"),
    );
  });

  it("sends the family plan with the monthly interval when chosen", async () => {
    getSession.mockReturnValue({
      user: { id: "u1" },
      tokens: { accessToken: "access-token" },
    });
    createCheckoutSession.mockResolvedValue({
      ok: true,
      data: { url: "https://checkout.stripe.com/c/pay" },
    });

    render(<PricingSection />);
    fireEvent.click(screen.getByText("Monthly"));
    fireEvent.click(screen.getByText("Start family trial"));

    expect(createCheckoutSession).toHaveBeenCalledWith(
      "access-token",
      "family",
      "month",
      "en",
    );
  });

  it("sends a signed-out user to register", () => {
    getSession.mockReturnValue(null);

    render(<PricingSection />);
    fireEvent.click(screen.getByText("Start 14-day trial"));

    expect(push).toHaveBeenCalledWith("/en/register");
    expect(createCheckoutSession).not.toHaveBeenCalled();
  });

  it("shows the demo notice for a demo session", () => {
    getSession.mockReturnValue({
      user: { id: "demo-1" },
      tokens: { accessToken: "demo-access.1" },
      demo: true,
    });

    render(<PricingSection />);
    fireEvent.click(screen.getByText("Start 14-day trial"));

    expect(
      screen.getByText("Create a real account to start your trial."),
    ).toBeTruthy();
    expect(createCheckoutSession).not.toHaveBeenCalled();
  });

  it("shows the network error when billing is unreachable", async () => {
    getSession.mockReturnValue({
      user: { id: "u1" },
      tokens: { accessToken: "access-token" },
    });
    createCheckoutSession.mockResolvedValue({ ok: false, kind: "network" });

    render(<PricingSection />);
    fireEvent.click(screen.getByText("Start family trial"));

    expect(
      await screen.findByText(
        "We couldn't reach the billing service. Please try again.",
      ),
    ).toBeTruthy();
    expect(assign).not.toHaveBeenCalled();
  });

  it("shows the generic error on a rejected checkout", async () => {
    getSession.mockReturnValue({
      user: { id: "u1" },
      tokens: { accessToken: "access-token" },
    });
    createCheckoutSession.mockResolvedValue({
      ok: false,
      kind: "http",
      status: 400,
      code: "PRICE_NOT_CONFIGURED",
    });

    render(<PricingSection />);
    fireEvent.click(screen.getByText("Start 14-day trial"));

    expect(
      await screen.findByText(
        "We couldn't start your checkout. Please try again.",
      ),
    ).toBeTruthy();
  });
});
