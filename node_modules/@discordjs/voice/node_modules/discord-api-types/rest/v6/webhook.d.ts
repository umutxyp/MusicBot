import type { APIAllowedMentionsSend } from './channel';
import type { APIEmbed, APIMessage, APIWebhook } from '../../payloads/v6/index';
/**
 * https://discord.com/developers/docs/resources/webhook#create-webhook
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export interface RESTPostAPIChannelWebhookJSONBody {
    name: string;
    avatar?: string | null;
}
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTPostAPIChannelWebhookResult = APIWebhook;
/**
 * https://discord.com/developers/docs/resources/webhook#get-channel-webhooks
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTGetAPIChannelWebhooksResult = APIWebhook[];
/**
 * https://discord.com/developers/docs/resources/webhook#get-guild-webhooks
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTGetAPIGuildWebhooksResult = APIWebhook[];
/**
 * https://discord.com/developers/docs/resources/webhook#get-webhook
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTGetAPIWebhookResult = APIWebhook;
/**
 * https://discord.com/developers/docs/resources/webhook#get-webhook-with-token
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTGetAPIWebhookWithTokenResult = Omit<APIWebhook, 'user'>;
/**
 * https://discord.com/developers/docs/resources/webhook#modify-webhook
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export interface RESTPatchAPIWebhookJSONBody {
    name?: string;
    avatar?: string | null;
    channel_id?: string;
}
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTPatchAPIWebhookResult = APIWebhook;
/**
 * https://discord.com/developers/docs/resources/webhook#modify-webhook-with-token
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTPatchAPIWebhookWithTokenJSONBody = Omit<RESTPatchAPIWebhookJSONBody, 'channel_id'>;
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTPatchAPIWebhookWithTokenResult = Omit<APIWebhook, 'user'>;
/**
 * https://discord.com/developers/docs/resources/webhook#delete-webhook
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTDeleteAPIWebhookResult = never;
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTDeleteAPIWebhookWithTokenResult = never;
/**
 * https://discord.com/developers/docs/resources/webhook#execute-webhook
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export interface RESTPostAPIWebhookWithTokenJSONBody {
    content?: string;
    username?: string;
    avatar_url?: string;
    tts?: boolean;
    embeds?: APIEmbed[];
    allowed_mentions?: APIAllowedMentionsSend;
}
/**
 * https://discord.com/developers/docs/resources/webhook#execute-webhook
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTPostAPIWebhookWithTokenFormDataBody = {
    /**
     * JSON stringified message body
     */
    payload_json?: string;
    /**
     * The file contents
     */
    file: unknown;
} | (RESTPostAPIWebhookWithTokenJSONBody & {
    /**
     * The file contents
     */
    file: unknown;
});
/**
 * https://discord.com/developers/docs/resources/webhook#execute-webhook-querystring-params
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export interface RESTPostAPIWebhookWithTokenQuery {
    wait?: boolean;
}
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTPostAPIWebhookWithTokenResult = never;
/**
 * Received when a call to POST `/webhooks/{webhook.id}/{webhook.token}` receives
 * the `wait` query parameter set to `true`
 *
 * @see https://discord.com/developers/docs/resources/webhook#execute-webhook-querystring-params
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTPostAPIWebhookWithTokenWaitResult = APIMessage;
/**
 * https://discord.com/developers/docs/resources/webhook#execute-slackcompatible-webhook-querystring-params
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTPostAPIWebhookWithTokenSlackQuery = RESTPostAPIWebhookWithTokenQuery;
/**
 * https://discord.com/developers/docs/resources/webhook#execute-githubcompatible-webhook-querystring-params
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTPostAPIWebhookWithTokenGitHubQuery = RESTPostAPIWebhookWithTokenQuery;
//# sourceMappingURL=webhook.d.ts.map