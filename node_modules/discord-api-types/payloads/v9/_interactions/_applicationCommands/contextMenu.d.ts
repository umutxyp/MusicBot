import type { APIBaseApplicationCommandInteractionData } from './internals';
import type { Snowflake } from '../../../../globals';
import type { APIMessage } from '../../channel';
import type { APIApplicationCommandInteractionWrapper, ApplicationCommandType } from '../applicationCommands';
import type { APIDMInteractionWrapper, APIGuildInteractionWrapper, APIUserInteractionDataResolved } from '../base';
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-data
 */
export interface APIUserApplicationCommandInteractionData extends APIBaseApplicationCommandInteractionData<ApplicationCommandType.User> {
    target_id: Snowflake;
    resolved: APIUserInteractionDataResolved;
}
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-data
 */
export interface APIMessageApplicationCommandInteractionData extends APIBaseApplicationCommandInteractionData<ApplicationCommandType.Message> {
    target_id: Snowflake;
    resolved: APIMessageApplicationCommandInteractionDataResolved;
}
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-resolved-data-structure
 */
export interface APIMessageApplicationCommandInteractionDataResolved {
    messages: Record<Snowflake, APIMessage>;
}
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-data
 */
export declare type APIContextMenuInteractionData = APIUserApplicationCommandInteractionData | APIMessageApplicationCommandInteractionData;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 */
export declare type APIUserApplicationCommandInteraction = APIApplicationCommandInteractionWrapper<APIUserApplicationCommandInteractionData>;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 */
export declare type APIUserApplicationCommandDMInteraction = APIDMInteractionWrapper<APIUserApplicationCommandInteraction>;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 */
export declare type APIUserApplicationCommandGuildInteraction = APIGuildInteractionWrapper<APIUserApplicationCommandInteraction>;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 */
export declare type APIMessageApplicationCommandInteraction = APIApplicationCommandInteractionWrapper<APIMessageApplicationCommandInteractionData>;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 */
export declare type APIMessageApplicationCommandDMInteraction = APIDMInteractionWrapper<APIMessageApplicationCommandInteraction>;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 */
export declare type APIMessageApplicationCommandGuildInteraction = APIGuildInteractionWrapper<APIMessageApplicationCommandInteraction>;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 */
export declare type APIContextMenuInteraction = APIUserApplicationCommandInteraction | APIMessageApplicationCommandInteraction;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 */
export declare type APIContextMenuDMInteraction = APIUserApplicationCommandDMInteraction | APIMessageApplicationCommandDMInteraction;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 */
export declare type APIContextMenuGuildInteraction = APIUserApplicationCommandGuildInteraction | APIMessageApplicationCommandGuildInteraction;
//# sourceMappingURL=contextMenu.d.ts.map