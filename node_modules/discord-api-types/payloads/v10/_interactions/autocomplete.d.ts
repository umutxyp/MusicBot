import type { APIBaseInteraction, APIChatInputApplicationCommandInteractionData, APIDMInteractionWrapper, APIGuildInteractionWrapper, InteractionType } from '../index';
export declare type APIApplicationCommandAutocompleteInteraction = APIBaseInteraction<InteractionType.ApplicationCommandAutocomplete, APIChatInputApplicationCommandInteractionData> & Required<Pick<APIBaseInteraction<InteractionType.ApplicationCommandAutocomplete, Required<Pick<APIChatInputApplicationCommandInteractionData, 'options'>>>, 'data'>>;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 */
export declare type APIApplicationCommandAutocompleteDMInteraction = APIDMInteractionWrapper<APIApplicationCommandAutocompleteInteraction>;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 */
export declare type APIApplicationCommandAutocompleteGuildInteraction = APIGuildInteractionWrapper<APIApplicationCommandAutocompleteInteraction>;
//# sourceMappingURL=autocomplete.d.ts.map