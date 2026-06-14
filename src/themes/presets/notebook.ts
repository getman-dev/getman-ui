/**
 * Notebook theme preset — warm off-white paper, dot-grid feel, yellow highlighter accents.
 * All monospace. Cozy developer-journal aesthetic: ink on warm paper, zero chrome.
 * Palette: paper (#F9F7F2), ink (#1A1814), highlight yellow (#F5E642), border tan (#D6D0C4).
 */
import type {AppTheme} from '../contract';

const badge = 'method-badge shrink-0 text-[11px] font-bold font-mono px-[5px] py-[2px] rounded-sm uppercase w-[50px] text-center';

export const notebookTheme: AppTheme = {
    name: 'Notebook',
    swatches: ['#F9F7F2', '#F5E642', '#1A1814'],
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', ui-monospace, monospace",

    appRoot: {
        root: 'flex flex-col h-full overflow-hidden bg-[#F9F7F2]',
        navPane: 'shrink-0 bg-[#F0ECE3] overflow-y-auto flex flex-col',
        detailPane: 'flex-1 min-w-0 bg-[#F9F7F2] overflow-hidden',
        tryPane: 'shrink-0 bg-[#F9F7F2] overflow-hidden',
        shortcutsBackdrop: 'fixed inset-0 bg-[#1A1814]/40 flex items-center justify-center z-50',
        shortcutsPanel: 'bg-[#FDFCF9] rounded shadow-xl w-72 mx-4 overflow-hidden border border-[#D6D0C4]',
        shortcutsHeader: 'flex items-center justify-between px-5 py-3.5 border-b border-[#D6D0C4]',
        shortcutsTitle: 'text-sm font-medium text-[#1A1814]',
        shortcutsClose: 'text-[#9A9182] hover:text-[#1A1814] text-xl leading-none transition-colors',
        shortcutsRow: 'flex items-center justify-between py-1.5 border-b border-[#E8E3D9] last:border-0',
        shortcutsDesc: 'text-xs text-[#5C5548]',
        shortcutsKbd: 'text-[10px] font-mono bg-[#F0ECE3] text-[#5C5548] px-2 py-0.5 rounded-sm border border-[#D6D0C4] shrink-0',
    },

    nav: {
        container: 'shrink-0 bg-[#F0ECE3] overflow-y-auto flex flex-col h-full',
        divider: 'mt-1 border-t border-[#D6D0C4]',
        searchWrapper: 'px-4 py-3 border-b border-[#D6D0C4] shrink-0',
        searchInput: 'w-full pl-7 pr-6 py-2 text-[11px] border border-[#D6D0C4] rounded-sm bg-[#FDFCF9] text-[#1A1814] placeholder-[#9A9182] focus:outline-none focus:ring-1 focus:ring-[#D4C200] focus:border-[#D4C200] transition-colors',
        searchIcon: 'absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#9A9182] pointer-events-none',
        searchClearButton: 'absolute right-2 top-1/2 -translate-y-1/2 text-[#9A9182] hover:text-[#1A1814] leading-none text-sm',
        searchHint: 'absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-[#B0A898] border border-[#D6D0C4] rounded-sm px-1 font-mono pointer-events-none leading-none',
        loadingSpinner: 'w-5 h-5 animate-spin text-[#D4C200]',
        tabBar: 'flex gap-1 px-4 py-2 border-b border-[#D6D0C4]',
        tab: {
            base: 'px-2.5 py-1 text-[11px] font-medium rounded-sm transition-colors text-[#9A9182] hover:text-[#1A1814]',
            active: 'bg-[#F5E642] text-[#3D3520] border border-[#D4C200] shadow-sm'
        },
        tagHeader: 'w-full flex items-center justify-between px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-[#9A9182] hover:text-[#5C5548] transition-colors',
        tagChevron: 'w-3 h-3 transition-transform',
        tagCount: 'text-[10px] text-[#9A9182] font-mono',
        endpointItem: {
            base: 'nav-endpoint w-full flex items-center gap-2.5 px-4 py-2 text-left transition-colors text-[#5C5548] hover:bg-[#E8E3D9]/60 hover:text-[#1A1814]',
            active: 'bg-[#F5E642] text-[#1A1814] '
        },
        endpointPath: 'truncate text-[13px] font-mono',
        methodBadge: {
            base: badge,
            get: 'text-[#3A6B30]',
            post: 'text-[#3D3520]',
            put: 'text-[#7A5A00]',
            delete: 'text-[#8B2020]',
            patch: 'text-[#7A3A00]',
            options: 'text-[#5C5548]',
            head: 'text-[#5C5548]'
        },
        schemaItem: {
            base: 'w-full text-left gap-2.5 px-4 py-2 transition-colors hover:bg-[#E8E3D9]/60',
            active: 'bg-[#F5E642]/40'
        },
        schemaName: {base: 'truncate text-[13px] font-mono text-[#5C5548]', active: 'text-[#1A1814]'},
        schemaTypeBadge: 'shrink-0 text-[11px] font-bold font-mono px-[5px] py-[2px] rounded-sm bg-[#F0ECE3] text-[#7A3A00] uppercase',
        schemaDescription: 'mt-0.5 text-[10px] text-[#9A9182] truncate pl-[38px]',
        emptyState: 'text-[11px] text-[#9A9182]',
    },

    endpoint: {
        container: 'h-full flex flex-col',
        header: 'flex items-center gap-3 px-6 py-5 border-b border-[#D6D0C4] shrink-0 h-[50px]',
        methodBadge: {
            base: badge,
            get: 'bg-[#DFF0D8] text-[#3A6B30]',
            post: 'bg-[#F5E642] text-[#3D3520]',
            put: 'bg-[#FFF3C0] text-[#7A5A00]',
            delete: 'bg-[#FFE0E0] text-[#8B2020]',
            patch: 'bg-[#FFE8D0] text-[#7A3A00]',
            options: 'bg-[#E8E3D9] text-[#5C5548]',
            head: 'bg-[#E8E3D9] text-[#5C5548]'
        },
        path: 'font-mono text-sm text-[#1A1814]',
        summary: 'text-sm text-[#1A1814] mb-2 font-medium',
        description: 'text-xs text-[#5C5548]',
        deprecated: 'ml-auto text-[10px] bg-[#FFF3C0] text-[#7A5A00] border border-[#D4C200] rounded-sm px-2 py-0.5',
        paramSection: 'border border-[#D6D0C4] rounded-sm overflow-hidden',
        paramSectionTitle: 'text-xs font-semibold uppercase tracking-wider text-[#9A9182] mb-4',
        paramLocTitle: 'text-[10px] font-semibold uppercase tracking-wider text-[#9A9182] mb-3',
        paramRow: 'border-b border-[#E8E3D9] last:border-0 bg-[#FDFCF9] hover:bg-[#F0ECE3]/60 transition-colors',
        paramName: 'font-mono text-[11px] text-[#1A1814]',
        paramType: 'text-[10px] bg-[#F0ECE3] text-[#5C5548] rounded-sm px-1.5 py-0.5 font-mono',
        paramRequired: 'text-[#8B2020] text-[9px] font-semibold ml-1',
        paramDescription: 'px-4 py-3 w-full text-xs text-[#5C5548]',
        mutedText: 'text-[#9A9182]',
        responseAccordion: 'border border-[#D6D0C4] rounded-sm overflow-hidden divide-y divide-[#D6D0C4]',
        responseHeader: 'w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[#F0ECE3]/60 transition-colors text-left',
        responseStatusCode: {
            base: 'text-xs font-mono font-semibold',
            success: 'text-[#3A6B30]',
            redirect: 'text-[#2A5A8B]',
            clientError: 'text-[#7A5A00]',
            serverError: 'text-[#8B2020]'
        },
        responseDescription: 'text-xs text-[#5C5548] flex-1',
        bodySection: 'px-3 py-1.5 bg-[#F0ECE3] border-b border-[#D6D0C4] flex items-center gap-2',
        bodyContentType: 'text-[10px] text-[#9A9182] font-mono',
    },

    topBar: {
        container: 'relative flex items-center gap-4 px-6 h-16 border-b border-[#D6D0C4] bg-[#F0ECE3] shrink-0 z-10',
        specTitle: 'text-sm font-medium text-[#1A1814] truncate',
        specVersion: 'text-[10px] text-[#9A9182] border border-[#D6D0C4] rounded-sm px-1.5 py-px font-mono shrink-0 leading-tight',
        specDescription: 'text-[10px] text-[#9A9182] truncate leading-tight mt-px',
        noSpecIcon: 'w-7 h-7 rounded-sm bg-[#E8E3D9] flex items-center justify-center shrink-0',
        noSpecIconSvg: 'w-4 h-4 text-[#9A9182]',
        noSpecTitle: 'text-sm font-medium text-[#9A9182]',
        divider: 'w-px h-5 bg-[#D6D0C4] mx-1 shrink-0',
        authButtonConfigured: 'flex items-center gap-1.5 text-xs rounded-sm px-2.5 py-1.5 font-medium border transition-all shrink-0 text-[#3A6B30] bg-[#DFF0D8] border-[#A8C8A0] hover:bg-[#C8E4C0]',
        authButtonUnconfigured: 'flex items-center gap-1.5 text-xs rounded-sm px-2.5 py-1.5 font-medium border transition-all shrink-0 text-[#5C5548] bg-[#FDFCF9] border-[#D6D0C4] hover:bg-[#F0ECE3] hover:border-[#D4C200]',
        neutralButton: 'flex items-center gap-1.5 text-xs rounded-sm px-2.5 py-1.5 font-medium border transition-all shrink-0 text-[#5C5548] bg-[#FDFCF9] border-[#D6D0C4] hover:bg-[#F0ECE3] hover:border-[#D4C200]',
        loadButton: 'flex items-center gap-1.5 text-xs text-[#3D3520] bg-[#F5E642] hover:bg-[#E6D800] active:bg-[#D4C200] rounded-sm px-3 py-1.5 font-semibold transition-colors shrink-0 shadow-sm',
    },

    themePicker: {
        dropdown: 'bg-[#FDFCF9] border border-[#D6D0C4] rounded-sm shadow-xl py-1.5 overflow-hidden',
        item: {
            base: 'w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-[#F0ECE3] transition-colors',
            active: 'bg-[#F5E642]/30'
        },
        name: 'text-sm text-[#1A1814] font-medium flex-1',
        check: 'w-3.5 h-3.5 text-[#D4C200] shrink-0',
    },

    modal: {
        backdrop: 'fixed inset-0 bg-[#1A1814]/40 flex items-center justify-center z-50',
        container: 'bg-[#FDFCF9] rounded shadow-xl w-full mx-4 overflow-hidden border border-[#D6D0C4]',
        header: 'flex items-center justify-between px-5 py-4 border-b border-[#D6D0C4]',
        closeButton: 'text-[#9A9182] hover:text-[#1A1814] text-xl leading-none',
        footer: 'px-5 py-3 bg-[#F0ECE3] border-t border-[#D6D0C4]',
    },

    loadModal: {
        title: 'text-sm font-medium text-[#1A1814]',
        footerText: 'text-[10px] text-[#9A9182]',
        petstoreLink: 'text-xs text-[#2A5A8B] hover:underline',
        urlLabel: 'block text-xs font-medium text-[#5C5548] mb-1.5',
        urlInput: 'flex-1 text-xs border border-[#D6D0C4] rounded-sm px-3 py-2 bg-[#FDFCF9] text-[#1A1814] placeholder-[#9A9182] focus:outline-none focus:ring-1 focus:ring-[#D4C200] focus:border-[#D4C200] transition-colors',
        dividerLine: 'flex-1 border-t border-[#D6D0C4]',
        dividerText: 'text-[10px] text-[#9A9182] uppercase tracking-wider',
        fileLabel: 'block text-xs font-medium text-[#5C5548] mb-1.5',
        fileDropZone: 'flex items-center justify-center gap-2 border-2 border-dashed border-[#D6D0C4] rounded-sm px-4 py-5 cursor-pointer hover:border-[#D4C200] hover:bg-[#F5E642]/10 transition-colors',
        fileDropIcon: 'w-4 h-4 text-[#9A9182]',
        fileDropText: 'text-xs text-[#5C5548]',
        errorBanner: 'text-xs text-[#8B2020] bg-[#FFE0E0] border border-[#C8A0A0] rounded-sm px-3 py-2',
    },

    authModal: {
        tabBar: 'flex gap-1 px-4 py-2 bg-[#F0ECE3] border-b border-[#D6D0C4] overflow-x-auto',
        tabActive: 'px-3 py-1.5 text-[11px] font-medium rounded-sm bg-[#F5E642] text-[#3D3520] border border-[#D4C200] flex items-center gap-1.5 shrink-0',
        tabInactive: 'px-3 py-1.5 text-[11px] font-medium rounded-sm text-[#9A9182] hover:text-[#1A1814] transition-colors flex items-center gap-1.5 shrink-0',
        titleIcon: 'w-4 h-4 text-[#5C5548]',
        titleText: 'text-sm font-medium text-[#1A1814]',
        closeButton: 'text-xs bg-[#1A1814] hover:bg-[#5C5548] text-[#F9F7F2] px-4 py-2 rounded-sm font-medium transition-colors',
        schemeType: 'text-[10px] text-[#9A9182]',
        authorizedBadge: 'text-[9px] text-[#3A6B30] bg-[#DFF0D8] border border-[#A8C8A0] rounded-sm px-1.5 py-0.5 font-semibold uppercase tracking-wide',
        schemeDescription: 'text-[10px] text-[#9A9182]',
        fieldLabel: 'block text-[10px] text-[#5C5548] mb-1',
        fieldLabelHint: 'text-[#9A9182] font-sans',
        input: 'w-full text-xs border border-[#D6D0C4] rounded-sm px-3 py-2 bg-[#FDFCF9] text-[#1A1814] placeholder-[#B0A898] focus:outline-none focus:ring-1 focus:ring-[#D4C200] focus:border-[#D4C200] font-mono',
        tokenWrapper: 'flex items-stretch border border-[#D6D0C4] rounded-sm overflow-hidden bg-[#FDFCF9] focus-within:ring-1 focus-within:ring-[#D4C200] focus-within:border-[#D4C200] transition-all',
        tokenPrefix: 'px-2.5 flex items-center text-[10px] text-[#9A9182] bg-[#F0ECE3] border-r border-[#D6D0C4] font-mono shrink-0 select-none',
        tokenField: 'flex-1 text-xs px-2.5 py-2 bg-[#FDFCF9] text-[#1A1814] placeholder-[#B0A898] focus:outline-none font-mono min-w-0',
        saveButton: 'text-xs bg-[#F5E642] hover:bg-[#E6D800] text-[#3D3520] px-3 py-1.5 rounded-sm font-semibold transition-colors',
        clearButton: 'text-xs border border-[#D6D0C4] text-[#5C5548] hover:border-[#D4C200] hover:text-[#1A1814] px-3 py-1.5 rounded-sm font-medium transition-colors',
    },

    serverConfig: {
        chip: {
            base: 'flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1.5 rounded-sm border transition-colors shrink-0 text-[#5C5548] border-[#D6D0C4] bg-[#FDFCF9] hover:bg-[#F0ECE3] hover:border-[#D4C200]',
            open: 'bg-[#F5E642]/30 text-[#3D3520] border-[#D4C200] hover:bg-[#F5E642]/40 hover:border-[#D4C200]',
        },
        chipIcon: 'w-3 h-3 shrink-0 text-[#9A9182]',
        backdrop: 'fixed inset-0 bg-[#1A1814]/40 flex items-center justify-center z-[60]',
        popover: 'bg-[#FDFCF9] rounded shadow-xl w-full max-w-sm mx-4 overflow-hidden border border-[#D6D0C4]',
        popoverHeader: 'flex items-center justify-between px-5 py-4 border-b border-[#D6D0C4]',
        headerIcon: 'w-4 h-4 text-[#5C5548]',
        headerTitle: 'text-sm font-medium text-[#1A1814]',
        closeButton: 'text-[#9A9182] hover:text-[#1A1814] text-xl leading-none',
        sectionDivider: 'px-5 py-4 border-b border-[#D6D0C4]',
        sectionLabel: 'block text-[10px] font-semibold uppercase tracking-wider text-[#9A9182]',
        serverSelect: 'w-full text-[11px] font-mono border border-[#D6D0C4] rounded-sm px-3 py-2 bg-[#FDFCF9] text-[#1A1814] focus:outline-none focus:ring-1 focus:ring-[#D4C200] cursor-pointer',
        variableName: 'text-[11px] font-mono font-medium text-[#1A1814]',
        variableDescription: 'text-[10px] text-[#9A9182] leading-tight mt-0.5',
        variableInput: 'text-[11px] font-mono border border-[#D6D0C4] rounded-sm px-2.5 py-1.5 bg-[#FDFCF9] text-[#1A1814] focus:outline-none focus:ring-1 focus:ring-[#D4C200] w-full',
        resolvedSection: 'px-5 py-4 bg-[#F0ECE3]',
        resolvedLabel: 'text-[10px] font-semibold uppercase tracking-wider text-[#9A9182] mb-1.5',
        resolvedValue: 'text-[11px] font-mono text-[#1A1814] break-all',
    },

    commandBar: {
        backdrop: 'fixed inset-0 bg-[#1A1814]/50 z-[60] flex items-start justify-center pt-[12vh]',
        container: 'bg-[#FDFCF9] rounded shadow-2xl w-full max-w-lg mx-4 flex flex-col overflow-hidden border border-[#D6D0C4] max-h-[70vh]',
        searchRow: 'flex items-center gap-3 px-4 py-3 border-b border-[#D6D0C4] shrink-0',
        searchIcon: 'w-4 h-4 text-[#9A9182] shrink-0',
        input: 'flex-1 bg-transparent text-sm text-[#1A1814] placeholder-[#9A9182] outline-none',
        clearButton: 'text-[#9A9182] hover:text-[#1A1814] text-lg leading-none shrink-0 transition-colors',
        groupTitle: 'px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#9A9182] select-none',
        resultItem: {
            base: 'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[#F0ECE3]',
            active: 'bg-[#F5E642]/30 hover:bg-[#F5E642]/30'
        },
        actionIcon: {
            base: 'w-7 h-7 rounded-sm flex items-center justify-center shrink-0 bg-[#F0ECE3] text-[#5C5548]',
            active: 'bg-[#F5E642]/40 text-[#3D3520]'
        },
        resultLabel: 'text-sm font-medium text-[#1A1814] truncate',
        resultSubtitle: 'text-xs text-[#9A9182] truncate mt-0.5',
        activeChevron: 'w-3.5 h-3.5 text-[#D4C200] shrink-0',
        emptyIcon: 'w-8 h-8 text-[#C5BFad] mb-3',
        emptyText: 'text-sm text-[#9A9182]',
        footer: 'shrink-0 flex items-center gap-4 px-4 py-2 border-t border-[#D6D0C4] bg-[#F0ECE3]',
        shortcutText: 'flex items-center gap-1 text-[11px] text-[#9A9182]',
        shortcutBadge: 'font-mono text-[10px] bg-[#FDFCF9] border border-[#D6D0C4] rounded-sm px-1 py-px',
        specTitle: 'ml-auto text-[11px] text-[#C5BFAD] truncate',
        highlightMark: 'bg-[#F5E642]/60 text-inherit not-italic rounded-sm',
    },

    schema: {
        tabBar: 'flex gap-1 px-3 py-2 bg-[#F0ECE3] border-b border-[#D6D0C4]',
        tabActive: 'px-3 py-1 text-[11px] font-medium rounded-sm bg-[#F5E642] text-[#3D3520] border border-[#D4C200]',
        tabInactive: 'px-3 py-1 text-[11px] font-medium rounded-sm text-[#9A9182] hover:text-[#1A1814] transition-colors',
        description: 'px-4 pt-3 pb-0 text-[11px] text-[#5C5548] leading-relaxed',
        exampleBlock: 'text-[11px] bg-[#F0ECE3] rounded-sm p-3 overflow-x-auto text-[#1A1814] font-mono leading-relaxed',
    },

    schemaNode: {
        name: 'font-mono text-[11px] text-[#1A1814]',
        typeBadge: 'text-[10px] rounded-sm px-1.5 py-0.5 font-mono',
        nullableBadge: 'text-[9px] bg-[#F0ECE3] text-[#9A9182] rounded-sm px-1 font-mono',
        constraint: 'text-[9px] font-mono text-[#9A9182]',
        enumValue: 'text-[9px] text-[#9A9182] font-mono',
        description: 'text-[11px] text-[#5C5548] mt-0.5 leading-relaxed',
        enumKey: 'font-mono text-[#1A1814]',
        enumDesc: 'text-[#9A9182]',
        nestedBorder: 'border-l-2 border-[#D6D0C4] ml-3 pl-3 mt-0.5',
        typeBadgeColors: {
            string: 'bg-[#DFF0D8] text-[#3A6B30]',
            integer: 'bg-[#D8E8F8] text-[#2A5A8B]',
            number: 'bg-[#D8E8F8] text-[#2A5A8B]',
            boolean: 'bg-[#EDD8F0] text-[#7B3A8B]',
            object: 'bg-[#FFF3C0] text-[#7A5A00]',
            array: 'bg-[#D8F0EE] text-[#2A7B78]',
            default: 'bg-[#F0ECE3] text-[#5C5548]',
        },
    },

    schemaDetail: {
        header: 'flex items-center gap-3 px-6 py-5 border-b border-[#D6D0C4] shrink-0',
        typeBadge: 'text-[9px] font-bold font-mono px-[5px] py-[2px] rounded-sm uppercase',
        schemaName: 'font-mono text-sm text-[#1A1814]',
        description: 'text-sm text-[#5C5548] mb-6 leading-relaxed',
        sectionLabel: 'text-xs font-semibold uppercase tracking-wider text-[#9A9182] mb-4',
        schemaBox: 'border border-[#D6D0C4] rounded-sm overflow-hidden bg-[#FDFCF9]',
        typeBadgeColors: {
            string: 'bg-[#DFF0D8] text-[#3A6B30]',
            integer: 'bg-[#D8E8F8] text-[#2A5A8B]',
            number: 'bg-[#D8E8F8] text-[#2A5A8B]',
            boolean: 'bg-[#EDD8F0] text-[#7B3A8B]',
            object: 'bg-[#FFF3C0] text-[#7A5A00]',
            array: 'bg-[#D8F0EE] text-[#2A7B78]',
            default: 'bg-[#F0ECE3] text-[#5C5548]',
        },
    },

    playground: {
        container: 'h-full flex flex-col bg-[#F9F7F2]',
        header: 'flex items-center gap-2 px-5 border-b border-[#D6D0C4] shrink-0 h-[50px]',
        headerTitle: 'text-xs font-semibold text-[#1A1814]',
        emptyState: 'h-full flex flex-col items-center justify-center text-center px-6 gap-3 bg-[#F9F7F2]',
        emptyIconWrapper: 'w-10 h-10 rounded-sm bg-[#F0ECE3] flex items-center justify-center',
        emptyIcon: 'w-5 h-5 text-[#9A9182]',
        emptyText: 'text-sm text-[#9A9182]',
        inputLabel: 'text-[10px] font-semibold uppercase tracking-wider text-[#9A9182] mb-3',
        textInput: 'w-full text-xs border border-[#D6D0C4] rounded-sm px-3 py-2 bg-[#FDFCF9] text-[#1A1814] placeholder-[#B0A898] focus:outline-none focus:ring-1 focus:ring-[#D4C200] focus:border-[#D4C200] transition-colors font-mono',
        selectInput: 'w-full text-xs border border-[#D6D0C4] rounded-sm px-3 py-2 bg-[#FDFCF9] text-[#1A1814] focus:outline-none focus:ring-1 focus:ring-[#D4C200] cursor-pointer transition-colors',
        fileInput: 'block w-full text-xs text-[#5C5548] cursor-pointer file:mr-3 file:py-1.5 file:px-3 file:rounded-sm file:border-0 file:text-xs file:font-medium file:bg-[#F5E642]/40 file:text-[#3D3520] hover:file:bg-[#F5E642]/60',
        fileInputButton: {
            base: 'file:py-1.5 file:px-3 file:rounded-sm file:border-0 file:text-xs file:font-medium file:bg-[#F5E642]/40 file:text-[#3D3520] hover:file:bg-[#F5E642]/60',
            hasFile: 'file:bg-[#F5E642]/60'
        },
        bodyEditor: 'w-full text-[11px] border border-[#D6D0C4] rounded-sm px-3 py-2.5 bg-[#FDFCF9] text-[#1A1814] placeholder-[#B0A898] focus:outline-none focus:ring-1 focus:ring-[#D4C200] focus:border-[#D4C200] font-mono resize-y transition-colors leading-relaxed',
        contentTypeSelector: 'text-[10px] font-mono text-[#9A9182] border border-[#D6D0C4] rounded-sm px-2 py-0.5 bg-[#F0ECE3]',
        sendButton: {
            base: 'shrink-0 px-4 rounded-sm text-xs font-semibold transition-all bg-[#F5E642] hover:bg-[#E6D800] active:scale-[0.98] text-[#3D3520] shadow-sm',
            loading: 'bg-[#F0ECE3] text-[#9A9182] cursor-not-allowed shadow-none',
            disabled: 'bg-[#F0ECE3] text-[#9A9182] cursor-not-allowed shadow-none'
        },
        responsePanel: 'h-full border-t border-[#D6D0C4] flex flex-col',
        responseStatus: {
            base: 'text-[10px] rounded-sm px-1.5 py-0.5 font-mono font-semibold border bg-[#F0ECE3] text-[#5C5548] border-[#D6D0C4]',
            success: 'bg-[#DFF0D8] text-[#3A6B30] border-[#A8C8A0]',
            redirect: 'bg-[#D8E8F8] text-[#2A5A8B] border-[#A0B8D0]',
            clientError: 'bg-[#FFF3C0] text-[#7A5A00] border-[#D4C200]',
            serverError: 'bg-[#FFE0E0] text-[#8B2020] border-[#C8A0A0]'
        },
        responseTime: 'text-[10px] text-[#9A9182] font-mono border border-[#D6D0C4] rounded-sm px-1.5 py-0.5',
        responseSize: 'text-[10px] text-[#9A9182] font-mono',
        responseTabs: 'flex items-center gap-2 px-4 py-2 border-b border-[#D6D0C4] bg-[#F0ECE3]/60 shrink-0',
        responseTab: {
            base: 'px-2.5 py-1 text-[10px] rounded-sm font-medium transition-colors text-[#9A9182] hover:text-[#1A1814]',
            active: 'bg-[#FDFCF9] shadow-sm text-[#1A1814] border border-[#D6D0C4]'
        },
        responseBody: 'flex-1 overflow-auto bg-[#FDFCF9]',
        responseEmpty: 'shrink-0 border-t border-[#D6D0C4] h-10 flex items-center justify-center text-[10px] text-[#C5BFAD]',
        errorBanner: 'mx-5 mb-4 px-3 py-2 bg-[#FFE0E0] border border-[#C8A0A0] rounded-sm text-xs text-[#8B2020]',
    },

    authStatus: {
        sectionLabel: 'text-[10px] font-semibold uppercase tracking-wider text-[#9A9182] mb-3',
        emptyText: 'text-[10px] text-[#9A9182]',
        schemeRow: 'flex items-center justify-between py-2.5 px-3 rounded-sm border border-[#D6D0C4] bg-[#F0ECE3]/60',
        schemeName: 'text-[11px] font-mono text-[#1A1814]',
        schemeType: 'ml-1.5 text-[10px] text-[#9A9182]',
        authorizedBadge: 'text-[9px] text-[#3A6B30] bg-[#DFF0D8] border border-[#A8C8A0] rounded-sm px-1.5 py-0.5 font-semibold uppercase tracking-wide',
        unauthorizedBadge: 'text-[9px] text-[#9A9182] bg-[#F0ECE3] border border-[#D6D0C4] rounded-sm px-1.5 py-0.5 uppercase tracking-wide',
    },

    bodyEditor: {
        fileInput: 'block w-full text-xs text-[#5C5548] cursor-pointer file:mr-3 file:py-1.5 file:px-3 file:rounded-sm file:border-0 file:text-xs file:font-medium file:bg-[#F5E642]/40 file:text-[#3D3520] hover:file:bg-[#F5E642]/60',
        formatButton: 'absolute top-1.5 right-1.5 z-10 text-[10px] text-[#9A9182] hover:text-[#3D3520] transition-colors px-1.5 py-0.5 rounded-sm hover:bg-[#F5E642]/30',
        textarea: 'w-full text-[11px] border border-[#D6D0C4] rounded-sm px-3 py-2.5 bg-[#FDFCF9] text-[#1A1814] placeholder-[#B0A898] focus:outline-none focus:ring-1 focus:ring-[#D4C200] focus:border-[#D4C200] font-mono resize-y transition-colors leading-relaxed',
    },

    paramLabel: {
        nameText: 'font-mono text-[11px] text-[#1A1814]',
        nameDeprecated: 'font-mono text-[11px] line-through text-[#B0A898]',
        locPath: 'text-[9px] font-mono rounded-sm px-1.5 py-0.5 leading-none text-[#7A3A00] bg-[#FFE8D0]',
        locQuery: 'text-[9px] font-mono rounded-sm px-1.5 py-0.5 leading-none text-[#2A7B78] bg-[#D8F0EE]',
        locHeader: 'text-[9px] font-mono rounded-sm px-1.5 py-0.5 leading-none text-[#2A5A8B] bg-[#D8E8F8]',
        locCookie: 'text-[9px] font-mono rounded-sm px-1.5 py-0.5 leading-none text-[#7B3A8B] bg-[#EDD8F0]',
        locForm: 'text-[9px] font-mono rounded-sm px-1.5 py-0.5 leading-none text-[#3A6B30] bg-[#DFF0D8]',
        locDefault: 'text-[9px] font-mono rounded-sm px-1.5 py-0.5 leading-none text-[#5C5548] bg-[#F0ECE3]',
        typeBadge: 'text-[9px] font-mono text-[#7B3A8B] bg-[#EDD8F0] rounded-sm px-1.5 py-0.5 leading-none',
        requiredBadge: 'text-[9px] font-semibold text-[#8B2020] bg-[#FFE0E0] rounded-sm px-1.5 py-0.5 leading-none',
        deprecatedBadge: 'text-[9px] font-semibold text-[#7A5A00] bg-[#FFF3C0] rounded-sm px-1.5 py-0.5 leading-none',
        constraintBadge: 'text-[9px] font-mono text-[#5C5548] bg-[#F0ECE3] rounded-sm px-1.5 py-0.5 leading-none',
        tooltipIcon: 'w-3.5 h-3.5 text-[#9A9182] cursor-help hover:text-[#5C5548] transition-colors',
        tooltipPopup: 'pointer-events-none absolute bottom-full right-0 mb-2 w-56 rounded-sm bg-[#1A1814] px-2.5 py-2 text-[10px] text-[#F0ECE3] leading-snug shadow-lg opacity-0 group-hover/tip:opacity-100 transition-opacity z-50',
    },

    responsePanel: {
        loadingState: 'shrink-0 border-t border-[#D6D0C4] h-16 flex items-center justify-center gap-2 text-xs text-[#9A9182] bg-[#F0ECE3]/50',
        emptyState: 'shrink-0 border-t border-[#D6D0C4] h-10 flex items-center justify-center',
        emptyText: 'text-[10px] text-[#C5BFAD]',
        container: 'h-full border-t border-[#D6D0C4] flex flex-col',
        tabBar: 'flex items-center gap-2 px-4 py-2 border-b border-[#D6D0C4] bg-[#F0ECE3]/60 shrink-0',
        tab: {
            base: 'px-2.5 py-1 text-[10px] rounded-sm font-medium transition-colors text-[#9A9182] hover:text-[#1A1814]',
            active: 'bg-[#FDFCF9] shadow-sm text-[#1A1814] border border-[#D6D0C4]'
        },
        tabDivider: 'w-px h-3 bg-[#D6D0C4] mx-1',
        headerCount: 'ml-0.5 text-[#C5BFAD]',
        copyButton: {
            base: 'flex items-center gap-1 text-[10px] px-2 py-1 rounded-sm hover:bg-[#F0ECE3] transition-colors text-[#9A9182] hover:text-[#1A1814]',
            copied: 'text-[#3A6B30]'
        },
        statusNeutral: 'text-[10px] border rounded-sm px-1.5 py-0.5 font-mono font-semibold text-[#5C5548] bg-[#F0ECE3] border-[#D6D0C4]',
        statusSuccess: 'text-[10px] border rounded-sm px-1.5 py-0.5 font-mono font-semibold text-[#3A6B30] bg-[#DFF0D8] border-[#A8C8A0]',
        statusError: 'text-[10px] border rounded-sm px-1.5 py-0.5 font-mono font-semibold text-[#8B2020] bg-[#FFE0E0] border-[#C8A0A0]',
        bodyContainer: 'flex-1 overflow-auto bg-[#FDFCF9]',
        bodyPre: 'text-[11px] p-3 text-[#1A1814] font-mono leading-relaxed',
        headersPre: 'text-[11px] p-3 text-[#5C5548] font-mono leading-relaxed',
    },

    sendBar: {
        container: 'px-5 py-3 border-b border-[#D6D0C4] shrink-0 bg-[#F0ECE3]/50',
        urlBox: 'flex items-center gap-2 flex-1 min-w-0 bg-[#FDFCF9] rounded-sm px-2.5 py-2 border border-[#D6D0C4]',
        urlCode: 'text-[10px] text-[#5C5548] leading-tight flex-1 min-w-0 break-all',
        sendButtonActive: 'shrink-0 px-4 rounded-sm text-xs font-semibold transition-all bg-[#F5E642] hover:bg-[#E6D800] active:scale-[0.98] text-[#3D3520] shadow-sm',
        sendButtonDisabled: 'shrink-0 px-4 rounded-sm text-xs font-semibold transition-all bg-[#F0ECE3] text-[#B0A898] cursor-not-allowed',
    },

    inputScalar: {
        input: 'w-full text-xs border border-[#D6D0C4] rounded-sm px-3 py-2 bg-[#FDFCF9] text-[#1A1814] placeholder-[#B0A898] focus:outline-none focus:ring-1 focus:ring-[#D4C200] focus:border-[#D4C200] transition-colors font-mono',
        inputInvalid: 'w-full text-xs border border-[#C8A0A0] rounded-sm px-3 py-2 bg-[#FDFCF9] text-[#1A1814] placeholder-[#B0A898] focus:outline-none focus:ring-1 focus:ring-[#8B2020] focus:border-[#8B2020] transition-colors font-mono',
    },

    inputBoolean: {
        select: 'w-full text-xs border border-[#D6D0C4] rounded-sm px-3 py-2 bg-[#FDFCF9] text-[#1A1814] focus:outline-none focus:ring-1 focus:ring-[#D4C200] focus:border-[#D4C200] transition-colors font-mono',
        selectInvalid: 'w-full text-xs border border-[#C8A0A0] rounded-sm px-3 py-2 bg-[#FDFCF9] text-[#1A1814] focus:outline-none focus:ring-1 focus:ring-[#8B2020] focus:border-[#8B2020] transition-colors font-mono',
    },

    inputEnum: {
        select: 'w-full text-xs border border-[#D6D0C4] rounded-sm px-3 py-2 bg-[#FDFCF9] text-[#1A1814] focus:outline-none focus:ring-1 focus:ring-[#D4C200] focus:border-[#D4C200] transition-colors font-mono',
        selectInvalid: 'w-full text-xs border border-[#C8A0A0] rounded-sm px-3 py-2 bg-[#FDFCF9] text-[#1A1814] focus:outline-none focus:ring-1 focus:ring-[#8B2020] focus:border-[#8B2020] transition-colors font-mono',
    },

    inputFile: {
        input: 'block w-full text-xs text-[#5C5548] cursor-pointer file:mr-3 file:py-1.5 file:px-3 file:rounded-sm file:border-0 file:text-xs file:font-medium file:bg-[#F5E642]/40 file:text-[#3D3520] hover:file:bg-[#F5E642]/60',
    },

    inputArray: {
        rowInput: 'flex-1 text-xs border border-[#D6D0C4] rounded-sm px-3 py-2 bg-[#FDFCF9] text-[#1A1814] placeholder-[#B0A898] focus:outline-none focus:ring-1 focus:ring-[#D4C200] focus:border-[#D4C200] transition-colors font-mono',
        rowInputInvalid: 'flex-1 text-xs border border-[#C8A0A0] rounded-sm px-3 py-2 bg-[#FDFCF9] text-[#1A1814] placeholder-[#B0A898] focus:outline-none focus:ring-1 focus:ring-[#8B2020] focus:border-[#8B2020] transition-colors font-mono',
        rowIndex: 'text-[9px] text-[#C5BFAD] font-mono w-4 text-right shrink-0',
        removeButton: 'shrink-0 w-5 h-5 flex items-center justify-center rounded-sm text-[#C5BFAD] hover:text-[#8B2020] hover:bg-[#FFE0E0] disabled:opacity-0 transition-colors',
        addButton: 'flex items-center gap-1 text-[10px] text-[#D4C200] hover:text-[#3D3520] transition-colors',
        hint: 'text-[9px] text-[#C5BFAD] font-mono',
    },

    inputMultiSelect: {
        trigger: 'w-full text-xs border border-[#D6D0C4] rounded-sm px-3 py-2 bg-[#FDFCF9] text-[#1A1814] focus:outline-none focus:ring-1 focus:ring-[#D4C200] focus:border-[#D4C200] transition-colors font-mono flex items-center justify-between text-left',
        triggerInvalid: 'w-full text-xs border border-[#C8A0A0] rounded-sm px-3 py-2 bg-[#FDFCF9] text-[#1A1814] focus:outline-none focus:ring-1 focus:ring-[#8B2020] focus:border-[#8B2020] transition-colors font-mono flex items-center justify-between text-left',
        placeholder: 'text-[#B0A898]',
        dropdown: 'absolute z-20 mt-1 w-full rounded-sm border border-[#D6D0C4] bg-[#FDFCF9] shadow-lg py-1',
        dropdownItem: 'flex items-center gap-2 px-3 py-1.5 hover:bg-[#F0ECE3] cursor-pointer',
        optionText: 'text-xs font-mono text-[#1A1814]',
    },

    inputObject: {
        textarea: 'w-full text-xs border border-[#D6D0C4] rounded-sm px-3 py-2 bg-[#FDFCF9] text-[#1A1814] placeholder-[#B0A898] focus:outline-none focus:ring-1 focus:ring-[#D4C200] focus:border-[#D4C200] transition-colors font-mono resize-y',
        textareaInvalid: 'w-full text-xs border border-[#C8A0A0] rounded-sm px-3 py-2 bg-[#FDFCF9] text-[#1A1814] placeholder-[#B0A898] focus:outline-none focus:ring-1 focus:ring-[#8B2020] focus:border-[#8B2020] transition-colors font-mono resize-y',
    },

    detailPane: {
        spinner: 'w-5 h-5 animate-spin text-[#D4C200]',
        errorIcon: 'w-10 h-10 rounded-sm bg-[#FFE0E0] flex items-center justify-center shrink-0 text-[#8B2020]',
        errorMessage: 'text-sm text-[#8B2020]',
        retryLink: 'text-xs text-[#9A9182] hover:text-[#1A1814] underline underline-offset-2',
        emptyIcon: 'w-10 h-10 rounded-sm bg-[#F0ECE3] flex items-center justify-center text-[#9A9182]',
        emptyMessage: 'text-sm text-[#9A9182]',
    },

    verticalResizable: {
        handle: 'w-8 h-0.5 rounded-full bg-[#D6D0C4] group-hover:bg-[#D4C200] transition-colors',
    },

    syntax: {
        key: '#2A5A8B',
        string: '#3A6B30',
        boolean: '#7B3A8B',
        null: '#9A9182',
        number: '#7A5A00',
    },

    paneHandle: 'border-l border-[#D6D0C4] group-hover:border-[#D4C200] group-[.dragging]:border-[#F5E642] transition-colors duration-150',
    focusRing: 'focus:ring-2 focus:ring-[#D4C200] focus:ring-offset-1',
    scrollbar: {thumb: 'bg-[#D6D0C4]', thumbHover: 'bg-[#C5BFAD]'},
};