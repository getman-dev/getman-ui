/**
 * AppTheme — the full theme contract, assembled from per-component interfaces.
 * This file only imports types; it contains no styling values.
 */
import type {AppRootTheme} from '../App';
import type {NavTheme} from '../features/nav/Nav';
import type {DetailPaneTheme} from '../features/nav/DetailPane';
import type {EndpointTheme} from '../features/endpoint/EndpointDetail';
import type {AuthModalTheme} from '../features/auth/AuthModal';
import type {PlaygroundTheme} from '../features/playground/Playground';
import type {AuthStatusTheme} from '../features/playground/AuthStatus';
import type {BodyEditorTheme} from '../features/playground/BodyEditor';
import type {ParamLabelTheme} from '../features/playground/ParamLabel';
import type {ResponsePanelTheme} from '../features/playground/ResponsePanel';
import type {SendBarTheme} from '../features/playground/SendBar';
import type {ScalarInputTheme} from '../features/playground/inputs/ScalarInput';
import type {BooleanSelectTheme} from '../features/playground/inputs/BooleanSelect';
import type {EnumSelectTheme} from '../features/playground/inputs/EnumSelect';
import type {FileInputTheme} from '../features/playground/inputs/FileInput';
import type {ArrayInputTheme} from '../features/playground/inputs/ArrayInput';
import type {MultiSelectTheme} from '../features/playground/inputs/MultiSelect';
import type {ObjectInputTheme} from '../features/playground/inputs/ObjectInput';
import type {SchemaDetailTheme} from '../features/schema/SchemaDetail';
import type {SchemaNodeTheme} from '../features/schema/SchemaNode';
import type {SchemaViewerTheme} from '../features/schema/SchemaViewer';
import type {ServerConfigTheme} from '../features/server/ServerConfig';
import type {CommandBarTheme} from '../shared/components/CommandBar';
import type {LoadModalTheme} from '../shared/components/LoadModal';
import type {ModalTheme} from '../shared/components/Modal';
import type {ThemePickerTheme} from '../shared/components/ThemePicker';
import type {TopBarTheme} from '../shared/components/TopBar';
import type {VerticalResizableTheme} from '../shared/components/VerticalResizable';
import type {SyntaxTheme} from '../shared/utils/highlight';

export type {
    AppRootTheme,
    NavTheme,
    DetailPaneTheme,
    EndpointTheme,
    AuthModalTheme,
    PlaygroundTheme,
    AuthStatusTheme,
    BodyEditorTheme,
    ParamLabelTheme,
    ResponsePanelTheme,
    SendBarTheme,
    ScalarInputTheme,
    BooleanSelectTheme,
    EnumSelectTheme,
    FileInputTheme,
    ArrayInputTheme,
    MultiSelectTheme,
    ObjectInputTheme,
    SchemaDetailTheme,
    SchemaNodeTheme,
    SchemaViewerTheme,
    ServerConfigTheme,
    CommandBarTheme,
    LoadModalTheme,
    ModalTheme,
    ThemePickerTheme,
    TopBarTheme,
    VerticalResizableTheme,
    SyntaxTheme,
};

/** The complete theme contract. Every built-in and custom theme must satisfy this interface. */
export interface AppTheme {
    /** Display name shown in the theme picker UI. */
    name: string;
    /** Three representative hex colors [background, accent, text] shown as swatches in the theme picker. */
    swatches: [string, string, string];

    // Layout & shell
    appRoot: AppRootTheme;
    detailPane: DetailPaneTheme;
    verticalResizable: VerticalResizableTheme;

    // Navigation
    nav: NavTheme;

    // Content views
    endpoint: EndpointTheme;
    schema: SchemaViewerTheme;
    schemaNode: SchemaNodeTheme;
    schemaDetail: SchemaDetailTheme;

    // Playground
    playground: PlaygroundTheme;
    authStatus: AuthStatusTheme;
    bodyEditor: BodyEditorTheme;
    paramLabel: ParamLabelTheme;
    responsePanel: ResponsePanelTheme;
    sendBar: SendBarTheme;
    inputScalar: ScalarInputTheme;
    inputBoolean: BooleanSelectTheme;
    inputEnum: EnumSelectTheme;
    inputFile: FileInputTheme;
    inputArray: ArrayInputTheme;
    inputMultiSelect: MultiSelectTheme;
    inputObject: ObjectInputTheme;

    // Auth & server
    authModal: AuthModalTheme;
    serverConfig: ServerConfigTheme;

    // Shared components
    topBar: TopBarTheme;
    themePicker: ThemePickerTheme;
    modal: ModalTheme;
    loadModal: LoadModalTheme;
    commandBar: CommandBarTheme;

    // Utilities
    syntax: SyntaxTheme;
    /** Tailwind bg class for the resize handle divider line. */
    paneHandle: string;
    /** Tailwind ring classes applied to focused interactive elements. */
    focusRing: string;
    scrollbar: { thumb: string; thumbHover: string };
    /** CSS font-family value applied to the app root element. */
    fontFamily: string;
}