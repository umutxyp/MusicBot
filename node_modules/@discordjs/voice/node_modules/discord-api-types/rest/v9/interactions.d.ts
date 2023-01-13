import type { RESTDeleteAPIWebhookWithTokenMessageResult, RESTGetAPIWebhookWithTokenMessageResult, RESTPatchAPIWebhookWithTokenMessageFormDataBody, RESTPatchAPIWebhookWithTokenMessageJSONBody, RESTPatchAPIWebhookWithTokenMessageResult, RESTPostAPIWebhookWithTokenWaitResult } from './webhook';
import type { APIApplicationCommand, APIApplicationCommandPermission, APIGuildApplicationCommandPermissions, APIInteractionResponse, APIInteractionResponseCallbackData, ApplicationCommandType } from '../../payloads/v9/index';
import type { AddUndefinedToPossiblyUndefinedPropertiesOfInterface, StrictPartial } from '../../utils/internals';
/**
 * https://discord.com/developers/docs/interactions/application-commands#get-global-application-commands
 */
export declare type RESTGetAPIApplicationCommandsResult = APIApplicationCommand[];
/**
 * https://discord.com/developers/docs/interactions/application-commands#get-global-application-command
 */
export declare type RESTGetAPIApplicationCommandResult = APIApplicationCommand;
declare type RESTPostAPIBaseApplicationCommandsJSONBody = AddUndefinedToPossiblyUndefinedPropertiesOfInterface<Omit<APIApplicationCommand, 'id' | 'application_id' | 'description' | 'type' | 'version' | 'guild_id' | 'name_localized' | 'description_localized' | 'default_member_permissions'> & Partial<Pick<APIApplicationCommand, 'default_member_permissions'>>>;
/**
 * https://discord.com/developers/docs/interactions/application-commands#create-global-application-command
 */
export declare type RESTPostAPIChatInputApplicationCommandsJSONBody = RESTPostAPIBaseApplicationCommandsJSONBody & AddUndefinedToPossiblyUndefinedPropertiesOfInterface<{
    type?: ApplicationCommandType.ChatInput;
    description: string;
}>;
/**
 * https://discord.com/developers/docs/interactions/application-commands#create-global-application-command
 */
export interface RESTPostAPIContextMenuApplicationCommandsJSONBody extends RESTPostAPIBaseApplicationCommandsJSONBody {
    type: ApplicationCommandType.User | ApplicationCommandType.Message;
}
/**
 * https://discord.com/developers/docs/interactions/application-commands#create-global-application-command
 */
export declare type RESTPostAPIApplicationCommandsJSONBody = RESTPostAPIChatInputApplicationCommandsJSONBody | RESTPostAPIContextMenuApplicationCommandsJSONBody;
/**
 * https://discord.com/developers/docs/interactions/application-commands#create-global-application-command
 */
export declare type RESTPostAPIApplicationCommandsResult = APIApplicationCommand;
/**
 * https://discord.com/developers/docs/interactions/application-commands#edit-global-application-command
 */
export declare type RESTPatchAPIApplicationCommandJSONBody = StrictPartial<RESTPostAPIApplicationCommandsJSONBody>;
/**
 * https://discord.com/developers/docs/interactions/application-commands#edit-global-application-command
 */
export declare type RESTPatchAPIApplicationCommandResult = APIApplicationCommand;
/**
 * https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
 */
export declare type RESTPutAPIApplicationCommandsJSONBody = RESTPostAPIApplicationCommandsJSONBody[];
/**
 * https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
 */
export declare type RESTPutAPIApplicationCommandsResult = APIApplicationCommand[];
/**
 * https://discord.com/developers/docs/interactions/application-commands#get-guild-application-commands
 */
export declare type RESTGetAPIApplicationGuildCommandsResult = Omit<APIApplicationCommand, 'dm_permission'>[];
/**
 * https://discord.com/developers/docs/interactions/application-commands#get-guild-application-commands
 */
export declare type RESTGetAPIApplicationGuildCommandResult = Omit<APIApplicationCommand, 'dm_permission'>;
/**
 * https://discord.com/developers/docs/interactions/application-commands#create-guild-application-command
 */
export declare type RESTPostAPIApplicationGuildCommandsJSONBody = Omit<RESTPostAPIChatInputApplicationCommandsJSONBody, 'dm_permission'> | Omit<RESTPostAPIContextMenuApplicationCommandsJSONBody, 'dm_permission'>;
/**
 * https://discord.com/developers/docs/interactions/application-commands#create-guild-application-command
 */
export declare type RESTPostAPIApplicationGuildCommandsResult = Omit<APIApplicationCommand, 'dm_permission'>;
/**
 * https://discord.com/developers/docs/interactions/application-commands#edit-guild-application-command
 */
export declare type RESTPatchAPIApplicationGuildCommandJSONBody = StrictPartial<Omit<RESTPostAPIChatInputApplicationCommandsJSONBody, 'dm_permission'> | Omit<RESTPostAPIContextMenuApplicationCommandsJSONBody, 'dm_permission'>>;
/**
 * https://discord.com/developers/docs/interactions/application-commands#edit-guild-application-command
 */
