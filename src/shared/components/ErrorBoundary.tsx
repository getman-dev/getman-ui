/** Catches render errors in its subtree and shows a recovery UI instead of a blank page. */
import { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
    children: ReactNode;
}

interface State {
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    state: State = { error: null };

    static getDerivedStateFromError(error: Error): State {
        return { error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error("[ApiExplorer] Render error:", error, info.componentStack);
    }

    render() {
        if (this.state.error) {
            return (
                <div className="flex flex-col items-center justify-center h-full gap-3 p-8 text-center">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Something went wrong</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{this.state.error.message}</p>
                    <button
                        onClick={() => this.setState({ error: null })}
                        className="px-3 py-1.5 text-xs rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                    >
                        Try to recover
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}