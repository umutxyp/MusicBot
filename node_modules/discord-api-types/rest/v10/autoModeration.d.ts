import type { Snowflake } from '../../globals';
import type { APIAutoModerationAction, APIAutoModerationRule, AutoModerationRuleEventType, APIAutoModerationRuleTriggerMetadata, AutoModerationRuleTriggerType } from '../../payloads/v10/index';
import type { AddUndefinedToPossiblyUndefinedPropertiesOfInterface } from '../../utils/internals';
/**
 * https://discord.com/developers/docs/resources/auto-moderation#list-auto-moderation-rules-for-guild
 */
export declare type RESTGetAPIAutoModerationRulesResult = APIAutoModerationRule[];
/**
 * https://discord.com/developers/docs/resources/auto-moderation#get-auto-moderation-rule
 */
export declare type RESTGetAPIAutoModerationRuleResult = APIAutoModerationRule;
/**
 * https://discord.com/developers/docs/resources/auto-moderation#create-auto-moderation-rule
 */
export declare type RESTPostAPIAutoModerationRuleJSONBody = AddUndefinedToPossiblyUndefinedPropertiesOfInterface<{
    /**
     * The rule name
     */
    name: string;
    /**
     * The rule event type
     */
    event_type: AutoModerationRuleEventType;
    /**
     * The rule trigger type
     */
    trigger_type: AutoModerationRuleTriggerType;
    /**
     * The rule trigger metadata
     *
     * Can be omitted if the trigger type is {@link AutoModerationRuleTriggerType.HarmfulLink} or {@link AutoModerationRuleTriggerType.Spam}
     */
    trigger_metadata?: APIAutoModerationRuleTriggerMetadata;
    /**
     * The actions which will execute when this rule is triggered
     */
    actions: APIAutoModerationAction[];
    /**
     * Whether this rule is enabled
     *
     * @default false
     */
    enabled?: boolean;
    /**
     * The role ids that shouldn't be affected by this rule (Maximum of 20)
     */
    exempt_roles?: Snowflake[];
    /**
     * The channel ids that shouldn't be affected by this rule (Maximum of 50)
     */
    exempt_channels?: Snowflake[];
}>;
/**
 * https://discord.com/developers/docs/resources/auto-moderation#create-auto-moderation-rule
 */
export declare type RESTPostAPIAutoModerationRuleResult = APIAutoModerationRule;
/**
 * https://discord.com/developers/docs/resources/auto-moderation#modify-auto-moderation-rule
 */
export declare type RESTPatchAPIAutoModerationRuleJSONBody = Omit<Partial<RESTPostAPIAutoModerationRuleJSONBody>, 'trigger_type'>;
/**
 * https://discord.com/developers/docs/resources/auto-moderation#modify-auto-moderation-rule
 */
export declare type RESTPatchAPIAutoModerationRuleResult = APIAutoModerationRule;
/**
 * https://discord.com/developers/docs/resources/auto-moderation#delete-auto-moderation-rule
 */
export declare type RESTDeleteAPIAutoModerationRuleResult = never;
//# sourceMappingURL=autoModeration.d.ts.map