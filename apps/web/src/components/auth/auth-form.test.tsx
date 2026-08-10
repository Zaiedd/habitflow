import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUser } from "@/lib/api";
import { AuthForm } from "./auth-form";

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

const { login, register } = vi.hoisted(() => {
  return { login: vi.fn(), register: vi.fn() };
});
vi.mock("@/lib/api", () => ({ login, register }));

const { saveSession, createDemoSession } = vi.hoisted(() => {
  return { saveSession: vi.fn(), createDemoSession: vi.fn() };
});
vi.mock("@/lib/session", () => ({ saveSession, createDemoSession }));

const loginFields = [
  {
    name: "email",
    type: "email" as const,
    label: "Email",
    placeholder: "you@example.com",
    autoComplete: "email",
  },
  {
    name: "password",
    type: "password" as const,
    label: "Password",
    placeholder: "••••••••",
  },
];

const registerFields = [
  {
    name: "displayName",
    type: "text" as const,
    label: "Full name",
    placeholder: "Sara Hassan",
    autoComplete: "name",
  },
  ...loginFields,
];

const userFixture: AuthUser = {
  id: "u1",
  email: "sara@example.com",
  displayName: "Sara Hassan",
  avatarUrl: null,
  locale: "en",
  timezone: "UTC",
  plan: "FREE",
  status: "ACTIVE",
};

function renderLogin() {
  return render(
    <AuthForm
      title="Welcome back"
      subtitle="Sign in"
      submitLabel="Sign in"
      fields={loginFields}
      footer={<span>footer</span>}
      mode="login"
    />,
  );
}

function getForm(): HTMLFormElement {
  return screen
    .getByRole("button", { name: /sign in/i })
    .closest("form") as HTMLFormElement;
}

async function submitCredentials(email: string, password: string) {
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: password },
  });
  fireEvent.submit(getForm());
  await act(async () => {});
}

describe("AuthForm", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the login form without a displayName field", () => {
    renderLogin();

    expect(
      screen.getByRole("heading", { name: "Welcome back" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.queryByLabelText("Full name")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
  });

  it("renders the displayName field in register mode", () => {
    render(
      <AuthForm
        title="Create account"
        subtitle="Join"
        submitLabel="Create"
        fields={registerFields}
        footer={<span>footer</span>}
        mode="register"
      />,
    );

    expect(screen.getByLabelText("Full name")).toBeInTheDocument();
  });

  it("toggles password visibility", () => {
    renderLogin();

    const passwordInput = screen.getByLabelText("Password");
    expect(passwordInput).toHaveAttribute("type", "password");

    fireEvent.click(screen.getByRole("button", { name: /show password/i }));
    expect(passwordInput).toHaveAttribute("type", "text");

    fireEvent.click(screen.getByRole("button", { name: /hide password/i }));
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("shows a password strength label in register mode", () => {
    render(
      <AuthForm
        title="Create account"
        subtitle="Join"
        submitLabel="Create"
        fields={registerFields}
        footer={<span>footer</span>}
        mode="register"
      />,
    );

    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "abc" },
    });

    expect(screen.getByText(/weak/i)).toBeInTheDocument();
  });

  it("submits credentials to the API and saves the session on success", async () => {
    login.mockResolvedValue({
      ok: true,
      data: { user: userFixture, tokens: { accessToken: "at" } },
    });

    renderLogin();
    await submitCredentials("sara@example.com", "password123");

    expect(login).toHaveBeenCalledWith("sara@example.com", "password123");
    expect(saveSession).toHaveBeenCalledWith(
      expect.objectContaining({ user: userFixture }),
    );
    expect(screen.getByRole("status")).toHaveTextContent(/welcome/i);
  });

  it("does not submit when fields are empty", async () => {
    renderLogin();

    fireEvent.submit(getForm());
    await act(async () => {});

    expect(login).not.toHaveBeenCalled();
  });

  it("surfaces the invalid credentials message on a 401", async () => {
    login.mockResolvedValue({ ok: false, kind: "http", status: 401 });

    renderLogin();
    await submitCredentials("sara@example.com", "wrong");

    expect(screen.getByRole("alert")).toHaveTextContent(
      /incorrect email or password/i,
    );
    expect(saveSession).not.toHaveBeenCalled();
  });

  it("falls back to a demo session when the API is unreachable", async () => {
    login.mockResolvedValue({ ok: false, kind: "network" });
    createDemoSession.mockReturnValue({
      user: userFixture,
      tokens: { accessToken: "demo" },
      demo: true,
    });

    renderLogin();
    await submitCredentials("sara@example.com", "password123");

    expect(createDemoSession).toHaveBeenCalledWith("sara@example.com", "");
    expect(saveSession).toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent(/demo/i);
  });

  it("redirects to /today after a successful login", async () => {
    login.mockResolvedValue({
      ok: true,
      data: { user: userFixture, tokens: { accessToken: "at" } },
    });

    renderLogin();
    await submitCredentials("sara@example.com", "password123");
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(push).toHaveBeenCalledWith("/en/today");
  });

  it("redirects to /today after a demo fallback", async () => {
    login.mockResolvedValue({ ok: false, kind: "network" });
    createDemoSession.mockReturnValue({
      user: userFixture,
      tokens: { accessToken: "demo" },
      demo: true,
    });

    renderLogin();
    await submitCredentials("sara@example.com", "password123");
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(push).toHaveBeenCalledWith("/en/today");
  });
});
