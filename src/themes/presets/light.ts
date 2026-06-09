/**
 * Light theme — the reference implementation derived from current light-mode Tailwind classes.
 * This file is the canonical source for what each slot should look like.
 */
import type { AppTheme } from '../contract';

const methodBadge = {
  base:    'method-badge shrink-0 text-[9px] font-bold font-mono px-[5px] py-[2px] rounded uppercase w-[36px] text-center',
  get:     'bg-blue-50 text-blue-700',
  post:    'bg-green-50 text-green-700',
  put:     'bg-amber-50 text-amber-700',
  delete:  'bg-red-50 text-red-700',
  patch:   'bg-pink-50 text-pink-700',
  options: 'bg-gray-100 text-gray-600',
  head:    'bg-gray-100 text-gray-600',
};

export const lightTheme: AppTheme = {
  name: 'light',

  nav: {
    container:         'shrink-0 bg-gray-50 overflow-y-auto flex flex-col h-full',
    divider:           'border-t border-gray-100',
    searchWrapper:     'px-4 py-3 border-b border-gray-100 shrink-0',
    searchInput:       'w-full pl-7 pr-6 py-2 text-[11px] border border-gray-200 rounded-md bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors',
    searchIcon:        'absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none',
    searchClearButton: 'absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 leading-none text-sm',
    tabBar:            'flex gap-1 px-4 py-2 border-b border-gray-100',
    tab:               { base: 'px-2.5 py-1 text-[11px] font-medium rounded transition-colors text-gray-400 hover:text-gray-600', active: 'bg-white text-gray-700 border border-gray-200 shadow-sm' },
    tagHeader:         'w-full flex items-center justify-between px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors',
    tagChevron:        { base: 'w-3 h-3 transition-transform -rotate-90', open: 'rotate-0' },
    tagCount:          'text-[10px] text-gray-400 font-mono',
    endpointItem:      { base: 'nav-endpoint w-full flex items-center gap-2.5 px-4 py-2 text-left transition-colors text-gray-500 hover:bg-gray-50 hover:text-gray-800', active: 'bg-gray-100 text-gray-900', deprecated: 'opacity-60' },
    endpointPath:      'truncate text-[11px] font-mono',
    methodBadge,
    schemaItem:        { base: 'w-full text-left flex flex-col gap-0.5 px-4 py-2 transition-colors hover:bg-gray-50', active: 'bg-gray-100' },
    schemaName:        'truncate text-[11px] font-mono text-gray-700',
    schemaTypeBadge:   'shrink-0 text-[9px] font-bold font-mono px-[5px] py-[2px] rounded bg-purple-50 text-purple-700 uppercase',
    emptyState:        'flex flex-col items-center justify-center px-4 py-8 text-center text-[11px] text-gray-400',
  },

  endpoint: {
    container:          'h-full flex flex-col',
    header:             'flex items-center gap-3 px-6 py-5 border-b border-gray-100 shrink-0 h-[50px]',
    methodBadge,
    path:               'font-mono text-sm text-gray-800',
    summary:            'text-sm text-gray-700 mb-2 font-medium',
    description:        'text-xs text-gray-500 mb-8 leading-relaxed',
    deprecated:         'ml-auto text-[10px] bg-amber-50 text-amber-600 border border-amber-200 rounded px-2 py-0.5',
    paramSection:       'mb-8',
    paramSectionTitle:  'text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4',
    paramRow:           { base: 'border-b border-gray-100 last:border-0 bg-white hover:bg-gray-50/50 transition-colors', required: '' },
    paramName:          'font-mono text-[11px] text-gray-800',
    paramType:          'text-[10px] bg-gray-100 text-gray-600 rounded px-1.5 py-0.5 font-mono',
    paramRequired:      'text-red-500 text-[9px] font-semibold ml-1',
    paramDescription:   'text-xs text-gray-500',
    responseAccordion:  'border border-gray-100 rounded-lg overflow-hidden divide-y divide-gray-100',
    responseHeader:     { base: 'w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left', open: '' },
    responseStatusCode: { base: 'text-xs font-mono font-semibold', success: 'text-green-600', redirect: 'text-blue-600', clientError: 'text-amber-600', serverError: 'text-red-600' },
    responseDescription:'text-xs text-gray-600 flex-1',
    bodySection:        'mb-8',
    bodyContentType:    'text-[10px] text-gray-500 font-mono',
  },

  playground: {
    container:           'h-full flex flex-col bg-white',
    header:              'flex items-center gap-2 px-5 border-b border-gray-100 shrink-0 h-[50px]',
    inputLabel:          'text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3',
    textInput:           'w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors font-mono',
    selectInput:         'w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer transition-colors',
    fileInput:           'block w-full text-xs text-gray-600 cursor-pointer file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100',
    fileInputButton:     { base: 'file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100', hasFile: 'file:bg-blue-100' },
    bodyEditor:          'w-full text-[11px] border border-gray-200 rounded-lg px-3 py-2.5 bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 font-mono resize-y transition-colors leading-relaxed',
    contentTypeSelector: 'text-[10px] font-mono text-gray-500 border border-gray-200 rounded px-2 py-0.5 bg-gray-50',
    sendButton:          { base: 'shrink-0 px-4 rounded-lg text-xs font-semibold transition-all bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white shadow-sm', loading: 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none', disabled: 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' },
    responsePanel:       'h-full border-t border-gray-100 flex flex-col',
    responseStatus:      { base: 'text-[10px] rounded px-1.5 py-0.5 font-mono font-semibold border bg-gray-50 text-gray-600 border-gray-200', success: 'bg-green-50 text-green-600 border-green-200', redirect: 'bg-blue-50 text-blue-600 border-blue-200', clientError: 'bg-amber-50 text-amber-600 border-amber-200', serverError: 'bg-red-50 text-red-600 border-red-200' },
    responseTime:        'text-[10px] text-gray-400 font-mono border border-gray-200 rounded px-1.5 py-0.5',
    responseSize:        'text-[10px] text-gray-400 font-mono',
    responseTabs:        'flex items-center gap-2 px-4 py-2 border-b border-gray-100 bg-gray-50/50 shrink-0',
    responseTab:         { base: 'px-2.5 py-1 text-[10px] rounded font-medium transition-colors text-gray-400 hover:text-gray-600', active: 'bg-white shadow-sm text-gray-700 border border-gray-200' },
    responseBody:        'flex-1 overflow-auto bg-white',
    responseEmpty:       'shrink-0 border-t border-gray-100 h-10 flex items-center justify-center text-[10px] text-gray-300',
    errorBanner:         'mx-5 mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600',
  },

  topBar: {
    container:       'relative flex items-center gap-4 px-6 h-16 border-b border-gray-100 bg-white shrink-0 z-10',
    title:           'text-sm font-semibold text-gray-900 truncate',
    serverChip:      { base: 'flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1.5 rounded-lg border transition-colors shrink-0 text-gray-600 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300', open: 'bg-blue-50 text-blue-700 border-blue-200' },
    themeButton:     'flex items-center gap-1.5 text-xs rounded-md px-2.5 py-1.5 font-medium border transition-all shrink-0 text-gray-600 bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300',
    authButton:      { base: 'flex items-center gap-1.5 text-xs rounded-md px-2.5 py-1.5 font-medium border transition-all shrink-0 text-gray-600 bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300', configured: 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100' },
    shortcutsButton: 'flex items-center gap-1.5 text-xs rounded-md px-2.5 py-1.5 font-medium border transition-all shrink-0 text-gray-600 bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300',
    loadButton:      'flex items-center gap-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-md px-3 py-1.5 font-medium transition-colors shrink-0 shadow-sm',
  },

  modal: {
    backdrop:    'fixed inset-0 bg-black/30 flex items-center justify-center z-50',
    container:   'bg-white rounded-xl shadow-xl w-full mx-4 overflow-hidden',
    header:      'flex items-center justify-between px-5 py-4 border-b border-gray-100',
    title:       'text-sm font-semibold text-gray-800',
    closeButton: 'text-gray-400 hover:text-gray-600 text-xl leading-none',
    body:        '',
    footer:      'px-5 py-3 bg-gray-50 border-t border-gray-100',
  },

  schema: {
    container:      '',
    tabBar:         'flex gap-1 px-3 py-2 bg-gray-50/80 border-b border-gray-100',
    tab:            { base: 'px-3 py-1 text-[11px] font-medium rounded-md text-gray-400 hover:text-gray-600 transition-colors', active: 'bg-white text-gray-700 border border-gray-200' },
    nodeRow:        'py-0.5',
    nodeKey:        'font-mono text-[11px] text-gray-800',
    nodeType:       { base: 'text-[10px] rounded px-1.5 py-0.5 font-mono', string: 'bg-emerald-50 text-emerald-700', integer: 'bg-blue-50 text-blue-700', number: 'bg-blue-50 text-blue-700', boolean: 'bg-purple-50 text-purple-700', object: 'bg-amber-50 text-amber-700', array: 'bg-cyan-50 text-cyan-700' },
    nodeDescription:'text-[11px] text-gray-500 mt-0.5 leading-relaxed',
    nodeRequired:   'text-red-400 text-[9px] font-semibold',
    nodeExpandButton: { base: 'w-3.5 h-3.5 transition-transform', open: 'rotate-90' },
    nodeNested:     'border-l-2 border-gray-100 ml-3 pl-3 mt-0.5',
    exampleBlock:   'text-[11px] bg-gray-50 rounded-md p-3 overflow-x-auto text-gray-700 font-mono leading-relaxed',
  },

  authModal: {
    schemeSection:   '',
    schemeName:      'text-sm font-semibold text-gray-800',
    schemeType:      'text-[10px] text-gray-400',
    schemeDescription:'text-[10px] text-gray-400',
    tokenInput:      'w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 font-mono',
    usernameInput:   'w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 font-mono',
    passwordInput:   'w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 font-mono',
    saveButton:      'text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md font-medium transition-colors',
    clearButton:     'text-xs border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 px-3 py-1.5 rounded-md font-medium transition-colors',
  },

  serverConfig: {
    chip:               { base: 'flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1.5 rounded-lg border transition-colors shrink-0 text-gray-600 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300', open: 'bg-blue-50 text-blue-700 border-blue-200' },
    popover:            'bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 overflow-hidden',
    serverOption:       { base: 'w-full text-[11px] font-mono border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer', selected: '' },
    variableLabel:      'text-[11px] font-mono font-medium text-gray-700',
    variableInput:      'text-[11px] font-mono border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 w-full',
    variableDescription:'text-[10px] text-gray-400 leading-tight mt-0.5',
  },

  commandBar: {
    backdrop:      'fixed inset-0 bg-black/40 z-[60] flex items-start justify-center pt-[12vh]',
    container:     'bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 flex flex-col overflow-hidden border border-gray-200 max-h-[70vh]',
    input:         'flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none',
    resultItem:    { base: 'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-gray-50', highlighted: 'bg-blue-50' },
    resultLabel:   'text-sm font-medium text-gray-800 truncate',
    resultCategory:'px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400 select-none',
    emptyState:    'flex flex-col items-center justify-center py-12 text-center text-sm text-gray-400',
    shortcutBadge: 'font-mono text-[10px] bg-white border border-gray-200 rounded px-1 py-px',
  },

  syntax: {
    key:     '#7c3aed',
    string:  '#0369a1',
    boolean: '#047857',
    null:    '#9f1239',
    number:  '#b45309',
  },

  paneHandle: 'bg-gray-200',
  focusRing:  'ring-2 ring-blue-500',
  scrollbar:  { thumb: 'bg-gray-300', thumbHover: 'bg-gray-400' },
};