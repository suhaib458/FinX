import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMsg: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  public props: Props;
  public state: State = {
    hasError: false,
    errorMsg: ""
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMsg: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-[#020617] text-slate-700 dark:text-slate-300 font-sans h-full">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-4 border border-rose-500/20 text-rose-500">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2 text-center">Something went wrong</h1>
          <p className="text-xs text-slate-700 dark:text-slate-400 mb-6 text-center max-w-sm">
            We encountered an unexpected error. Please refresh or contact support if the issue persists.
          </p>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl w-full max-w-sm mb-6 text-[10px] text-rose-500 dark:text-rose-300 font-mono overflow-auto max-h-32">
            {this.state.errorMsg}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-slate-900 dark:text-white font-bold py-3 px-6 rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children || null;
  }
}
