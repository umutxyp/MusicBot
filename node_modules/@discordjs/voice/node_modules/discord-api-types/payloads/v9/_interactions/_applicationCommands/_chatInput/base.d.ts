import type { APIApplicationCommandOptionChoice, ApplicationCommandOptionType } from './shared';
import type { LocalizationMap } from '../../../../../v9';
export interface APIApplicationCommandOptionBase<Type extends ApplicationCommandOptionType> {
    type: Type;
    name: string;
    name_localizations?: LocalizationMap | null;
    description: string;
    description_localizations?: LocalizationMap | null;
    required?: boolean;
}
export interface APIInteractionDataOptionBase<T extends ApplicationCommandOptionType, D> {
    name: string;
    type: T;
    value: D;
}
export declare type APIApplicationCommandOptionWithAutocompleteOrChoicesWrapper<Base extends APIApplicationCommandOptionBase<ApplicationCommandOptionType>, ChoiceType extends APIApplicationCommandOptionChoice> = (Base & {
    autocomplete: true;
}) | (Base & {
    autocomplete?: false;
    choices?: ChoiceType[];
});
//# sourceMappingURL=base.d.ts.map