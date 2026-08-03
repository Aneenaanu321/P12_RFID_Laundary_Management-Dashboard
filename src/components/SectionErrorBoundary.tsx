"use client";

import { Component, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  title?: string;
};

type State = {
  error: Error | null;
};

export class SectionErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-4 py-4 text-sm"
        >
          <p className="font-medium text-[var(--foreground)]">
            {this.props.title ?? "This section"} failed to load
          </p>
          <p className="mt-1 text-[var(--muted)]">{this.state.error.message}</p>
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            className="mt-3 text-xs font-medium text-[var(--foreground)] underline underline-offset-2 hover:opacity-80"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
