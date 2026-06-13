/**
 * Light theme preset — the reference theme.
 * All Tailwind class strings for the light appearance live here.
 * Copy this file to create a new theme; TypeScript will flag every missing slot.
 */
import type {AppTheme} from '../contract';

const methodBadgeBase = 'method-badge shrink-0 text-[9px] font-bold font-mono px-[5px] py-[2px] rounded uppercase w-[36px] text-center';

export const lightTheme: AppTheme = {
    name: 'Light',
    swatches: ['#f9fafb', '#2563eb', '#111827'],

    appRoot: {
        root: 'flex flex-col h-full overflow-hidden bg-white',
        navPane: 'shrink-0 bg-gray-50 overflow-y-auto flex flex-col',
        detailPane: 'flex-1 min-w-0 bg-white overflow-hidden',
        tryPane: 'shrink-0 bg-white overflow-hidden',
        shortcutsBackdrop: 'fixed inset-0 bg-black/30 flex items-center justify-center z-50',
        shortcutsPanel: 'bg-white rounded-xl shadow-xl w-72 mx-4 overflow-hidden',
        shortcutsHeader: 'flex items-center justify-between px-5 py-3.5 border-b border-gray-100',
        shortcutsTitle: 'text-sm font-semibold text-gray-800',
        shortcutsClose: 'text-gray-400 hover:text-gray-600 text-xl leading-none transition-colors',
        shortcutsRow: 'flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0',
        shortcutsDesc: 'text-xs text-gray-600',
        shortcutsKbd: 'text-[10px] font-mono bg-gray-100 text-gray-500 px-2 py-0.5 rounded border border-gray-200 shrink-0',
    },

    nav: {
        container: 'shrink-0 bg-gray-50 overflow-y-auto flex flex-col h-full',
        divider: 'mt-1 border-t border-gray-100',
        searchWrapper: 'px-4 py-3 border-b border-gray-100 shrink-0',
        searchInput: 'w-full pl-7 pr-6 py-2 text-[11px] border border-gray-200 rounded-md bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors',
        searchIcon: 'absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none',
        searchClearButton: 'absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 leading-none text-sm',
        searchHint: 'absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-gray-300 border border-gray-200 rounded px-1 font-mono pointer-events-none leading-none',
        loadingSpinner: 'w-5 h-5 animate-spin text-blue-400',
        tabBar: 'flex gap-1 px-4 py-2 border-b border-gray-100',
        tab: {
            base: 'px-2.5 py-1 text-[11px] font-medium rounded transition-colors text-gray-400 hover:text-gray-600',
            active: 'bg-white text-gray-700 border border-gray-200 shadow-sm'
        },
        tagHeader: 'w-full flex items-center justify-between px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors',
        tagChevron: 'w-3 h-3 transition-transform',
        tagCount: 'text-[10px] text-gray-400 font-mono',
        endpointItem: {
            base: 'nav-endpoint w-full flex items-center gap-2.5 px-4 py-2 text-left transition-colors text-gray-500 hover:bg-gray-50 hover:text-gray-800',
            active: 'bg-gray-100 text-gray-900'
        },
        endpointPath: 'truncate text-[11px] font-mono',
        methodBadge: {
            base: methodBadgeBase,
            get: 'bg-blue-50 text-blue-700',
            post: 'bg-green-50 text-green-700',
            put: 'bg-amber-50 text-amber-700',
            delete: 'bg-red-50 text-red-700',
            patch: 'bg-pink-50 text-pink-700',
            options: 'bg-gray-100 text-gray-600',
            head: 'bg-gray-100 text-gray-600'
        },
        schemaItem: {
            base: 'w-full text-left gap-2.5 px-4 py-2 transition-colors hover:bg-gray-50',
            active: 'bg-gray-100'
        },
        schemaName: {base: 'truncate text-[11px] font-mono text-gray-700', active: 'text-gray-900'},
        schemaTypeBadge: 'shrink-0 text-[9px] font-bold font-mono px-[5px] py-[2px] rounded bg-purple-50 text-purple-700 uppercase',
        schemaDescription: 'mt-0.5 text-[10px] text-gray-400 truncate pl-[38px]',
        emptyState: 'text-[11px] text-gray-400',
    },

    endpoint: {
        container: 'h-full flex flex-col',
        header: 'flex items-center gap-3 px-6 py-5 border-b border-gray-100 shrink-0 h-[50px]',
        methodBadge: {
            base: methodBadgeBase,
            get: 'bg-blue-50 text-blue-700',
            post: 'bg-green-50 text-green-700',
            put: 'bg-amber-50 text-amber-700',
            delete: 'bg-red-50 text-red-700',
            patch: 'bg-pink-50 text-pink-700',
            options: 'bg-gray-100 text-gray-600',
            head: 'bg-gray-100 text-gray-600'
        },
        path: 'font-mono text-sm text-gray-800',
        summary: 'text-sm text-gray-700 mb-2 font-medium',
        description: 'text-xs text-gray-500',
        deprecated: 'ml-auto text-[10px] bg-amber-50 text-amber-600 border border-amber-200 rounded px-2 py-0.5',
        paramSection: 'border border-gray-100 rounded-lg overflow-hidden',
        paramSectionTitle: 'text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4',
        paramLocTitle: 'text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3',
        paramRow: 'border-b border-gray-100 last:border-0 bg-white hover:bg-gray-50/50 transition-colors',
        paramName: 'font-mono text-[11px] text-gray-800',
        paramType: 'text-[10px] bg-gray-100 text-gray-600 rounded px-1.5 py-0.5 font-mono',
        paramRequired: 'text-red-500 text-[9px] font-semibold ml-1',
        paramDescription: 'px-4 py-3 w-full text-xs text-gray-500',
        mutedText: 'text-gray-400',
        responseAccordion: 'border border-gray-100 rounded-lg overflow-hidden divide-y divide-gray-100',
        responseHeader: 'w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left',
        responseStatusCode: {
            base: 'text-xs font-mono font-semibold',
            success: 'text-green-600',
            redirect: 'text-blue-600',
            clientError: 'text-amber-600',
            serverError: 'text-red-600'
        },
        responseDescription: 'text-xs text-gray-600 flex-1',
        bodySection: 'px-3 py-1.5 bg-gray-50 border-b border-gray-100 flex items-center gap-2',
        bodyContentType: 'text-[10px] text-gray-500 font-mono',
    },

    topBar: {
        container: 'relative flex items-center gap-4 px-6 h-16 border-b border-gray-100 bg-white shrink-0 z-10',
        specTitle: 'text-sm font-semibold text-gray-900 truncate',
        specVersion: 'text-[10px] text-gray-400 border border-gray-200 rounded-full px-1.5 py-px font-mono shrink-0 leading-tight',
        specDescription: 'text-[10px] text-gray-400 truncate leading-tight mt-px',
        noSpecIcon: 'w-7 h-7 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shrink-0',
        noSpecIconSvg: 'w-4 h-4 text-gray-400',
        noSpecTitle: 'text-sm font-semibold text-gray-400',
        divider: 'w-px h-5 bg-gray-200 mx-1 shrink-0',
        authButtonConfigured: 'flex items-center gap-1.5 text-xs rounded-md px-2.5 py-1.5 font-medium border transition-all shrink-0 text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100',
        authButtonUnconfigured: 'flex items-center gap-1.5 text-xs rounded-md px-2.5 py-1.5 font-medium border transition-all shrink-0 text-gray-600 bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300',
        neutralButton: 'flex items-center gap-1.5 text-xs rounded-md px-2.5 py-1.5 font-medium border transition-all shrink-0 text-gray-600 bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300',
        loadButton: 'flex items-center gap-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-md px-3 py-1.5 font-medium transition-colors shrink-0 shadow-sm',
    },

    themePicker: {
        dropdown: 'bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 overflow-hidden',
        item: {
            base: 'w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors',
            active: 'bg-blue-50'
        },
        name: 'text-sm text-gray-700 font-medium flex-1',
        check: 'w-3.5 h-3.5 text-blue-600 shrink-0',
    },

    modal: {
        backdrop: 'fixed inset-0 bg-black/30 flex items-center justify-center z-50',
        container: 'bg-white rounded-xl shadow-xl w-full mx-4 overflow-hidden',
        header: 'flex items-center justify-between px-5 py-4 border-b border-gray-100',
        closeButton: 'text-gray-400 hover:text-gray-600 text-xl leading-none',
        footer: 'px-5 py-3 bg-gray-50 border-t border-gray-100',
    },

    loadModal: {
        title: 'text-sm font-semibold text-gray-800',
        footerText: 'text-[10px] text-gray-400',
        petstoreLink: 'text-xs text-blue-600 hover:underline',
        urlLabel: 'block text-xs font-medium text-gray-600 mb-1.5',
        urlInput: 'flex-1 text-xs border border-gray-200 rounded-md px-3 py-2 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors',
        dividerLine: 'flex-1 border-t border-gray-200',
        dividerText: 'text-[10px] text-gray-400 uppercase tracking-wider',
        fileLabel: 'block text-xs font-medium text-gray-600 mb-1.5',
        fileDropZone: 'flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-lg px-4 py-5 cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-colors',
        fileDropIcon: 'w-4 h-4 text-gray-400',
        fileDropText: 'text-xs text-gray-500',
        errorBanner: 'text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2',
    },

    authModal: {
        tabBar: 'flex gap-1 px-4 py-2 bg-gray-50 border-b border-gray-100 overflow-x-auto',
        tabActive: 'px-3 py-1.5 text-[11px] font-medium rounded-md bg-white text-gray-700 border border-gray-200 flex items-center gap-1.5 shrink-0',
        tabInactive: 'px-3 py-1.5 text-[11px] font-medium rounded-md text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1.5 shrink-0',
        titleIcon: 'w-4 h-4 text-gray-500',
        titleText: 'text-sm font-semibold text-gray-800',
        closeButton: 'text-xs bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-md font-medium transition-colors',
        schemeType: 'text-[10px] text-gray-400',
        authorizedBadge: 'text-[9px] text-green-600 bg-green-50 border border-green-200 rounded px-1.5 py-0.5 font-semibold uppercase tracking-wide',
        schemeDescription: 'text-[10px] text-gray-400',
        fieldLabel: 'block text-[10px] text-gray-500 mb-1',
        fieldLabelHint: 'text-gray-400 font-sans',
        input: 'w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 font-mono',
        tokenWrapper: 'flex items-stretch border border-gray-200 rounded-lg overflow-hidden bg-white focus-within:ring-1 focus-within:ring-blue-400 focus-within:border-blue-400 transition-all',
        tokenPrefix: 'px-2.5 flex items-center text-[10px] text-gray-400 bg-gray-50 border-r border-gray-200 font-mono shrink-0 select-none',
        tokenField: 'flex-1 text-xs px-2.5 py-2 bg-white text-gray-800 placeholder-gray-300 focus:outline-none font-mono min-w-0',
        saveButton: 'text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md font-medium transition-colors',
        clearButton: 'text-xs border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 px-3 py-1.5 rounded-md font-medium transition-colors',
    },

    serverConfig: {
        chip: {
            base: 'flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1.5 rounded-lg border transition-colors shrink-0 text-gray-600 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300',
            open: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50 hover:border-blue-200',
        },
        chipIcon: 'w-3 h-3 shrink-0 text-gray-400',
        backdrop: 'fixed inset-0 bg-black/30 flex items-center justify-center z-[60]',
        popover: 'bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 overflow-hidden',
        popoverHeader: 'flex items-center justify-between px-5 py-4 border-b border-gray-100',
        headerIcon: 'w-4 h-4 text-gray-500',
        headerTitle: 'text-sm font-semibold text-gray-800',
        closeButton: 'text-gray-400 hover:text-gray-600 text-xl leading-none',
        sectionDivider: 'px-5 py-4 border-b border-gray-100',
        sectionLabel: 'block text-[10px] font-semibold uppercase tracking-wider text-gray-400',
        serverSelect: 'w-full text-[11px] font-mono border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer',
        variableName: 'text-[11px] font-mono font-medium text-gray-700',
        variableDescription: 'text-[10px] text-gray-400 leading-tight mt-0.5',
        variableInput: 'text-[11px] font-mono border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 w-full',
        resolvedSection: 'px-5 py-4 bg-gray-50',
        resolvedLabel: 'text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5',
        resolvedValue: 'text-[11px] font-mono text-gray-700 break-all',
    },

    commandBar: {
        backdrop: 'fixed inset-0 bg-black/40 z-[60] flex items-start justify-center pt-[12vh]',
        container: 'bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 flex flex-col overflow-hidden border border-gray-200 max-h-[70vh]',
        searchRow: 'flex items-center gap-3 px-4 py-3 border-b border-gray-100 shrink-0',
        searchIcon: 'w-4 h-4 text-gray-400 shrink-0',
        input: 'flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none',
        clearButton: 'text-gray-400 hover:text-gray-600 text-lg leading-none shrink-0 transition-colors',
        groupTitle: 'px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400 select-none',
        resultItem: {
            base: 'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-gray-50',
            active: 'bg-blue-50 hover:bg-blue-50'
        },
        actionIcon: {
            base: 'w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-gray-100 text-gray-500',
            active: 'bg-blue-100 text-blue-600'
        },
        resultLabel: 'text-sm font-medium text-gray-800 truncate',
        resultSubtitle: 'text-xs text-gray-400 truncate mt-0.5',
        activeChevron: 'w-3.5 h-3.5 text-blue-400 shrink-0',
        emptyIcon: 'w-8 h-8 text-gray-300 mb-3',
        emptyText: 'text-sm text-gray-400',
        footer: 'shrink-0 flex items-center gap-4 px-4 py-2 border-t border-gray-100 bg-gray-50',
        shortcutText: 'flex items-center gap-1 text-[11px] text-gray-400',
        shortcutBadge: 'font-mono text-[10px] bg-white border border-gray-200 rounded px-1 py-px',
        specTitle: 'ml-auto text-[11px] text-gray-300 truncate',
        highlightMark: 'bg-yellow-100 text-inherit not-italic rounded-sm',
    },

    schema: {
        tabBar: 'flex gap-1 px-3 py-2 bg-gray-50 border-b border-gray-100',
        tabActive: 'px-3 py-1 text-[11px] font-medium rounded-md bg-white text-gray-700 border border-gray-200',
        tabInactive: 'px-3 py-1 text-[11px] font-medium rounded-md text-gray-400 hover:text-gray-600 transition-colors',
        description: 'px-4 pt-3 pb-0 text-[11px] text-gray-500 leading-relaxed',
        exampleBlock: 'text-[11px] bg-gray-50 rounded-md p-3 overflow-x-auto text-gray-700 font-mono leading-relaxed',
    },

    schemaNode: {
        name: 'font-mono text-[11px] text-gray-800',
        typeBadge: 'text-[10px] rounded px-1.5 py-0.5 font-mono',
        nullableBadge: 'text-[9px] bg-gray-100 text-gray-500 rounded px-1 font-mono',
        constraint: 'text-[9px] font-mono text-gray-400',
        enumValue: 'text-[9px] text-gray-400 font-mono',
        description: 'text-[11px] text-gray-500 mt-0.5 leading-relaxed',
        enumKey: 'font-mono text-gray-700',
        enumDesc: 'text-gray-400',
        nestedBorder: 'border-l-2 border-gray-100 ml-3 pl-3 mt-0.5',
        typeBadgeColors: {
            string: 'bg-emerald-50 text-emerald-700',
            integer: 'bg-blue-50 text-blue-700',
            number: 'bg-blue-50 text-blue-700',
            boolean: 'bg-purple-50 text-purple-700',
            object: 'bg-amber-50 text-amber-700',
            array: 'bg-cyan-50 text-cyan-700',
            default: 'bg-gray-100 text-gray-600',
        },
    },

    schemaDetail: {
        header: 'flex items-center gap-3 px-6 py-5 border-b border-gray-100 shrink-0',
        typeBadge: 'text-[9px] font-bold font-mono px-[5px] py-[2px] rounded uppercase',
        schemaName: 'font-mono text-sm text-gray-800',
        description: 'text-sm text-gray-500 mb-6 leading-relaxed',
        sectionLabel: 'text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4',
        schemaBox: 'border border-gray-100 rounded-lg overflow-hidden bg-white',
        typeBadgeColors: {
            string: 'bg-emerald-50 text-emerald-700',
            integer: 'bg-blue-50 text-blue-700',
            number: 'bg-blue-50 text-blue-700',
            boolean: 'bg-purple-50 text-purple-700',
            object: 'bg-amber-50 text-amber-700',
            array: 'bg-cyan-50 text-cyan-700',
            default: 'bg-gray-100 text-gray-600',
        },
    },

    playground: {
        container: 'h-full flex flex-col bg-white',
        header: 'flex items-center gap-2 px-5 border-b border-gray-100 shrink-0 h-[50px]',
        headerTitle: 'text-xs font-semibold text-gray-700',
        emptyState: 'h-full flex flex-col items-center justify-center text-center px-6 gap-3 bg-white',
        emptyIconWrapper: 'w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center',
        emptyIcon: 'w-5 h-5 text-gray-400',
        emptyText: 'text-sm text-gray-400',
        inputLabel: 'text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3',
        textInput: 'w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors font-mono',
        selectInput: 'w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer transition-colors',
        fileInput: 'block w-full text-xs text-gray-600 cursor-pointer file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100',
        fileInputButton: {
            base: 'file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100',
            hasFile: 'file:bg-blue-100'
        },
        bodyEditor: 'w-full text-[11px] border border-gray-200 rounded-lg px-3 py-2.5 bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 font-mono resize-y transition-colors leading-relaxed',
        contentTypeSelector: 'text-[10px] font-mono text-gray-500 border border-gray-200 rounded px-2 py-0.5 bg-gray-50',
        sendButton: {
            base: 'shrink-0 px-4 rounded-lg text-xs font-semibold transition-all bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white shadow-sm',
            loading: 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none',
            disabled: 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
        },
        responsePanel: 'h-full border-t border-gray-100 flex flex-col',
        responseStatus: {
            base: 'text-[10px] rounded px-1.5 py-0.5 font-mono font-semibold border bg-gray-50 text-gray-600 border-gray-200',
            success: 'bg-green-50 text-green-600 border-green-200',
            redirect: 'bg-blue-50 text-blue-600 border-blue-200',
            clientError: 'bg-amber-50 text-amber-600 border-amber-200',
            serverError: 'bg-red-50 text-red-600 border-red-200'
        },
        responseTime: 'text-[10px] text-gray-400 font-mono border border-gray-200 rounded px-1.5 py-0.5',
        responseSize: 'text-[10px] text-gray-400 font-mono',
        responseTabs: 'flex items-center gap-2 px-4 py-2 border-b border-gray-100 bg-gray-50/50 shrink-0',
        responseTab: {
            base: 'px-2.5 py-1 text-[10px] rounded font-medium transition-colors text-gray-400 hover:text-gray-600',
            active: 'bg-white shadow-sm text-gray-700 border border-gray-200'
        },
        responseBody: 'flex-1 overflow-auto bg-white',
        responseEmpty: 'shrink-0 border-t border-gray-100 h-10 flex items-center justify-center text-[10px] text-gray-300',
        errorBanner: 'mx-5 mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600',
    },

    authStatus: {
        sectionLabel: 'text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3',
        emptyText: 'text-[10px] text-gray-400',
        schemeRow: 'flex items-center justify-between py-2.5 px-3 rounded-lg border border-gray-100 bg-gray-50/60',
        schemeName: 'text-[11px] font-mono text-gray-700',
        schemeType: 'ml-1.5 text-[10px] text-gray-400',
        authorizedBadge: 'text-[9px] text-green-600 bg-green-50 border border-green-200 rounded px-1.5 py-0.5 font-semibold uppercase tracking-wide',
        unauthorizedBadge: 'text-[9px] text-gray-400 bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 uppercase tracking-wide',
    },

    bodyEditor: {
        fileInput: 'block w-full text-xs text-gray-600 cursor-pointer file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100',
        formatButton: 'absolute top-1.5 right-1.5 z-10 text-[10px] text-gray-400 hover:text-blue-600 transition-colors px-1.5 py-0.5 rounded hover:bg-blue-50',
        textarea: 'w-full text-[11px] border border-gray-200 rounded-lg px-3 py-2.5 bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 font-mono resize-y transition-colors leading-relaxed',
    },

    paramLabel: {
        nameText: 'font-mono text-[11px] text-gray-800',
        nameDeprecated: 'font-mono text-[11px] line-through text-gray-400',
        locPath: 'text-[9px] font-mono rounded px-1.5 py-0.5 leading-none text-orange-600 bg-orange-50',
        locQuery: 'text-[9px] font-mono rounded px-1.5 py-0.5 leading-none text-teal-600 bg-teal-50',
        locHeader: 'text-[9px] font-mono rounded px-1.5 py-0.5 leading-none text-indigo-600 bg-indigo-50',
        locCookie: 'text-[9px] font-mono rounded px-1.5 py-0.5 leading-none text-purple-600 bg-purple-50',
        locForm: 'text-[9px] font-mono rounded px-1.5 py-0.5 leading-none text-blue-600 bg-blue-50',
        locDefault: 'text-[9px] font-mono rounded px-1.5 py-0.5 leading-none text-gray-500 bg-gray-100',
        typeBadge: 'text-[9px] font-mono text-violet-600 bg-violet-50 rounded px-1.5 py-0.5 leading-none',
        requiredBadge: 'text-[9px] font-semibold text-red-500 bg-red-50 rounded px-1.5 py-0.5 leading-none',
        deprecatedBadge: 'text-[9px] font-semibold text-amber-600 bg-amber-50 rounded px-1.5 py-0.5 leading-none',
        constraintBadge: 'text-[9px] font-mono text-gray-500 bg-gray-100 rounded px-1.5 py-0.5 leading-none',
        tooltipIcon: 'w-3.5 h-3.5 text-gray-400 cursor-help hover:text-gray-600 transition-colors',
        tooltipPopup: 'pointer-events-none absolute bottom-full right-0 mb-2 w-56 rounded-lg bg-gray-900 px-2.5 py-2 text-[10px] text-gray-100 leading-snug shadow-lg opacity-0 group-hover/tip:opacity-100 transition-opacity z-50',
    },

    responsePanel: {
        loadingState: 'shrink-0 border-t border-gray-100 h-16 flex items-center justify-center gap-2 text-xs text-gray-400 bg-gray-50/50',
        emptyState: 'shrink-0 border-t border-gray-100 h-10 flex items-center justify-center',
        emptyText: 'text-[10px] text-gray-300',
        container: 'h-full border-t border-gray-100 flex flex-col',
        tabBar: 'flex items-center gap-2 px-4 py-2 border-b border-gray-100 bg-gray-50/50 shrink-0',
        tab: {
            base: 'px-2.5 py-1 text-[10px] rounded font-medium transition-colors text-gray-400 hover:text-gray-600',
            active: 'bg-white shadow-sm text-gray-700 border border-gray-200'
        },
        tabDivider: 'w-px h-3 bg-gray-200 mx-1',
        headerCount: 'ml-0.5 text-gray-300',
        copyButton: {
            base: 'flex items-center gap-1 text-[10px] px-2 py-1 rounded hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700',
            copied: 'text-green-600'
        },
        statusNeutral: 'text-[10px] border rounded px-1.5 py-0.5 font-mono font-semibold text-gray-600 bg-gray-50 border-gray-200',
        statusSuccess: 'text-[10px] border rounded px-1.5 py-0.5 font-mono font-semibold text-green-600 bg-green-50 border-green-200',
        statusError: 'text-[10px] border rounded px-1.5 py-0.5 font-mono font-semibold text-red-600 bg-red-50 border-red-200',
        bodyContainer: 'flex-1 overflow-auto bg-white',
        bodyPre: 'text-[11px] p-3 text-gray-700 font-mono leading-relaxed',
        headersPre: 'text-[11px] p-3 text-gray-500 font-mono leading-relaxed',
    },

    sendBar: {
        container: 'px-5 py-3 border-b border-gray-100 shrink-0 bg-gray-50/50',
        urlBox: 'flex items-center gap-2 flex-1 min-w-0 bg-white rounded-lg px-2.5 py-2 border border-gray-200',
        urlCode: 'text-[10px] text-gray-600 leading-tight flex-1 min-w-0 break-all',
        sendButtonActive: 'shrink-0 px-4 rounded-lg text-xs font-semibold transition-all bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white shadow-sm',
        sendButtonDisabled: 'shrink-0 px-4 rounded-lg text-xs font-semibold transition-all bg-gray-100 text-gray-400 cursor-not-allowed',
    },

    inputScalar: {
        input: 'w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors font-mono',
        inputInvalid: 'w-full text-xs border border-red-400 rounded-lg px-3 py-2 bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-red-400 focus:border-red-400 transition-colors font-mono',
    },

    inputBoolean: {
        select: 'w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors font-mono',
        selectInvalid: 'w-full text-xs border border-red-400 rounded-lg px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-red-400 focus:border-red-400 transition-colors font-mono',
    },

    inputEnum: {
        select: 'w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors font-mono',
        selectInvalid: 'w-full text-xs border border-red-400 rounded-lg px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-red-400 focus:border-red-400 transition-colors font-mono',
    },

    inputFile: {
        input: 'block w-full text-xs text-gray-600 cursor-pointer file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100',
    },

    inputArray: {
        rowInput: 'flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors font-mono',
        rowInputInvalid: 'flex-1 text-xs border border-red-400 rounded-lg px-3 py-2 bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-red-400 focus:border-red-400 transition-colors font-mono',
        rowIndex: 'text-[9px] text-gray-300 font-mono w-4 text-right shrink-0',
        removeButton: 'shrink-0 w-5 h-5 flex items-center justify-center rounded text-gray-300 hover:text-red-400 hover:bg-red-50 disabled:opacity-0 transition-colors',
        addButton: 'flex items-center gap-1 text-[10px] text-blue-500 hover:text-blue-600 transition-colors',
        hint: 'text-[9px] text-gray-300 font-mono',
    },

    inputMultiSelect: {
        trigger: 'w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors font-mono flex items-center justify-between text-left',
        triggerInvalid: 'w-full text-xs border border-red-400 rounded-lg px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-red-400 focus:border-red-400 transition-colors font-mono flex items-center justify-between text-left',
        placeholder: 'text-gray-300',
        dropdown: 'absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg py-1',
        dropdownItem: 'flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer',
        optionText: 'text-xs font-mono text-gray-700',
    },

    inputObject: {
        textarea: 'w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors font-mono resize-y',
        textareaInvalid: 'w-full text-xs border border-red-400 rounded-lg px-3 py-2 bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-red-400 focus:border-red-400 transition-colors font-mono resize-y',
    },

    detailPane: {
        spinner: 'w-5 h-5 animate-spin text-blue-400',
        errorIcon: 'w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0 text-red-400',
        errorMessage: 'text-sm text-red-600',
        retryLink: 'text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2',
        emptyIcon: 'w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400',
        emptyMessage: 'text-sm text-gray-400',
    },

    verticalResizable: {
        handle: 'w-8 h-0.5 rounded-full bg-gray-200 group-hover:bg-blue-400 transition-colors',
    },

    syntax: {
        key: '#2563eb',
        string: '#16a34a',
        boolean: '#9333ea',
        null: '#9ca3af',
        number: '#d97706',
    },

    paneHandle: 'border-l border-gray-200 group-hover:border-blue-400 group-[.dragging]:border-blue-500 transition-colors duration-150',
    fontFamily: "'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif",
    focusRing: 'focus:ring-2 focus:ring-blue-400 focus:ring-offset-1',
    scrollbar: {thumb: 'bg-gray-300', thumbHover: 'bg-gray-400'},
};