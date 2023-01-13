import type { Snowflake } from '../../globals';
import type { AddUndefinedToPossiblyUndefinedPropertiesOfInterface, StrictPartial } from '../../utils/internals';
import type { APIGuildScheduledEvent, APIGuildScheduledEventEntityMetadata, APIGuildScheduledEventUser, GuildScheduledEventEntityType, GuildScheduledEventPrivacyLevel, GuildScheduledEventStatus } from '../../v8';
/**
 * https://discord.com/developers/docs/resources/guild-scheduled-event#list-scheduled-events-for-guild
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export interface RESTGetAPIGuildScheduledEventsQuery {
    /**
     * Whether to include number of users subscribed to each event
     */
    with_user_count?: boolean;
}
/**
 * https://discord.com/developers/docs/resources/guild-scheduled-event#list-scheduled-events-for-guild
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTGetAPIGuildScheduledEventsResult = APIGuildScheduledEvent[];
/**
 * https://discord.com/developers/docs/resources/guild-scheduled-event#create-guild-scheduled-event
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPostAPIGuildScheduledEventJSONBody = AddUndefinedToPossiblyUndefinedPropertiesOfInterface<{
    /**
     * The stage channel id of the guild event
     */
    channel_id?: Snowflake;
    /**
     * The name of the guild event
     */
    name: string;
    /**
     * The privacy level of the guild event
     */
    privacy_level: GuildScheduledEventPrivacyLevel;
    /**
     * The time to schedule the guild event at
     */
    scheduled_start_time: string;
    /**
     * The time when the scheduled event is scheduled to end
     */
    scheduled_end_time?: string;
    /**
     * The description of the guild event
     */
    description?: string;
    /**
     * The scheduled entity type of the guild event
     */
    entity_type?: GuildScheduledEventEntityType;
    /**
     * The entity metadata of the scheduled event
     */
    entity_metadata?: APIGuildScheduledEventEntityMetadata;
    /**
     * The cover image of the scheduled event
     */
    image?: string | null;
}>;
/**
 * https://discord.com/developers/docs/resources/guild-scheduled-event#create-guild-scheduled-event
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPostAPIGuildScheduledEventResult = APIGuildScheduledEvent;
/**
 * https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export interface RESTGetAPIGuildScheduledEventQuery {
    /**
     * Whether to include number of users subscribed to this event
     */
    with_user_count?: boolean;
}
/**
 * https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTGetAPIGuildScheduledEventResult = APIGuildScheduledEvent;
/**
 * https://discord.com/developers/docs/resources/guild-scheduled-event#modify-guild-scheduled-event
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPatchAPIGuildScheduledEventJSONBody = StrictPartial<RESTPostAPIGuildScheduledEventJSONBody> & AddUndefinedToPossiblyUndefinedPropertiesOfInterface<{
    /**
     * The status of the scheduled event
     */
    status?: GuildScheduledEventStatus;
}>;
/**
 * https://discord.com/developers/docs/resources/guild-scheduled-event#modify-guild-scheduled-event
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPatchAPIGuildScheduledEventResult = APIGuildScheduledEvent;
/**
 * https://discord.com/developers/docs/resources/guild-scheduled-event#delete-guild-scheduled-event
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTDeleteAPIGuildScheduledEventResult = never;
/**
 * https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event-users
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export interface RESTGetAPIGuildScheduledEventUsersQuery {
    /**
     * Number of users to receive from the event
     *
     * @default 100
     */
    limit?: number;
    /**
     * Whether to include guild member data if it exists
     */
    with_member?: boolean;
    /**
     * Consider only users before given user id
     */
    before?: Snowflake;
    /**
     * Consider only users after given user id
     */
    after?: Snowflake;
}
/**
 * https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event-users
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTGetAPIGuildScheduledEventUsersResult = APIGuildScheduledEventUser[];
//# sourceMappingURL=guildScheduledEvent.d.ts.map