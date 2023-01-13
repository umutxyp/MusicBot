import type { APIBaseApplicationCommandInteractionData } from './internals';
import type { Snowflake } from '../../../../globals';
import type { APIMessage } from '../../channel';
import type { APIUser } from '../../user';
import type { APIApplicationCommandInteractionWrapper, APIInteractionDataResolvedGuildMember, ApplicationCommandType } from '../applicationCommands';
import type { APIDMInteractionWrapper, APIGuildInteractionWrapper } from '../base';
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-data-structure
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export interface APIUserApplicationCommandInteractionData extends APIBaseApplicationCommandInteractionData<ApplicationCommandType.User> {
    target_id: Snowflake;
    resolved: APIUserApplicationCommandInteractionDataResolved;
}
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-resolved-data-structure
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export interface APIUserApplicationCommandInteractionDataResolved {
    users: Record<Snowflake, APIUser>;
    members?: Record<Snowflake, APIInteractionDataResolvedGuildMember>;
}
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-data-structure
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export interface APIMessageApplicationCommandInteractionData extends APIBaseApplicationCommandInteractionData<ApplicationCommandType.Message> {
    target_id: Snowflake;
    resolved: APIMessageApplicationCommandInteractionDataResolved;
}
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-resolved-data-structure
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export interface APIMessageApplicationCommandInteractionDataResolved {
    messages: Record<Snowflake, APIMessage>;
}
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-data-structure
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type APIContextMenuInteractionData = APIUserApplicationCommandInteractionData | APIMessageApplicationCommandInteractionData;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type APIUserApplicationCommandInteraction = APIApplicationCommandInteractionWrapper<APIUserApplicationCommandInteractionData>;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type APIUserApplicationCommandDMInteraction = APIDMInteractionWrapper<APIUserApplicationCommandInteraction>;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type APIUserApplicationCommandGuildInteraction = APIGuildInteractionWrapper<APIUserApplicationCommandInteraction>;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type APIMessageApplicationCommandInteraction = APIApplicationCommandInteractionWrapper<APIMessageApplicationCommandInteractionData>;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type APIMessageApplicationCommandDMInteraction = APIDMInteractionWrapper<APIMessageApplicationCommandInteraction>;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type APIMessageApplicationCommandGuildInteraction = APIGuildInteractionWrapper<APIMessageApplicationCommandInteraction>;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type APIContextMenuInteraction = APIUserApplicationCommandInteraction | APIMessageApplicationCommandInteraction;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type APIContextMenuDMInteraction = APIUserApplicationCommandDMInteraction | APIMessageApplicationCommandDMInteraction;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type APIContextMenuGuildInteraction = APIUserApplicationCommandGuildInteraction | APIMessageApplicationCommandGuildInteraction;
//# sourceMappingURL=contextMenu.d.ts.map