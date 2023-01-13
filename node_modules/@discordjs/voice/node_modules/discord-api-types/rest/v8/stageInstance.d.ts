import type { Snowflake } from '../../globals';
import type { APIStageInstance, StageInstancePrivacyLevel } from '../../payloads/v8/index';
import type { AddUndefinedToPossiblyUndefinedPropertiesOfInterface } from '../../utils/internals';
/**
 * https://discord.com/developers/docs/resources/stage-instance#create-stage-instance
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export interface RESTPostAPIStageInstanceJSONBody {
    /**
     * The id of the stage channel
     */
    channel_id: Snowflake;
    /**
     * The topic of the stage instance (1-120 characters)
     */
    topic: string;
    /**
     * The privacy level of the stage instance
     *
     * @default GuildOnly
     */
    privacy_level?: StageInstancePrivacyLevel;
}
/**
 * https://discord.com/developers/docs/resources/stage-instance#create-stage-instance
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPostAPIStageInstanceResult = APIStageInstance;
/**
 * https://discord.com/developers/docs/resources/stage-instance#get-stage-instance
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTGetAPIStageInstanceResult = APIStageInstance;
/**
 * https://discord.com/developers/docs/resources/stage-instance#update-stage-instance
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPatchAPIStageInstanceJSONBody = AddUndefinedToPossiblyUndefinedPropertiesOfInterface<{
    /**
     * The topic of the stage instance (1-120 characters)
     */
    topic?: string;
    /**
     * The privacy level of the stage instance
     */
    privacy_level?: StageInstancePrivacyLevel;
}>;
/**
 * https://discord.com/developers/docs/resources/stage-instance#update-stage-instance
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPatchAPIStageInstanceResult = APIStageInstance;
/**
 * https://discord.com/developers/docs/resources/stage-instance#delete-stage-instance
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTDeleteAPIStageInstanceResult = never;
//# sourceMappingURL=stageInstance.d.ts.map