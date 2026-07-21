import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled UI error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface px-4">
          <div className="card p-8 max-w-md text-center">
            <h1 className="font-heading text-lg font-semibold text-ink">Something went wrong</h1>
            <p className="text-sm text-slate-500 mt-2">
              Please refresh the page. If the problem persists, contact the system administrator.
            </p>
            <button className="btn-primary mt-5" onClick={() => window.location.reload()}>
              Refresh
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