export declare type RESTPatchAPIApplicationGuildCommandResult = Omit<APIApplicationCommand, 'dm_permission'>;
/**
 * https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-guild-application-commands
 */
export declare type RESTPutAPIApplicationGuildCommandsJSONBody = ((Omit<RESTPostAPIChatInputApplicationCommandsJSONBody, 'dm_permission'> & Pick<Partial<APIApplicationCommand>, 'id'>) | (Omit<RESTPostAPIContextMenuApplicationCommandsJSONBody, 'dm_permission'> & Pick<Partial<APIApplicationCommand>, 'id'>))[];
/**
 * https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-guild-application-commands
 */
export declare type RESTPutAPIApplicationGuildCommandsResult = Omit<APIApplicationCommand, 'dm_permission'>[];
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#create-interaction-response
 */
export declare type RESTPostAPIInteractionCallbackJSONBody = APIInteractionResponse;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#create-interaction-response
 */
export declare type RESTPostAPIInteractionCallbackFormDataBody = ({
    /**
     * JSON stringified message body
     */
    payload_json?: string;
} & Record<`files[${bigint}]`, unknown>) | (RESTPostAPIInteractionCallbackJSONBody & Record<`files[${bigint}]`, unknown>);
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#get-original-interaction-response
 */
export declare type RESTGetAPIInteractionOriginalResponseResult = RESTGetAPIWebhookWithTokenMessageResult;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#edit-original-interaction-response
 */
export declare type RESTPatchAPIInteractionOriginalResponseJSONBody = RESTPatchAPIWebhookWithTokenMessageJSONBody;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#edit-original-interaction-response
 */
export declare type RESTPatchAPIInteractionOriginalResponseFormDataBody = RESTPatchAPIWebhookWithTokenMessageFormDataBody;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#edit-original-interaction-response
 */
export declare type RESTPatchAPIInteractionOriginalResponseResult = RESTPatchAPIWebhookWithTokenMessageResult;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#delete-original-interaction-response
 */
export declare type RESTDeleteAPIInteractionOriginalResponseResult = RESTDeleteAPIWebhookWithTokenMessageResult;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#create-followup-message
 */
export declare type RESTPostAPIInteractionFollowupJSONBody = APIInteractionResponseCallbackData;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#create-followup-message
 */
export declare type RESTPostAPIInteractionFollowupFormDataBody = ({
    /**
     * JSON stringified message body
     */
    payload_json?: string;
} & Record<`files[${bigint}]`, unknown>) | (RESTPostAPIInteractionFollowupJSONBody & Record<`files[${bigint}]`, unknown>);
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#create-followup-message
 */
export declare type RESTPostAPIInteractionFollowupResult = RESTPostAPIWebhookWithTokenWaitResult;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#get-followup-message
 */
export declare type RESTGetAPIInteractionFollowupResult = RESTGetAPIWebhookWithTokenMessageResult;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#edit-followup-message
 */
export declare type RESTPatchAPIInteractionFollowupJSONBody = RESTPatchAPIWebhookWithTokenMessageJSONBody;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#edit-followup-message
 */
export declare type RESTPatchAPIInteractionFollowupFormDataBody = RESTPatchAPIWebhookWithTokenMessageFormDataBody;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#edit-followup-message
 */
export declare type RESTPatchAPIInteractionFollowupResult = RESTPatchAPIWebhookWithTokenMessageResult;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#delete-followup-message
 */
export declare type RESTDeleteAPIInteractionFollowupResult = RESTDeleteAPIWebhookWithTokenMessageResult;
/**
 * https://discord.com/developers/docs/interactions/application-commands#get-guild-application-command-permissions
 */
export declare type RESTGetAPIGuildApplicationCommandsPermissionsResult = APIGuildApplicationCommandPermissions[];
/**
 * https://discord.com/developers/docs/interactions/application-commands#get-application-command-permissions
 */
export declare type RESTGetAPIApplicationCommandPermissionsResult = APIGuildApplicationCommandPermissions;
/**
 * https://discord.com/developers/docs/interactions/application-commands#edit-application-command-permissions
 */
export interface RESTPutAPIApplicationCommandPermissionsJSONBody {
    permissions: APIApplicationCommandPermission[];
}
/**
 * https://discord.com/developers/docs/interactions/application-commands#edit-application-command-permissions
 */
export declare type RESTPutAPIApplicationCommandPermissionsResult = APIGuildApplicationCommandPermissions;
/**
 * https://discord.com/developers/docs/interactions/application-commands#batch-edit-application-command-permissions
 */
export declare type RESTPutAPIGuildApplicationCommandsPermissionsJSONBody = Pick<APIGuildApplicationCommandPermissions, 'id' | 'permissions'>[];
/**
 * https://discord.com/developers/docs/interactions/application-commands#batch-edit-application-command-permissions
 */
export declare type RESTPutAPIGuildApplicationCommandsPermissionsResult = APIGuildApplicationCommandPermissions[];
export {};
//# sourceMappingURL=interactions.d.ts.map