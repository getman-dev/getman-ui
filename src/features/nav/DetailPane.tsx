/** Routes between EndpointDetail, SchemaDetail, and the empty state. */
import { useNav } from "./nav-context";
import { useSpec } from "../spec/spec-context";
import EndpointDetail from "../endpoint/EndpointDetail";
import SchemaDetail from "../schema/SchemaDetail";

/** Renders the appropriate detail view based on what's active in the nav. */
export default function DetailPane() {
  const { activeSchema, activeEndpoint } = useNav();
  const { spec, specLoading } = useSpec();

  if (specLoading && !spec) {
    return (
      <div className="h-full flex items-center justify-center">
        <svg className="w-5 h-5 animate-spin text-blue-400 dark:text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      </div>
    );
  }
  if (activeSchema && spec?.components?.schemas?.[activeSchema]) {
    return <SchemaDetail />;
  }
  if (activeEndpoint) {
    return <EndpointDetail />;
  }
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-8 gap-3">
      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
      </div>
      <p className="text-sm text-gray-400 dark:text-gray-500">Select an endpoint to view documentation</p>
    </div>
  );
}
