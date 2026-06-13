/** Text or number input for scalar parameter values (string, integer, number). */
import {slot, type ThemeSlot, useTheme} from "../../../themes";

export interface ScalarInputTheme {
    input: ThemeSlot;
    inputInvalid: ThemeSlot;
}

interface Props {
    value: string;
    name: string;
    type?: string;
    minimum?: number;
    maximum?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    example?: unknown;
    invalid?: boolean;
    onChange: (value: string) => void;
}

/** Renders a text or number input, wiring constraint props to the matching HTML attributes. */
export default function ScalarInput({
                                        value,
                                        name,
                                        type,
                                        minimum,
                                        maximum,
                                        minLength,
                                        maxLength,
                                        pattern,
                                        example,
                                        invalid,
                                        onChange
                                    }: Props) {
    const t = useTheme().inputScalar;
    const isNumeric = type === "integer" || type === "number";
    return (
        <input
            type={isNumeric ? "number" : "text"}
            className={invalid ? slot(t.inputInvalid) : slot(t.input)}
            value={value}
            placeholder={example != null ? String(example) : name}
            min={minimum}
            max={maximum}
            minLength={minLength}
            maxLength={maxLength}
            pattern={pattern}
            onInput={(e) => onChange((e.target as HTMLInputElement).value)}
        />
    );
}