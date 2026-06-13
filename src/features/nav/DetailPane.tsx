/** Routes between EndpointDetail, SchemaDetail, and the empty state. */
import {useNav} from "./nav-context";
import {specActions, useSpec} from "../spec/spec-context";
import EndpointDetail from "../endpoint/EndpointDetail";
import SchemaDetail from "../schema/SchemaDetail";
import {slot, type ThemeSlot} from "../../themes/slot";
import {useTheme} from "../../themes/context";

export interface DetailPaneTheme {
    spinner: ThemeSlot;
    errorIcon: ThemeSlot;
    errorMessage: ThemeSlot;
    retryLink: ThemeSlot;
    emptyIcon: ThemeSlot;
    emptyMessage: ThemeSlot;
}

/** Displays a spec load error with a dismiss action. */
function SpecLoadError({message}: { message: string }) {
    const t = useTheme().detailPane;
    return (
        <div className="h-full flex flex-col items-center justify-center text-center px-8 gap-3">
            <div className={slot(t.errorIcon)}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                </svg>
            </div>
            <p className={slot(t.errorMessage)}>{message}</p>
            <button
                onClick={() => specActions.setLoadError("")}
                className={slot(t.retryLink)}
            >
                Dismiss
            </button>
        </div>
    );
}

/** Renders the appropriate detail view based on what's active in the nav. */
export default function DetailPane() {
    const {activeSchema, activeEndpoint} = useNav();
    const {spec, specLoading, loadError} = useSpec();
    const t = useTheme().detailPane;

    if (specLoading && !spec) {
        return (
            <div className="h-full flex items-center justify-center">
                <svg className={slot(t.spinner)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
            </div>
        );
    }
    if (activeSchema && spec?.components?.schemas?.[activeSchema]) {
        return <SchemaDetail/>;
    }
    if (activeEndpoint) {
        return <EndpointDetail/>;
    }

    if (loadError) {
        return <SpecLoadError message={loadError}/>;
    }

    return (
        <div className="h-full flex flex-col items-center justify-center text-center px-8 gap-3">
            <div className={slot(t.emptyIcon)}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
            </div>
            <p className={slot(t.emptyMessage)}>Select an endpoint to view documentation</p>
        </div>
    );
}