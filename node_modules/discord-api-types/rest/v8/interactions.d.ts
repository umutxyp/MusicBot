import type { RESTDeleteAPIWebhookWithTokenMessageResult, RESTGetAPIWebhookWithTokenMessageResult, RESTPatchAPIWebhookWithTokenMessageFormDataBody, RESTPatchAPIWebhookWithTokenMessageJSONBody, RESTPatchAPIWebhookWithTokenMessageResult, RESTPostAPIWebhookWithTokenWaitResult } from './webhook';
import type { APIApplicationCommand, APIApplicationCommandPermission, APIGuildApplicationCommandPermissions, APIInteractionResponse, APIInteractionResponseCallbackData, ApplicationCommandType } from '../../payloads/v8/index';
import type { AddUndefinedToPossiblyUndefinedPropertiesOfInterface, StrictPartial } from '../../utils/internals';
/**
 * https://discord.com/developers/docs/interactions/application-commands#get-global-application-commands
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTGetAPIApplicationCommandsResult = APIApplicationCommand[];
/**
 * https://discord.com/developers/docs/interactions/application-commands#get-global-application-command
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTGetAPIApplicationCommandResult = APIApplicationCommand;
declare type RESTPostAPIBaseApplicationCommandsJSONBody = AddUndefinedToPossiblyUndefinedPropertiesOfInterface<Omit<APIApplicationCommand, 'id' | 'application_id' | 'description' | 'type' | 'version' | 'guild_id'>>;
/**
 * https://discord.com/developers/docs/interactions/application-commands#create-global-application-command
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPostAPIChatInputApplicationCommandsJSONBody = RESTPostAPIBaseApplicationCommandsJSONBody & AddUndefinedToPossiblyUndefinedPropertiesOfInterface<{
    type?: ApplicationCommandType.ChatInput;
    description: string;
}>;
/**
 * https://discord.com/developers/docs/interactions/application-commands#create-global-application-command
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export interface RESTPostAPIContextMenuApplicationCommandsJSONBody extends RESTPostAPIBaseApplicationCommandsJSONBody {
    type: ApplicationCommandType.User | ApplicationCommandType.Message;
}
/**
 * https://discord.com/developers/docs/interactions/application-commands#create-global-application-command
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPostAPIApplicationCommandsJSONBody = RESTPostAPIChatInputApplicationCommandsJSONBody | RESTPostAPIContextMenuApplicationCommandsJSONBody;
/**
 * https://discord.com/developers/docs/interactions/application-commands#create-global-application-command
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPostAPIApplicationCommandsResult = APIApplicationCommand;
/**
 * https://discord.com/developers/docs/interactions/application-commands#edit-global-application-command
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPatchAPIApplicationCommandJSONBody = StrictPartial<RESTPostAPIApplicationCommandsJSONBody>;
/**
 * https://discord.com/developers/docs/interactions/application-commands#edit-global-application-command
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPatchAPIApplicationCommandResult = APIApplicationCommand;
/**
 * https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPutAPIApplicationCommandsJSONBody = RESTPostAPIApplicationCommandsJSONBody[];
/**
 * https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPutAPIApplicationCommandsResult = APIApplicationCommand[];
/**
 * https://discord.com/developers/docs/interactions/application-commands#get-guild-application-commands
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTGetAPIApplicationGuildCommandsResult = APIApplicationCommand[];
/**
 * https://discord.com/developers/docs/interactions/application-commands#get-guild-application-commands
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTGetAPIApplicationGuildCommandResult = APIApplicationCommand;
/**
 * https://discord.com/developers/docs/interactions/application-commands#create-guild-application-command
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPostAPIApplicationGuildCommandsJSONBody = RESTPostAPIApplicationCommandsJSONBody;
/**
 * https://discord.com/developers/docs/interactions/application-commands#create-guild-application-command
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPostAPIApplicationGuildCommandsResult = APIApplicationCommand;
/**
 * https://discord.com/developers/docs/interactions/application-commands#edit-guild-application-command
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPatchAPIApplicationGuildCommandJSONBody = StrictPartial<RESTPostAPIApplicationCommandsJSONBody>;
/**
 * https://discord.com/developers/docs/interactions/application-commands#edit-guild-application-command
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPatchAPIApplicationGuildCommandResult = APIApplicationCommand;
/**
 * https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-guild-application-commands
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPutAPIApplicationGuildCommandsJSONBody = RESTPostAPIApplicationCommandsJSONBody[];
/**
 * https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-guild-application-commands
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPutAPIApplicationGuildCommandsResult = APIApplicationCommand[];
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#create-interaction-response
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPostAPIInteractionCallbackJSONBody = APIInteractionResponse;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#create-interaction-response
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPostAPIInteractionCallbackFormDataBody = ({
    /**
     * JSON stringified message body
     */
    payload_json?: string;
} & Record<`files[${bigint}]`, unknown>) | (RESTPostAPIInteractionCallbackJSONBody & Record<`files[${bigint}]`, unknown>);
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#get-original-interaction-response
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTGetAPIInteractionOriginalResponseResult = RESTGetAPIWebhookWithTokenMessageResult;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#edit-original-interaction-response
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPatchAPIInteractionOriginalResponseJSONBody = RESTPatchAPIWebhookWithTokenMessageJSONBody;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#edit-original-interaction-response
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPatchAPIInteractionOriginalResponseFormDataBody = RESTPatchAPIWebhookWithTokenMessageFormDataBody;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#edit-original-interaction-response
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPatchAPIInteractionOriginalResponseResult = RESTPatchAPIWebhookWithTokenMessageResult;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#delete-original-interaction-response
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTDeleteAPIInteractionOriginalResponseResult = RESTDeleteAPIWebhookWithTokenMessageResult;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#create-followup-message
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPostAPIInteractionFollowupJSONBody = APIInteractionResponseCallbackData;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#create-followup-message
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPostAPIInteractionFollowupFormDataBody = ({
    /**
     * JSON stringified message body
     */
    payload_json?: string;
} & Record<`files[${bigint}]`, unknown>) | (RESTPostAPIInteractionFollowupJSONBody & Record<`files[${bigint}]`, unknown>);
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#create-followup-message
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPostAPIInteractionFollowupResult = RESTPostAPIWebhookWithTokenWaitResult;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#get-followup-message
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTGetAPIInteractionFollowupResult = RESTGetAPIWebhookWithTokenMessageResult;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#edit-followup-message
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPatchAPIInteractionFollowupJSONBody = RESTPatchAPIWebhookWithTokenMessageJSONBody;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#edit-followup-message
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPatchAPIInteractionFollowupFormDataBody = RESTPatchAPIWebhookWithTokenMessageFormDataBody;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#edit-followup-message
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPatchAPIInteractionFollowupResult = RESTPatchAPIWebhookWithTokenMessageResult;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#delete-followup-message
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTDeleteAPIInteractionFollowupResult = RESTDeleteAPIWebhookWithTokenMessageResult;
/**
 * https://discord.com/developers/docs/interactions/application-commands#get-guild-application-command-permissions
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTGetAPIGuildApplicationCommandsPermissionsResult = APIGuildApplicationCommandPermissions[];
/**
 * https://discord.com/developers/docs/interactions/application-commands#get-application-command-permissions
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTGetAPIApplicationCommandPermissionsResult = APIGuildApplicationCommandPermissions;
/**
 * https://discord.com/developers/docs/interactions/application-commands#edit-application-command-permissions
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export interface RESTPutAPIApplicationCommandPermissionsJSONBody {
    permissions: APIApplicationCommandPermission[];
}
/**
 * https://discord.com/developers/docs/interactions/application-commands#edit-application-command-permissions
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPutAPIApplicationCommandPermissionsResult = APIGuildApplicationCommandPermissions;
/**
 * https://discord.com/developers/docs/interactions/application-commands#batch-edit-application-command-permissions
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPutAPIGuildApplicationCommandsPermissionsJSONBody = Pick<APIGuildApplicationCommandPermissions, 'id' | 'permissions'>[];
/**
 * https://discord.com/developers/docs/interactions/application-commands#batch-edit-application-command-permissions
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPutAPIGuildApplicationCommandsPermissionsResult = APIGuildApplicationCommandPermissions[];
export {};
//# sourceMappingURL=interactions.d.ts.map