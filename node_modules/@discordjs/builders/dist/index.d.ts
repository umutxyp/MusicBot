import * as _sapphire_shapeshift from '@sapphire/shapeshift';
import { APIEmbedField, APIEmbedAuthor, APIEmbedFooter, APIEmbedImage, APIEmbed, APISelectMenuOption, APIMessageComponentEmoji, ButtonStyle, ChannelType, APIActionRowComponent, APIActionRowComponentTypes, APIBaseComponent, ComponentType, APIButtonComponent, APISelectMenuComponent, APIChannelSelectComponent, APIMentionableSelectComponent, APIRoleSelectComponent, APIStringSelectComponent, APIUserSelectComponent, APITextInputComponent, TextInputStyle, APIMessageActionRowComponent, APIModalActionRowComponent, APIModalComponent, APIMessageComponent, APIModalInteractionResponseCallbackData, LocalizationMap, LocaleString, ApplicationCommandOptionType, APIApplicationCommandBasicOption, APIApplicationCommandAttachmentOption, APIApplicationCommandBooleanOption, APIApplicationCommandChannelOption, APIApplicationCommandOptionChoice, APIApplicationCommandIntegerOption, APIApplicationCommandMentionableOption, APIApplicationCommandNumberOption, APIApplicationCommandRoleOption, APIApplicationCommandStringOption, APIApplicationCommandUserOption, APIApplicationCommandSubcommandGroupOption, APIApplicationCommandSubcommandOption, Permissions, RESTPostAPIChatInputApplicationCommandsJSONBody, APIApplicationCommandOption, Locale, RESTPostAPIContextMenuApplicationCommandsJSONBody, ApplicationCommandType } from 'discord-api-types/v10';
import { URL } from 'node:url';
import { Snowflake } from 'discord-api-types/globals';
import { JSONEncodable, Equatable } from '@discordjs/util';
export * from '@discordjs/util';

declare const fieldNamePredicate: _sapphire_shapeshift.StringValidator<string>;
declare const fieldValuePredicate: _sapphire_shapeshift.StringValidator<string>;
declare const fieldInlinePredicate: _sapphire_shapeshift.UnionValidator<boolean | undefined>;
declare const embedFieldPredicate: _sapphire_shapeshift.ObjectValidator<{
    name: string;
    value: string;
    inline: boolean | undefined;
}, _sapphire_shapeshift.UndefinedToOptional<{
    name: string;
    value: string;
    inline: boolean | undefined;
}>>;
declare const embedFieldsArrayPredicate: _sapphire_shapeshift.ArrayValidator<_sapphire_shapeshift.UndefinedToOptional<{
    name: string;
    value: string;
    inline: boolean | undefined;
}>[], _sapphire_shapeshift.UndefinedToOptional<{
    name: string;
    value: string;
    inline: boolean | undefined;
}>>;
declare const fieldLengthPredicate: _sapphire_shapeshift.NumberValidator<number>;
declare function validateFieldLength(amountAdding: number, fields?: APIEmbedField[]): void;
declare const authorNamePredicate: _sapphire_shapeshift.UnionValidator<string | null>;
declare const imageURLPredicate: _sapphire_shapeshift.UnionValidator<string | null | undefined>;
declare const urlPredicate: _sapphire_shapeshift.UnionValidator<string | null | undefined>;
declare const embedAuthorPredicate: _sapphire_shapeshift.ObjectValidator<{
    name: string | null;
    iconURL: string | null | undefined;
    url: string | null | undefined;
}, _sapphire_shapeshift.UndefinedToOptional<{
    name: string | null;
    iconURL: string | null | undefined;
    url: string | null | undefined;
}>>;
declare const RGBPredicate: _sapphire_shapeshift.NumberValidator<number>;
declare const colorPredicate: _sapphire_shapeshift.UnionValidator<number | [number, number, number] | null>;
declare const descriptionPredicate: _sapphire_shapeshift.UnionValidator<string | null>;
declare const footerTextPredicate: _sapphire_shapeshift.UnionValidator<string | null>;
declare const embedFooterPredicate: _sapphire_shapeshift.ObjectValidator<{
    text: string | null;
    iconURL: string | null | undefined;
}, _sapphire_shapeshift.UndefinedToOptional<{
    text: string | null;
    iconURL: string | null | undefined;
}>>;
declare const timestampPredicate: _sapphire_shapeshift.UnionValidator<number | Date | null>;
declare const titlePredicate: _sapphire_shapeshift.UnionValidator<string | null>;

declare const Assertions$5_fieldNamePredicate: typeof fieldNamePredicate;
declare const Assertions$5_fieldValuePredicate: typeof fieldValuePredicate;
declare const Assertions$5_fieldInlinePredicate: typeof fieldInlinePredicate;
declare const Assertions$5_embedFieldPredicate: typeof embedFieldPredicate;
declare const Assertions$5_embedFieldsArrayPredicate: typeof embedFieldsArrayPredicate;
declare const Assertions$5_fieldLengthPredicate: typeof fieldLengthPredicate;
declare const Assertions$5_validateFieldLength: typeof validateFieldLength;
declare const Assertions$5_authorNamePredicate: typeof authorNamePredicate;
declare const Assertions$5_imageURLPredicate: typeof imageURLPredicate;
declare const Assertions$5_urlPredicate: typeof urlPredicate;
declare const Assertions$5_embedAuthorPredicate: typeof embedAuthorPredicate;
declare const Assertions$5_RGBPredicate: typeof RGBPredicate;
declare const Assertions$5_colorPredicate: typeof colorPredicate;
declare const Assertions$5_descriptionPredicate: typeof descriptionPredicate;
declare const Assertions$5_footerTextPredicate: typeof footerTextPredicate;
declare const Assertions$5_embedFooterPredicate: typeof embedFooterPredicate;
declare const Assertions$5_timestampPredicate: typeof timestampPredicate;
declare const Assertions$5_titlePredicate: typeof titlePredicate;
declare namespace Assertions$5 {
  export {
    Assertions$5_fieldNamePredicate as fieldNamePredicate,
    Assertions$5_fieldValuePredicate as fieldValuePredicate,
    Assertions$5_fieldInlinePredicate as fieldInlinePredicate,
    Assertions$5_embedFieldPredicate as embedFieldPredicate,
    Assertions$5_embedFieldsArrayPredicate as embedFieldsArrayPredicate,
    Assertions$5_fieldLengthPredicate as fieldLengthPredicate,
    Assertions$5_validateFieldLength as validateFieldLength,
    Assertions$5_authorNamePredicate as authorNamePredicate,
    Assertions$5_imageURLPredicate as imageURLPredicate,
    Assertions$5_urlPredicate as urlPredicate,
    Assertions$5_embedAuthorPredicate as embedAuthorPredicate,
    Assertions$5_RGBPredicate as RGBPredicate,
    Assertions$5_colorPredicate as colorPredicate,
    Assertions$5_descriptionPredicate as descriptionPredicate,
    Assertions$5_footerTextPredicate as footerTextPredicate,
    Assertions$5_embedFooterPredicate as embedFooterPredicate,
    Assertions$5_timestampPredicate as timestampPredicate,
    Assertions$5_titlePredicate as titlePredicate,
  };
}

declare function normalizeArray<T>(arr: RestOrArray<T>): T[];
type RestOrArray<T> = T[] | [T[]];

type RGBTuple = [red: number, green: number, blue: number];
interface IconData {
    /**
     * The URL of the icon
     */
    iconURL?: string;
    /**
     * The proxy URL of the icon
     */
    proxyIconURL?: string;
}
type EmbedAuthorData = IconData & Omit<APIEmbedAuthor, 'icon_url' | 'proxy_icon_url'>;
type EmbedAuthorOptions = Omit<EmbedAuthorData, 'proxyIconURL'>;
type EmbedFooterData = IconData & Omit<APIEmbedFooter, 'icon_url' | 'proxy_icon_url'>;
type EmbedFooterOptions = Omit<EmbedFooterData, 'proxyIconURL'>;
interface EmbedImageData extends Omit<APIEmbedImage, 'proxy_url'> {
    /**
     * The proxy URL for the image
     */
    proxyURL?: string;
}
/**
 * Represents a embed in a message (image/video preview, rich embed, etc.)
 */
declare class EmbedBuilder {
    readonly data: APIEmbed;
    constructor(data?: APIEmbed);
    /**
     * Appends fields to the embed
     *
     * @remarks
     * This method accepts either an array of fields or a variable number of field parameters.
     * The maximum amount of fields that can be added is 25.
     * @example
     * Using an array
     * ```ts
     * const fields: APIEmbedField[] = ...;
     * const embed = new EmbedBuilder()
     * 	.addFields(fields);
     * ```
     * @example
     * Using rest parameters (variadic)
     * ```ts
     * const embed = new EmbedBuilder()
     * 	.addFields(
     * 		{ name: 'Field 1', value: 'Value 1' },
     * 		{ name: 'Field 2', value: 'Value 2' },
     * 	);
     * ```
     * @param fields - The fields to add
     */
    addFields(...fields: RestOrArray<APIEmbedField>): this;
    /**
     * Removes, replaces, or inserts fields in the embed.
     *
     * @remarks
     * This method behaves similarly
     * to {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice | Array.prototype.splice}.
     * The maximum amount of fields that can be added is 25.
     *
     * It's useful for modifying and adjusting order of the already-existing fields of an embed.
     * @example
     * Remove the first field
     * ```ts
     * embed.spliceFields(0, 1);
     * ```
     * @example
     * Remove the first n fields
     * ```ts
     * const n = 4
     * embed.spliceFields(0, n);
     * ```
     * @example
     * Remove the last field
     * ```ts
     * embed.spliceFields(-1, 1);
     * ```
     * @param index - The index to start at
     * @param deleteCount - The number of fields to remove
     * @param fields - The replacing field objects
     */
    spliceFields(index: number, deleteCount: number, ...fields: APIEmbedField[]): this;
    /**
     * Sets the embed's fields
     *
     * @remarks
     * This method is an alias for {@link EmbedBuilder.spliceFields}. More specifically,
     * it splices the entire array of fields, replacing them with the provided fields.
     *
     * You can set a maximum of 25 fields.
     * @param fields - The fields to set
     */
    setFields(...fields: RestOrArray<APIEmbedField>): this;
    /**
     * Sets the author of this embed
     *
     * @param options - The options for the author
     */
    setAuthor(options: EmbedAuthorOptions | null): this;
    /**
     * Sets the color of this embed
     *
     * @param color - The color of the embed
     */
    setColor(color: RGBTuple | number | null): this;
    /**
     * Sets the description of this embed
     *
     * @param description - The description
     */
    setDescription(description: string | null): this;
    /**
     * Sets the footer of this embed
     *
     * @param options - The options for the footer
     */
    setFooter(options: EmbedFooterOptions | null): this;
    /**
     * Sets the image of this embed
     *
     * @param url - The URL of the image
     */
    setImage(url: string | null): this;
    /**
     * Sets the thumbnail of this embed
     *
     * @param url - The URL of the thumbnail
     */
    setThumbnail(url: string | null): this;
    /**
     * Sets the timestamp of this embed
     *
     * @param timestamp - The timestamp or date
     */
    setTimestamp(timestamp?: Date | number | null): this;
    /**
     * Sets the title of this embed
     *
     * @param title - The title
     */
    setTitle(title: string | null): this;
    /**
     * Sets the URL of this embed
     *
     * @param url - The URL
     */
    setURL(url: string | null): this;
    /**
     * Transforms the embed to a plain object
     */
    toJSON(): APIEmbed;
}

/**
 * Wraps the content inside a codeblock with no language
 *
 * @param content - The content to wrap
 */
declare function codeBlock<C extends string>(content: C): `\`\`\`\n${C}\n\`\`\``;
/**
 * Wraps the content inside a codeblock with the specified language
 *
 * @param language - The language for the codeblock
 * @param content - The content to wrap
 */
declare function codeBlock<L extends string, C extends string>(language: L, content: C): `\`\`\`${L}\n${C}\n\`\`\``;
/**
 * Wraps the content inside \`backticks\`, which formats it as inline code
 *
 * @param content - The content to wrap
 */
declare function inlineCode<C extends string>(content: C): `\`${C}\``;
/**
 * Formats the content into italic text
 *
 * @param content - The content to wrap
 */
declare function italic<C extends string>(content: C): `_${C}_`;
/**
 * Formats the content into bold text
 *
 * @param content - The content to wrap
 */
declare function bold<C extends string>(content: C): `**${C}**`;
/**
 * Formats the content into underscored text
 *
 * @param content - The content to wrap
 */
declare function underscore<C extends string>(content: C): `__${C}__`;
/**
 * Formats the content into strike-through text
 *
 * @param content - The content to wrap
 */
declare function strikethrough<C extends string>(content: C): `~~${C}~~`;
/**
 * Formats the content into a quote. This needs to be at the start of the line for Discord to format it
 *
 * @param content - The content to wrap
 */
declare function quote<C extends string>(content: C): `> ${C}`;
/**
 * Formats the content into a block quote. This needs to be at the start of the line for Discord to format it
 *
 * @param content - The content to wrap
 */
declare function blockQuote<C extends string>(content: C): `>>> ${C}`;
/**
 * Wraps the URL into `<>`, which stops it from embedding
 *
 * @param url - The URL to wrap
 */
declare function hideLinkEmbed<C extends string>(url: C): `<${C}>`;
/**
 * Wraps the URL into `<>`, which stops it from embedding
 *
 * @param url - The URL to wrap
 */
declare function hideLinkEmbed(url: URL): `<${string}>`;
/**
 * Formats the content and the URL into a masked URL
 *
 * @param content - The content to display
 * @param url - The URL the content links to
 */
declare function hyperlink<C extends string>(content: C, url: URL): `[${C}](${string})`;
/**
 * Formats the content and the URL into a masked URL
 *
 * @param content - The content to display
 * @param url - The URL the content links to
 */
declare function hyperlink<C extends string, U extends string>(content: C, url: U): `[${C}](${U})`;
/**
 * Formats the content and the URL into a masked URL
 *
 * @param content - The content to display
 * @param url - The URL the content links to
 * @param title - The title shown when hovering on the masked link
 */
declare function hyperlink<C extends string, T extends string>(content: C, url: URL, title: T): `[${C}](${string} "${T}")`;
/**
 * Formats the content and the URL into a masked URL
 *
 * @param content - The content to display
 * @param url - The URL the content links to
 * @param title - The title shown when hovering on the masked link
 */
declare function hyperlink<C extends string, U extends string, T extends string>(content: C, url: U, title: T): `[${C}](${U} "${T}")`;
/**
 * Wraps the content inside spoiler (hidden text)
 *
 * @param content - The content to wrap
 */
declare function spoiler<C extends string>(content: C): `||${C}||`;
/**
 * Formats a user ID into a user mention
 *
 * @param userId - The user ID to format
 */
declare function userMention<C extends Snowflake>(userId: C): `<@${C}>`;
/**
 * Formats a channel ID into a channel mention
 *
 * @param channelId - The channel ID to format
 */
declare function channelMention<C extends Snowflake>(channelId: C): `<#${C}>`;
/**
 * Formats a role ID into a role mention
 *
 * @param roleId - The role ID to format
 */
declare function roleMention<C extends Snowflake>(roleId: C): `<@&${C}>`;
/**
 * Formats an application command name, subcommand group name, subcommand name, and ID into an application command mention
 *
 * @param commandName - The application command name to format
 * @param subcommandGroupName - The subcommand group name to format
 * @param subcommandName - The subcommand name to format
 * @param commandId - The application command ID to format
 */
declare function chatInputApplicationCommandMention<N extends string, G extends string, S extends string, I extends Snowflake>(commandName: N, subcommandGroupName: G, subcommandName: S, commandId: I): `</${N} ${G} ${S}:${I}>`;
/**
 * Formats an application command name, subcommand name, and ID into an application command mention
 *
 * @param commandName - The application command name to format
 * @param subcommandName - The subcommand name to format
 * @param commandId - The application command ID to format
 */
declare function chatInputApplicationCommandMention<N extends string, S extends string, I extends Snowflake>(commandName: N, subcommandName: S, commandId: I): `</${N} ${S}:${I}>`;
/**
 * Formats an application command name and ID into an application command mention
 *
 * @param commandName - The application command name to format
 * @param commandId - The application command ID to format
 */
declare function chatInputApplicationCommandMention<N extends string, I extends Snowflake>(commandName: N, commandId: I): `</${N}:${I}>`;
/**
 * Formats an emoji ID into a fully qualified emoji identifier
 *
 * @param emojiId - The emoji ID to format
 */
declare function formatEmoji<C extends Snowflake>(emojiId: C, animated?: false): `<:_:${C}>`;
/**
 * Formats an emoji ID into a fully qualified emoji identifier
 *
 * @param emojiId - The emoji ID to format
 * @param animated - Whether the emoji is animated or not. Defaults to `false`
 */
declare function formatEmoji<C extends Snowflake>(emojiId: C, animated?: true): `<a:_:${C}>`;
/**
 * Formats an emoji ID into a fully qualified emoji identifier
 *
 * @param emojiId - The emoji ID to format
 * @param animated - Whether the emoji is animated or not. Defaults to `false`
 */
declare function formatEmoji<C extends Snowflake>(emojiId: C, animated?: boolean): `<:_:${C}>` | `<a:_:${C}>`;
/**
 * Formats a channel link for a direct message channel.
 *
 * @param channelId - The channel's id
 */
declare function channelLink<C extends Snowflake>(channelId: C): `https://discord.com/channels/@me/${C}`;
/**
 * Formats a channel link for a guild channel.
 *
 * @param channelId - The channel's id
 * @param guildId - The guild's id
 */
declare function channelLink<C extends Snowflake, G extends Snowflake>(channelId: C, guildId: G): `https://discord.com/channels/${G}/${C}`;
/**
 * Formats a message link for a direct message channel.
 *
 * @param channelId - The channel's id
 * @param messageId - The message's id
 */
declare function messageLink<C extends Snowflake, M extends Snowflake>(channelId: C, messageId: M): `https://discord.com/channels/@me/${C}/${M}`;
/**
 * Formats a message link for a guild channel.
 *
 * @param channelId - The channel's id
 * @param messageId - The message's id
 * @param guildId - The guild's id
 */
declare function messageLink<C extends Snowflake, M extends Snowflake, G extends Snowflake>(channelId: C, messageId: M, guildId: G): `https://discord.com/channels/${G}/${C}/${M}`;
/**
 * Formats a date into a short date-time string
 *
 * @param date - The date to format, defaults to the current time
 */
declare function time(date?: Date): `<t:${bigint}>`;
/**
 * Formats a date given a format style
 *
 * @param date - The date to format
 * @param style - The style to use
 */
declare function time<S extends TimestampStylesString>(date: Date, style: S): `<t:${bigint}:${S}>`;
/**
 * Formats the given timestamp into a short date-time string
 *
 * @param seconds - The time to format, represents an UNIX timestamp in seconds
 */
declare function time<C extends number>(seconds: C): `<t:${C}>`;
/**
 * Formats the given timestamp into a short date-time string
 *
 * @param seconds - The time to format, represents an UNIX timestamp in seconds
 * @param style - The style to use
 */
declare function time<C extends number, S extends TimestampStylesString>(seconds: C, style: S): `<t:${C}:${S}>`;
/**
 * The {@link https://discord.com/developers/docs/reference#message-formatting-timestamp-styles | message formatting timestamp styles} supported by Discord
 */
declare const TimestampStyles: {
    /**
     * Short time format, consisting of hours and minutes, e.g. 16:20
     */
    readonly ShortTime: "t";
    /**
     * Long time format, consisting of hours, minutes, and seconds, e.g. 16:20:30
     */
    readonly LongTime: "T";
    /**
     * Short date format, consisting of day, month, and year, e.g. 20/04/2021
     */
    readonly ShortDate: "d";
    /**
     * Long date format, consisting of day, month, and year, e.g. 20 April 2021
     */
    readonly LongDate: "D";
    /**
     * Short date-time format, consisting of short date and short time formats, e.g. 20 April 2021 16:20
     */
    readonly ShortDateTime: "f";
    /**
     * Long date-time format, consisting of long date and short time formats, e.g. Tuesday, 20 April 2021 16:20
     */
    readonly LongDateTime: "F";
    /**
     * Relative time format, consisting of a relative duration format, e.g. 2 months ago
     */
    readonly RelativeTime: "R";
};
/**
 * The possible values, see {@link TimestampStyles} for more information
 */
type TimestampStylesString = typeof TimestampStyles[keyof typeof TimestampStyles];
/**
 * An enum with all the available faces from Discord's native slash commands
 */
declare enum Faces {
    /**
     * ¯\\_(ツ)\\_/¯
     */
    Shrug = "\u00AF\\_(\u30C4)\\_/\u00AF",
    /**
     * (╯°□°）╯︵ ┻━┻
     */
    Tableflip = "(\u256F\u00B0\u25A1\u00B0\uFF09\u256F\uFE35 \u253B\u2501\u253B",
    /**
     * ┬─┬ ノ( ゜-゜ノ)
     */
    Unflip = "\u252C\u2500\u252C \u30CE( \u309C-\u309C\u30CE)"
}

/**
 * Represents an option within a string select menu component
 */
declare class StringSelectMenuOptionBuilder implements JSONEncodable<APISelectMenuOption> {
    data: Partial<APISelectMenuOption>;
    /**
     * Creates a new string select menu option from API data
     *
     * @param data - The API data to create this string select menu option with
     * @example
     * Creating a string select menu option from an API data object
     * ```ts
     * const selectMenuOption = new SelectMenuOptionBuilder({
     * 	label: 'catchy label',
     * 	value: '1',
     * });
     * ```
     * @example
     * Creating a string select menu option using setters and API data
     * ```ts
     * const selectMenuOption = new SelectMenuOptionBuilder({
     * 	default: true,
     * 	value: '1',
     * })
     * 	.setLabel('woah')
     * ```
     */
    constructor(data?: Partial<APISelectMenuOption>);
    /**
     * Sets the label of this option
     *
     * @param label - The label to show on this option
     */
    setLabel(label: string): this;
    /**
     * Sets the value of this option
     *
     * @param value - The value of this option
     */
    setValue(value: string): this;
    /**
     * Sets the description of this option
     *
     * @param description - The description of this option
     */
    setDescription(description: string): this;
    /**
     * Sets whether this option is selected by default
     *
     * @param isDefault - Whether this option is selected by default
     */
    setDefault(isDefault?: boolean): this;
    /**
     * Sets the emoji to display on this option
     *
     * @param emoji - The emoji to display on this option
     */
    setEmoji(emoji: APIMessageComponentEmoji): this;
    /**
     * {@inheritDoc ComponentBuilder.toJSON}
     */
    toJSON(): APISelectMenuOption;
}

declare const customIdValidator: _sapphire_shapeshift.StringValidator<string>;
declare const emojiValidator: _sapphire_shapeshift.ObjectValidator<{
    name?: string | undefined;
    id?: string | undefined;
    animated?: boolean | undefined;
}, _sapphire_shapeshift.UndefinedToOptional<{
    name?: string | undefined;
    id?: string | undefined;
    animated?: boolean | undefined;
}>>;
declare const disabledValidator: _sapphire_shapeshift.BooleanValidator<boolean>;
declare const buttonLabelValidator: _sapphire_shapeshift.StringValidator<string>;
declare const buttonStyleValidator: _sapphire_shapeshift.NativeEnumValidator<typeof ButtonStyle>;
declare const placeholderValidator$1: _sapphire_shapeshift.StringValidator<string>;
declare const minMaxValidator: _sapphire_shapeshift.NumberValidator<number>;
declare const labelValueDescriptionValidator: _sapphire_shapeshift.StringValidator<string>;
declare const jsonOptionValidator: _sapphire_shapeshift.ObjectValidator<{
    label: string;
    value: string;
    description: string | undefined;
    emoji: _sapphire_shapeshift.UndefinedToOptional<{
        name?: string | undefined;
        id?: string | undefined;
        animated?: boolean | undefined;
    }> | undefined;
    default: boolean | undefined;
}, _sapphire_shapeshift.UndefinedToOptional<{
    label: string;
    value: string;
    description: string | undefined;
    emoji: _sapphire_shapeshift.UndefinedToOptional<{
        name?: string | undefined;
        id?: string | undefined;
        animated?: boolean | undefined;
    }> | undefined;
    default: boolean | undefined;
}>>;
declare const optionValidator: _sapphire_shapeshift.InstanceValidator<StringSelectMenuOptionBuilder>;
declare const optionsValidator: _sapphire_shapeshift.ArrayValidator<StringSelectMenuOptionBuilder[], StringSelectMenuOptionBuilder>;
declare const optionsLengthValidator: _sapphire_shapeshift.NumberValidator<number>;
declare function validateRequiredSelectMenuParameters(options: StringSelectMenuOptionBuilder[], customId?: string): void;
declare const defaultValidator: _sapphire_shapeshift.BooleanValidator<boolean>;
declare function validateRequiredSelectMenuOptionParameters(label?: string, value?: string): void;
declare const channelTypesValidator: _sapphire_shapeshift.ArrayValidator<ChannelType[], ChannelType>;
declare const urlValidator: _sapphire_shapeshift.StringValidator<string>;
declare function validateRequiredButtonParameters(style?: ButtonStyle, label?: string, emoji?: APIMessageComponentEmoji, customId?: string, url?: string): void;

declare const Assertions$4_customIdValidator: typeof customIdValidator;
declare const Assertions$4_emojiValidator: typeof emojiValidator;
declare const Assertions$4_disabledValidator: typeof disabledValidator;
declare const Assertions$4_buttonLabelValidator: typeof buttonLabelValidator;
declare const Assertions$4_buttonStyleValidator: typeof buttonStyleValidator;
declare const Assertions$4_minMaxValidator: typeof minMaxValidator;
declare const Assertions$4_labelValueDescriptionValidator: typeof labelValueDescriptionValidator;
declare const Assertions$4_jsonOptionValidator: typeof jsonOptionValidator;
declare const Assertions$4_optionValidator: typeof optionValidator;
declare const Assertions$4_optionsValidator: typeof optionsValidator;
declare const Assertions$4_optionsLengthValidator: typeof optionsLengthValidator;
declare const Assertions$4_validateRequiredSelectMenuParameters: typeof validateRequiredSelectMenuParameters;
declare const Assertions$4_defaultValidator: typeof defaultValidator;
declare const Assertions$4_validateRequiredSelectMenuOptionParameters: typeof validateRequiredSelectMenuOptionParameters;
declare const Assertions$4_channelTypesValidator: typeof channelTypesValidator;
declare const Assertions$4_urlValidator: typeof urlValidator;
declare const Assertions$4_validateRequiredButtonParameters: typeof validateRequiredButtonParameters;
declare namespace Assertions$4 {
  export {
    Assertions$4_customIdValidator as customIdValidator,
    Assertions$4_emojiValidator as emojiValidator,
    Assertions$4_disabledValidator as disabledValidator,
    Assertions$4_buttonLabelValidator as buttonLabelValidator,
    Assertions$4_buttonStyleValidator as buttonStyleValidator,
    placeholderValidator$1 as placeholderValidator,
    Assertions$4_minMaxValidator as minMaxValidator,
    Assertions$4_labelValueDescriptionValidator as labelValueDescriptionValidator,
    Assertions$4_jsonOptionValidator as jsonOptionValidator,
    Assertions$4_optionValidator as optionValidator,
    Assertions$4_optionsValidator as optionsValidator,
    Assertions$4_optionsLengthValidator as optionsLengthValidator,
    Assertions$4_validateRequiredSelectMenuParameters as validateRequiredSelectMenuParameters,
    Assertions$4_defaultValidator as defaultValidator,
    Assertions$4_validateRequiredSelectMenuOptionParameters as validateRequiredSelectMenuOptionParameters,
    Assertions$4_channelTypesValidator as channelTypesValidator,
    Assertions$4_urlValidator as urlValidator,
    Assertions$4_validateRequiredButtonParameters as validateRequiredButtonParameters,
  };
}

type AnyAPIActionRowComponent = APIActionRowComponent<APIActionRowComponentTypes> | APIActionRowComponentTypes;
/**
 * Represents a discord component
 *
 * @typeParam DataType - The type of internal API data that is stored within the component
 */
declare abstract class ComponentBuilder<DataType extends Partial<APIBaseComponent<ComponentType>> = APIBaseComponent<ComponentType>> implements JSONEncodable<AnyAPIActionRowComponent> {
    /**
     * The API data associated with this component
     */
    readonly data: Partial<DataType>;
    /**
     * Serializes this component to an API-compatible JSON object
     *
     * @remarks
     * This method runs validations on the data before serializing it.
     * As such, it may throw an error if the data is invalid.
     */
    abstract toJSON(): AnyAPIActionRowComponent;
    constructor(data: Partial<DataType>);
}

/**
 * Represents a button component
 */
declare class ButtonBuilder extends ComponentBuilder<APIButtonComponent> {
    /**
     * Creates a new button from API data
     *
     * @param data - The API data to create this button with
     * @example
     * Creating a button from an API data object
     * ```ts
     * const button = new ButtonBuilder({
     * 	custom_id: 'a cool button',
     * 	style: ButtonStyle.Primary,
     * 	label: 'Click Me',
     * 	emoji: {
     * 		name: 'smile',
     * 		id: '123456789012345678',
     * 	},
     * });
     * ```
     * @example
     * Creating a button using setters and API data
     * ```ts
     * const button = new ButtonBuilder({
     * 	style: ButtonStyle.Secondary,
     * 	label: 'Click Me',
     * })
     * 	.setEmoji({ name: '🙂' })
     * 	.setCustomId('another cool button');
     * ```
     */
    constructor(data?: Partial<APIButtonComponent>);
    /**
     * Sets the style of this button
     *
     * @param style - The style of the button
     */
    setStyle(style: ButtonStyle): this;
    /**
     * Sets the URL for this button
     *
     * @remarks
     * This method is only available to buttons using the `Link` button style.
     * Only three types of URL schemes are currently supported: `https://`, `http://` and `discord://`
     * @param url - The URL to open when this button is clicked
     */
    setURL(url: string): this;
    /**
     * Sets the custom id for this button
     *
     * @remarks
     * This method is only applicable to buttons that are not using the `Link` button style.
     * @param customId - The custom id to use for this button
     */
    setCustomId(customId: string): this;
    /**
     * Sets the emoji to display on this button
     *
     * @param emoji - The emoji to display on this button
     */
    setEmoji(emoji: APIMessageComponentEmoji): this;
    /**
     * Sets whether this button is disabled
     *
     * @param disabled - Whether to disable this button
     */
    setDisabled(disabled?: boolean): this;
    /**
     * Sets the label for this button
     *
     * @param label - The label to display on this button
     */
    setLabel(label: string): this;
    /**
     * {@inheritDoc ComponentBuilder.toJSON}
     */
    toJSON(): APIButtonComponent;
}

declare class BaseSelectMenuBuilder<SelectMenuType extends APISelectMenuComponent> extends ComponentBuilder<SelectMenuType> {
    /**
     * Sets the placeholder for this select menu
     *
     * @param placeholder - The placeholder to use for this select menu
     */
    setPlaceholder(placeholder: string): this;
    /**
     * Sets the minimum values that must be selected in the select menu
     *
     * @param minValues - The minimum values that must be selected
     */
    setMinValues(minValues: number): this;
    /**
     * Sets the maximum values that must be selected in the select menu
     *
     * @param maxValues - The maximum values that must be selected
     */
    setMaxValues(maxValues: number): this;
    /**
     * Sets the custom id for this select menu
     *
     * @param customId - The custom id to use for this select menu
     */
    setCustomId(customId: string): this;
    /**
     * Sets whether this select menu is disabled
     *
     * @param disabled - Whether this select menu is disabled
     */
    setDisabled(disabled?: boolean): this;
    toJSON(): SelectMenuType;
}

declare class ChannelSelectMenuBuilder extends BaseSelectMenuBuilder<APIChannelSelectComponent> {
    /**
     * Creates a new select menu from API data
     *
     * @param data - The API data to create this select menu with
     * @example
     * Creating a select menu from an API data object
     * ```ts
     * const selectMenu = new ChannelSelectMenuBuilder({
     * 	custom_id: 'a cool select menu',
     * 	placeholder: 'select an option',
     * 	max_values: 2,
     * });
     * ```
     * @example
     * Creating a select menu using setters and API data
     * ```ts
     * const selectMenu = new ChannelSelectMenuBuilder({
     * 	custom_id: 'a cool select menu',
     * })
     * 	.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
     * 	.setMinValues(2)
     * ```
     */
    constructor(data?: Partial<APIChannelSelectComponent>);
    addChannelTypes(...types: RestOrArray<ChannelType>): this;
    setChannelTypes(...types: RestOrArray<ChannelType>): this;
    /**
     * {@inheritDoc ComponentBuilder.toJSON}
     */
    toJSON(): APIChannelSelectComponent;
}

declare class MentionableSelectMenuBuilder extends BaseSelectMenuBuilder<APIMentionableSelectComponent> {
    /**
     * Creates a new select menu from API data
     *
     * @param data - The API data to create this select menu with
     * @example
     * Creating a select menu from an API data object
     * ```ts
     * const selectMenu = new MentionableSelectMenuBuilder({
     * 	custom_id: 'a cool select menu',
     * 	placeholder: 'select an option',
     * 	max_values: 2,
     * });
     * ```
     * @example
     * Creating a select menu using setters and API data
     * ```ts
     * const selectMenu = new MentionableSelectMenuBuilder({
     * 	custom_id: 'a cool select menu',
     * })
     * 	.setMinValues(1)
     * ```
     */
    constructor(data?: Partial<APIMentionableSelectComponent>);
}

declare class RoleSelectMenuBuilder extends BaseSelectMenuBuilder<APIRoleSelectComponent> {
    /**
     * Creates a new select menu from API data
     *
     * @param data - The API data to create this select menu with
     * @example
     * Creating a select menu from an API data object
     * ```ts
     * const selectMenu = new RoleSelectMenuBuilder({
     * 	custom_id: 'a cool select menu',
     * 	placeholder: 'select an option',
     * 	max_values: 2,
     * });
     * ```
     * @example
     * Creating a select menu using setters and API data
     * ```ts
     * const selectMenu = new RoleSelectMenuBuilder({
     * 	custom_id: 'a cool select menu',
     * })
     * 	.setMinValues(1)
     * ```
     */
    constructor(data?: Partial<APIRoleSelectComponent>);
}

/**
 * Represents a string select menu component
 */
declare class StringSelectMenuBuilder extends BaseSelectMenuBuilder<APIStringSelectComponent> {
    /**
     * The options within this select menu
     */
    readonly options: StringSelectMenuOptionBuilder[];
    /**
     * Creates a new select menu from API data
     *
     * @param data - The API data to create this select menu with
     * @example
     * Creating a select menu from an API data object
     * ```ts
     * const selectMenu = new StringSelectMenuBuilder({
     * 	custom_id: 'a cool select menu',
     * 	placeholder: 'select an option',
     * 	max_values: 2,
     * 	options: [
     * 		{ label: 'option 1', value: '1' },
     * 		{ label: 'option 2', value: '2' },
     * 		{ label: 'option 3', value: '3' },
     * 	],
     * });
     * ```
     * @example
     * Creating a select menu using setters and API data
     * ```ts
     * const selectMenu = new StringSelectMenuBuilder({
     * 	custom_id: 'a cool select menu',
     * })
     * 	.setMinValues(1)
     * 	.addOptions({
     * 		label: 'Catchy',
     * 		value: 'catch',
     * 	});
     * ```
     */
    constructor(data?: Partial<APIStringSelectComponent>);
    /**
     * Adds options to this select menu
     *
     * @param options - The options to add to this select menu
     * @returns
     */
    addOptions(...options: RestOrArray<APISelectMenuOption | StringSelectMenuOptionBuilder>): this;
    /**
     * Sets the options on this select menu
     *
     * @param options - The options to set on this select menu
     */
    setOptions(...options: RestOrArray<APISelectMenuOption | StringSelectMenuOptionBuilder>): this;
    /**
     * {@inheritDoc ComponentBuilder.toJSON}
     */
    toJSON(): APIStringSelectComponent;
}

declare class UserSelectMenuBuilder extends BaseSelectMenuBuilder<APIUserSelectComponent> {
    /**
     * Creates a new select menu from API data
     *
     * @param data - The API data to create this select menu with
     * @example
     * Creating a select menu from an API data object
     * ```ts
     * const selectMenu = new UserSelectMenuBuilder({
     * 	custom_id: 'a cool select menu',
     * 	placeholder: 'select an option',
     * 	max_values: 2,
     * });
     * ```
     * @example
     * Creating a select menu using setters and API data
     * ```ts
     * const selectMenu = new UserSelectMenuBuilder({
     * 	custom_id: 'a cool select menu',
     * })
     * 	.setMinValues(1)
     * ```
     */
    constructor(data?: Partial<APIUserSelectComponent>);
}

declare class TextInputBuilder extends ComponentBuilder<APITextInputComponent> implements Equatable<APITextInputComponent | JSONEncodable<APITextInputComponent>> {
    /**
     * Creates a new text input from API data
     *
     * @param data - The API data to create this text input with
     * @example
     * Creating a select menu option from an API data object
     * ```ts
     * const textInput = new TextInputBuilder({
     * 	custom_id: 'a cool select menu',
     * 	label: 'Type something',
     * 	style: TextInputStyle.Short,
     * });
     * ```
     * @example
     * Creating a select menu option using setters and API data
     * ```ts
     * const textInput = new TextInputBuilder({
     * 	label: 'Type something else',
     * })
     * 	.setCustomId('woah')
     * 	.setStyle(TextInputStyle.Paragraph);
     * ```
     */
    constructor(data?: APITextInputComponent & {
        type?: ComponentType.TextInput;
    });
    /**
     * Sets the custom id for this text input
     *
     * @param customId - The custom id of this text input
     */
    setCustomId(customId: string): this;
    /**
     * Sets the label for this text input
     *
     * @param label - The label for this text input
     */
    setLabel(label: string): this;
    /**
     * Sets the style for this text input
     *
     * @param style - The style for this text input
     */
    setStyle(style: TextInputStyle): this;
    /**
     * Sets the minimum length of text for this text input
     *
     * @param minLength - The minimum length of text for this text input
     */
    setMinLength(minLength: number): this;
    /**
     * Sets the maximum length of text for this text input
     *
     * @param maxLength - The maximum length of text for this text input
     */
    setMaxLength(maxLength: number): this;
    /**
     * Sets the placeholder of this text input
     *
     * @param placeholder - The placeholder of this text input
     */
    setPlaceholder(placeholder: string): this;
    /**
     * Sets the value of this text input
     *
     * @param value - The value for this text input
     */
    setValue(value: string): this;
    /**
     * Sets whether this text input is required
     *
     * @param required - Whether this text input is required
     */
    setRequired(required?: boolean): this;
    /**
     * {@inheritDoc ComponentBuilder.toJSON}
     */
    toJSON(): APITextInputComponent;
    /**
     * {@inheritDoc Equatable.equals}
     */
    equals(other: APITextInputComponent | JSONEncodable<APITextInputComponent>): boolean;
}

type MessageComponentBuilder = ActionRowBuilder<MessageActionRowComponentBuilder> | MessageActionRowComponentBuilder;
type ModalComponentBuilder = ActionRowBuilder<ModalActionRowComponentBuilder> | ModalActionRowComponentBuilder;
type MessageActionRowComponentBuilder = ButtonBuilder | ChannelSelectMenuBuilder | MentionableSelectMenuBuilder | RoleSelectMenuBuilder | StringSelectMenuBuilder | UserSelectMenuBuilder;
type ModalActionRowComponentBuilder = TextInputBuilder;
type AnyComponentBuilder = MessageActionRowComponentBuilder | ModalActionRowComponentBuilder;
/**
 * Represents an action row component
 *
 * @typeParam T - The types of components this action row holds
 */
declare class ActionRowBuilder<T extends AnyComponentBuilder> extends ComponentBuilder<APIActionRowComponent<APIMessageActionRowComponent | APIModalActionRowComponent>> {
    /**
     * The components within this action row
     */
    readonly components: T[];
    /**
     * Creates a new action row from API data
     *
     * @param data - The API data to create this action row with
     * @example
     * Creating an action row from an API data object
     * ```ts
     * const actionRow = new ActionRowBuilder({
     * 	components: [
     * 		{
     * 			custom_id: "custom id",
     * 			label: "Type something",
     * 			style: TextInputStyle.Short,
     * 			type: ComponentType.TextInput,
     * 		},
     * 	],
     * });
     * ```
     * @example
     * Creating an action row using setters and API data
     * ```ts
     * const actionRow = new ActionRowBuilder({
     * 	components: [
     * 		{
     * 			custom_id: "custom id",
     * 			label: "Click me",
     * 			style: ButtonStyle.Primary,
     * 			type: ComponentType.Button,
     * 		},
     * 	],
     * })
     * 	.addComponents(button2, button3);
     * ```
     */
    constructor({ components, ...data }?: Partial<APIActionRowComponent<APIActionRowComponentTypes>>);
    /**
     * Adds components to this action row.
     *
     * @param components - The components to add to this action row.
     */
    addComponents(...components: RestOrArray<T>): this;
    /**
     * Sets the components in this action row
     *
     * @param components - The components to set this row to
     */
    setComponents(...components: RestOrArray<T>): this;
    /**
     * {@inheritDoc ComponentBuilder.toJSON}
     */
    toJSON(): APIActionRowComponent<ReturnType<T['toJSON']>>;
}

interface MappedComponentTypes {
    [ComponentType.ActionRow]: ActionRowBuilder<AnyComponentBuilder>;
    [ComponentType.Button]: ButtonBuilder;
    [ComponentType.StringSelect]: StringSelectMenuBuilder;
    [ComponentType.TextInput]: TextInputBuilder;
    [ComponentType.UserSelect]: UserSelectMenuBuilder;
    [ComponentType.RoleSelect]: RoleSelectMenuBuilder;
    [ComponentType.MentionableSelect]: MentionableSelectMenuBuilder;
    [ComponentType.ChannelSelect]: ChannelSelectMenuBuilder;
}
/**
 * Factory for creating components from API data
 *
 * @param data - The api data to transform to a component class
 */
declare function createComponentBuilder<T extends keyof MappedComponentTypes>(data: (APIModalComponent | APIMessageComponent) & {
    type: T;
}): MappedComponentTypes[T];
declare function createComponentBuilder<C extends MessageComponentBuilder | ModalComponentBuilder>(data: C): C;

declare const textInputStyleValidator: _sapphire_shapeshift.NativeEnumValidator<typeof TextInputStyle>;
declare const minLengthValidator: _sapphire_shapeshift.NumberValidator<number>;
declare const maxLengthValidator: _sapphire_shapeshift.NumberValidator<number>;
declare const requiredValidator: _sapphire_shapeshift.BooleanValidator<boolean>;
declare const valueValidator: _sapphire_shapeshift.StringValidator<string>;
declare const placeholderValidator: _sapphire_shapeshift.StringValidator<string>;
declare const labelValidator: _sapphire_shapeshift.StringValidator<string>;
declare function validateRequiredParameters$3(customId?: string, style?: TextInputStyle, label?: string): void;

declare const Assertions$3_textInputStyleValidator: typeof textInputStyleValidator;
declare const Assertions$3_minLengthValidator: typeof minLengthValidator;
declare const Assertions$3_maxLengthValidator: typeof maxLengthValidator;
declare const Assertions$3_requiredValidator: typeof requiredValidator;
declare const Assertions$3_valueValidator: typeof valueValidator;
declare const Assertions$3_placeholderValidator: typeof placeholderValidator;
declare const Assertions$3_labelValidator: typeof labelValidator;
declare namespace Assertions$3 {
  export {
    Assertions$3_textInputStyleValidator as textInputStyleValidator,
    Assertions$3_minLengthValidator as minLengthValidator,
    Assertions$3_maxLengthValidator as maxLengthValidator,
    Assertions$3_requiredValidator as requiredValidator,
    Assertions$3_valueValidator as valueValidator,
    Assertions$3_placeholderValidator as placeholderValidator,
    Assertions$3_labelValidator as labelValidator,
    validateRequiredParameters$3 as validateRequiredParameters,
  };
}

declare class ModalBuilder implements JSONEncodable<APIModalInteractionResponseCallbackData> {
    readonly data: Partial<APIModalInteractionResponseCallbackData>;
    readonly components: ActionRowBuilder<ModalActionRowComponentBuilder>[];
    constructor({ components, ...data }?: Partial<APIModalInteractionResponseCallbackData>);
    /**
     * Sets the title of the modal
     *
     * @param title - The title of the modal
     */
    setTitle(title: string): this;
    /**
     * Sets the custom id of the modal
     *
     * @param customId - The custom id of this modal
     */
    setCustomId(customId: string): this;
    /**
     * Adds components to this modal
     *
     * @param components - The components to add to this modal
     */
    addComponents(...components: RestOrArray<ActionRowBuilder<ModalActionRowComponentBuilder> | APIActionRowComponent<APIModalActionRowComponent>>): this;
    /**
     * Sets the components in this modal
     *
     * @param components - The components to set this modal to
     */
    setComponents(...components: RestOrArray<ActionRowBuilder<ModalActionRowComponentBuilder>>): this;
    /**
     * {@inheritDoc ComponentBuilder.toJSON}
     */
    toJSON(): APIModalInteractionResponseCallbackData;
}

declare const titleValidator: _sapphire_shapeshift.StringValidator<string>;
declare const componentsValidator: _sapphire_shapeshift.ArrayValidator<[ActionRowBuilder<AnyComponentBuilder>, ...ActionRowBuilder<AnyComponentBuilder>[]], ActionRowBuilder<AnyComponentBuilder>>;
declare function validateRequiredParameters$2(customId?: string, title?: string, components?: ActionRowBuilder<ModalActionRowComponentBuilder>[]): void;

declare const Assertions$2_titleValidator: typeof titleValidator;
declare const Assertions$2_componentsValidator: typeof componentsValidator;
declare namespace Assertions$2 {
  export {
    Assertions$2_titleValidator as titleValidator,
    Assertions$2_componentsValidator as componentsValidator,
    validateRequiredParameters$2 as validateRequiredParameters,
  };
}

declare class SharedNameAndDescription {
    readonly name: string;
    readonly name_localizations?: LocalizationMap;
    readonly description: string;
    readonly description_localizations?: LocalizationMap;
    /**
     * Sets the name
     *
     * @param name - The name
     */
    setName(name: string): this;
    /**
     * Sets the description
     *
     * @param description - The description
     */
    setDescription(description: string): this;
    /**
     * Sets a name localization
     *
     * @param locale - The locale to set a description for
     * @param localizedName - The localized description for the given locale
     */
    setNameLocalization(locale: LocaleString, localizedName: string | null): this;
    /**
     * Sets the name localizations
     *
     * @param localizedNames - The dictionary of localized descriptions to set
     */
    setNameLocalizations(localizedNames: LocalizationMap | null): this;
    /**
     * Sets a description localization
     *
     * @param locale - The locale to set a description for
     * @param localizedDescription - The localized description for the given locale
     */
    setDescriptionLocalization(locale: LocaleString, localizedDescription: string | null): this;
    /**
     * Sets the description localizations
     *
     * @param localizedDescriptions - The dictionary of localized descriptions to set
     */
    setDescriptionLocalizations(localizedDescriptions: LocalizationMap | null): this;
}

declare abstract class ApplicationCommandOptionBase extends SharedNameAndDescription {
    abstract readonly type: ApplicationCommandOptionType;
    readonly required: boolean;
    /**
     * Marks the option as required
     *
     * @param required - If this option should be required
     */
    setRequired(required: boolean): this;
    abstract toJSON(): APIApplicationCommandBasicOption;
    protected runRequiredValidations(): void;
}

declare class SlashCommandAttachmentOption extends ApplicationCommandOptionBase {
    readonly type: ApplicationCommandOptionType.Attachment;
    toJSON(): APIApplicationCommandAttachmentOption;
}

declare class SlashCommandBooleanOption extends ApplicationCommandOptionBase {
    readonly type: ApplicationCommandOptionType.Boolean;
    toJSON(): APIApplicationCommandBooleanOption;
}

declare const allowedChannelTypes: readonly [ChannelType.GuildText, ChannelType.GuildVoice, ChannelType.GuildCategory, ChannelType.GuildAnnouncement, ChannelType.AnnouncementThread, ChannelType.PublicThread, ChannelType.PrivateThread, ChannelType.GuildStageVoice, ChannelType.GuildForum];
type ApplicationCommandOptionAllowedChannelTypes = typeof allowedChannelTypes[number];
declare class ApplicationCommandOptionChannelTypesMixin {
    readonly channel_types?: ApplicationCommandOptionAllowedChannelTypes[];
    /**
     * Adds channel types to this option
     *
     * @param channelTypes - The channel types to add
     */
    addChannelTypes(...channelTypes: ApplicationCommandOptionAllowedChannelTypes[]): this;
}

declare class SlashCommandChannelOption extends ApplicationCommandOptionBase {
    readonly type: ApplicationCommandOptionType.Channel;
    toJSON(): APIApplicationCommandChannelOption;
}
interface SlashCommandChannelOption extends ApplicationCommandOptionChannelTypesMixin {
}

declare abstract class ApplicationCommandNumericOptionMinMaxValueMixin {
    readonly max_value?: number;
    readonly min_value?: number;
    /**
     * Sets the maximum number value of this option
     *
     * @param max - The maximum value this option can be
     */
    abstract setMaxValue(max: number): this;
    /**
     * Sets the minimum number value of this option
     *
     * @param min - The minimum value this option can be
     */
    abstract setMinValue(min: number): this;
}

declare class ApplicationCommandOptionWithChoicesAndAutocompleteMixin<T extends number | string> {
    readonly choices?: APIApplicationCommandOptionChoice<T>[];
    readonly autocomplete?: boolean;
    readonly type: ApplicationCommandOptionType;
    /**
     * Adds multiple choices for this option
     *
     * @param choices - The choices to add
     */
    addChoices(...choices: APIApplicationCommandOptionChoice<T>[]): this;
    setChoices<Input extends APIApplicationCommandOptionChoice<T>[]>(...choices: Input): this;
    /**
     * Marks the option as autocompletable
     *
     * @param autocomplete - If this option should be autocompletable
     */
    setAutocomplete(autocomplete: boolean): this;
}

declare class SlashCommandIntegerOption extends ApplicationCommandOptionBase implements ApplicationCommandNumericOptionMinMaxValueMixin {
    readonly type: ApplicationCommandOptionType.Integer;
    /**
     * {@inheritDoc ApplicationCommandNumericOptionMinMaxValueMixin.setMaxValue}
     */
    setMaxValue(max: number): this;
    /**
     * {@inheritDoc ApplicationCommandNumericOptionMinMaxValueMixin.setMinValue}
     */
    setMinValue(min: number): this;
    toJSON(): APIApplicationCommandIntegerOption;
}
interface SlashCommandIntegerOption extends ApplicationCommandNumericOptionMinMaxValueMixin, ApplicationCommandOptionWithChoicesAndAutocompleteMixin<number> {
}

declare class SlashCommandMentionableOption extends ApplicationCommandOptionBase {
    readonly type: ApplicationCommandOptionType.Mentionable;
    toJSON(): APIApplicationCommandMentionableOption;
}

declare class SlashCommandNumberOption extends ApplicationCommandOptionBase implements ApplicationCommandNumericOptionMinMaxValueMixin {
    readonly type: ApplicationCommandOptionType.Number;
    /**
     * {@inheritDoc ApplicationCommandNumericOptionMinMaxValueMixin.setMaxValue}
     */
    setMaxValue(max: number): this;
    /**
     * {@inheritDoc ApplicationCommandNumericOptionMinMaxValueMixin.setMinValue}
     */
    setMinValue(min: number): this;
    toJSON(): APIApplicationCommandNumberOption;
}
interface SlashCommandNumberOption extends ApplicationCommandNumericOptionMinMaxValueMixin, ApplicationCommandOptionWithChoicesAndAutocompleteMixin<number> {
}

declare class SlashCommandRoleOption extends ApplicationCommandOptionBase {
    readonly type: ApplicationCommandOptionType.Role;
    toJSON(): APIApplicationCommandRoleOption;
}

declare class SlashCommandStringOption extends ApplicationCommandOptionBase {
    readonly type: ApplicationCommandOptionType.String;
    readonly max_length?: number;
    readonly min_length?: number;
    /**
     * Sets the maximum length of this string option.
     *
     * @param max - The maximum length this option can be
     */
    setMaxLength(max: number): this;
    /**
     * Sets the minimum length of this string option.
     *
     * @param min - The minimum length this option can be
     */
    setMinLength(min: number): this;
    toJSON(): APIApplicationCommandStringOption;
}
interface SlashCommandStringOption extends ApplicationCommandOptionWithChoicesAndAutocompleteMixin<string> {
}

declare class SlashCommandUserOption extends ApplicationCommandOptionBase {
    readonly type: ApplicationCommandOptionType.User;
    toJSON(): APIApplicationCommandUserOption;
}

declare class SharedSlashCommandOptions<ShouldOmitSubcommandFunctions = true> {
    readonly options: ToAPIApplicationCommandOptions[];
    /**
     * Adds a boolean option
     *
     * @param input - A function that returns an option builder, or an already built builder
     */
    addBooleanOption(input: SlashCommandBooleanOption | ((builder: SlashCommandBooleanOption) => SlashCommandBooleanOption)): ShouldOmitSubcommandFunctions extends true ? Omit<this, "addSubcommand" | "addSubcommandGroup"> : this;
    /**
     * Adds a user option
     *
     * @param input - A function that returns an option builder, or an already built builder
     */
    addUserOption(input: SlashCommandUserOption | ((builder: SlashCommandUserOption) => SlashCommandUserOption)): ShouldOmitSubcommandFunctions extends true ? Omit<this, "addSubcommand" | "addSubcommandGroup"> : this;
    /**
     * Adds a channel option
     *
     * @param input - A function that returns an option builder, or an already built builder
     */
    addChannelOption(input: SlashCommandChannelOption | ((builder: SlashCommandChannelOption) => SlashCommandChannelOption)): ShouldOmitSubcommandFunctions extends true ? Omit<this, "addSubcommand" | "addSubcommandGroup"> : this;
    /**
     * Adds a role option
     *
     * @param input - A function that returns an option builder, or an already built builder
     */
    addRoleOption(input: SlashCommandRoleOption | ((builder: SlashCommandRoleOption) => SlashCommandRoleOption)): ShouldOmitSubcommandFunctions extends true ? Omit<this, "addSubcommand" | "addSubcommandGroup"> : this;
    /**
     * Adds an attachment option
     *
     * @param input - A function that returns an option builder, or an already built builder
     */
    addAttachmentOption(input: SlashCommandAttachmentOption | ((builder: SlashCommandAttachmentOption) => SlashCommandAttachmentOption)): ShouldOmitSubcommandFunctions extends true ? Omit<this, "addSubcommand" | "addSubcommandGroup"> : this;
    /**
     * Adds a mentionable option
     *
     * @param input - A function that returns an option builder, or an already built builder
     */
    addMentionableOption(input: SlashCommandMentionableOption | ((builder: SlashCommandMentionableOption) => SlashCommandMentionableOption)): ShouldOmitSubcommandFunctions extends true ? Omit<this, "addSubcommand" | "addSubcommandGroup"> : this;
    /**
     * Adds a string option
     *
     * @param input - A function that returns an option builder, or an already built builder
     */
    addStringOption(input: Omit<SlashCommandStringOption, 'addChoices'> | Omit<SlashCommandStringOption, 'setAutocomplete'> | SlashCommandStringOption | ((builder: SlashCommandStringOption) => Omit<SlashCommandStringOption, 'addChoices'> | Omit<SlashCommandStringOption, 'setAutocomplete'> | SlashCommandStringOption)): ShouldOmitSubcommandFunctions extends true ? Omit<this, "addSubcommand" | "addSubcommandGroup"> : this;
    /**
     * Adds an integer option
     *
     * @param input - A function that returns an option builder, or an already built builder
     */
    addIntegerOption(input: Omit<SlashCommandIntegerOption, 'addChoices'> | Omit<SlashCommandIntegerOption, 'setAutocomplete'> | SlashCommandIntegerOption | ((builder: SlashCommandIntegerOption) => Omit<SlashCommandIntegerOption, 'addChoices'> | Omit<SlashCommandIntegerOption, 'setAutocomplete'> | SlashCommandIntegerOption)): ShouldOmitSubcommandFunctions extends true ? Omit<this, "addSubcommand" | "addSubcommandGroup"> : this;
    /**
     * Adds a number option
     *
     * @param input - A function that returns an option builder, or an already built builder
     */
    addNumberOption(input: Omit<SlashCommandNumberOption, 'addChoices'> | Omit<SlashCommandNumberOption, 'setAutocomplete'> | SlashCommandNumberOption | ((builder: SlashCommandNumberOption) => Omit<SlashCommandNumberOption, 'addChoices'> | Omit<SlashCommandNumberOption, 'setAutocomplete'> | SlashCommandNumberOption)): ShouldOmitSubcommandFunctions extends true ? Omit<this, "addSubcommand" | "addSubcommandGroup"> : this;
    private _sharedAddOptionMethod;
}

/**
 * Represents a folder for subcommands
 *
 * For more information, go to https://discord.com/developers/docs/interactions/application-commands#subcommands-and-subcommand-groups
 */
declare class SlashCommandSubcommandGroupBuilder implements ToAPIApplicationCommandOptions {
    /**
     * The name of this subcommand group
     */
    readonly name: string;
    /**
     * The description of this subcommand group
     */
    readonly description: string;
    /**
     * The subcommands part of this subcommand group
     */
    readonly options: SlashCommandSubcommandBuilder[];
    /**
     * Adds a new subcommand to this group
     *
     * @param input - A function that returns a subcommand builder, or an already built builder
     */
    addSubcommand(input: SlashCommandSubcommandBuilder | ((subcommandGroup: SlashCommandSubcommandBuilder) => SlashCommandSubcommandBuilder)): this;
    toJSON(): APIApplicationCommandSubcommandGroupOption;
}
interface SlashCommandSubcommandGroupBuilder extends SharedNameAndDescription {
}
/**
 * Represents a subcommand
 *
 * For more information, go to https://discord.com/developers/docs/interactions/application-commands#subcommands-and-subcommand-groups
 */
declare class SlashCommandSubcommandBuilder implements ToAPIApplicationCommandOptions {
    /**
     * The name of this subcommand
     */
    readonly name: string;
    /**
     * The description of this subcommand
     */
    readonly description: string;
    /**
     * The options of this subcommand
     */
    readonly options: ApplicationCommandOptionBase[];
    toJSON(): APIApplicationCommandSubcommandOption;
}
interface SlashCommandSubcommandBuilder extends SharedNameAndDescription, SharedSlashCommandOptions<false> {
}

declare class SlashCommandBuilder {
    /**
     * The name of this slash command
     */
    readonly name: string;
    /**
     * The localized names for this command
     */
    readonly name_localizations?: LocalizationMap;
    /**
     * The description of this slash command
     */
    readonly description: string;
    /**
     * The localized descriptions for this command
     */
    readonly description_localizations?: LocalizationMap;
    /**
     * The options of this slash command
     */
    readonly options: ToAPIApplicationCommandOptions[];
    /**
     * Whether the command is enabled by default when the app is added to a guild
     *
     * @deprecated This property is deprecated and will be removed in the future.
     * You should use {@link (SlashCommandBuilder:class).setDefaultMemberPermissions} or {@link (SlashCommandBuilder:class).setDMPermission} instead.
     */
    readonly default_permission: boolean | undefined;
    /**
     * Set of permissions represented as a bit set for the command
     */
    readonly default_member_permissions: Permissions | null | undefined;
    /**
     * Indicates whether the command is available in DMs with the application, only for globally-scoped commands.
     * By default, commands are visible.
     */
    readonly dm_permission: boolean | undefined;
    /**
     * Returns the final data that should be sent to Discord.
     *
     * @remarks
     * This method runs validations on the data before serializing it.
     * As such, it may throw an error if the data is invalid.
     */
    toJSON(): RESTPostAPIChatInputApplicationCommandsJSONBody;
    /**
     * Sets whether the command is enabled by default when the application is added to a guild.
     *
     * @remarks
     * If set to `false`, you will have to later `PUT` the permissions for this command.
     * @param value - Whether or not to enable this command by default
     * @see https://discord.com/developers/docs/interactions/application-commands#permissions
     * @deprecated Use {@link (SlashCommandBuilder:class).setDefaultMemberPermissions} or {@link (SlashCommandBuilder:class).setDMPermission} instead.
     */
    setDefaultPermission(value: boolean): this;
    /**
     * Sets the default permissions a member should have in order to run the command.
     *
     * @remarks
     * You can set this to `'0'` to disable the command by default.
     * @param permissions - The permissions bit field to set
     * @see https://discord.com/developers/docs/interactions/application-commands#permissions
     */
    setDefaultMemberPermissions(permissions: Permissions | bigint | number | null | undefined): this;
    /**
     * Sets if the command is available in DMs with the application, only for globally-scoped commands.
     * By default, commands are visible.
     *
     * @param enabled - If the command should be enabled in DMs
     * @see https://discord.com/developers/docs/interactions/application-commands#permissions
     */
    setDMPermission(enabled: boolean | null | undefined): this;
    /**
     * Adds a new subcommand group to this command
     *
     * @param input - A function that returns a subcommand group builder, or an already built builder
     */
    addSubcommandGroup(input: SlashCommandSubcommandGroupBuilder | ((subcommandGroup: SlashCommandSubcommandGroupBuilder) => SlashCommandSubcommandGroupBuilder)): SlashCommandSubcommandsOnlyBuilder;
    /**
     * Adds a new subcommand to this command
     *
     * @param input - A function that returns a subcommand builder, or an already built builder
     */
    addSubcommand(input: SlashCommandSubcommandBuilder | ((subcommandGroup: SlashCommandSubcommandBuilder) => SlashCommandSubcommandBuilder)): SlashCommandSubcommandsOnlyBuilder;
}
interface SlashCommandBuilder extends SharedNameAndDescription, SharedSlashCommandOptions {
}
interface SlashCommandSubcommandsOnlyBuilder extends Omit<SlashCommandBuilder, Exclude<keyof SharedSlashCommandOptions, 'options'>> {
}
interface SlashCommandOptionsOnlyBuilder extends SharedNameAndDescription, SharedSlashCommandOptions, Pick<SlashCommandBuilder, 'toJSON'> {
}
interface ToAPIApplicationCommandOptions {
    toJSON(): APIApplicationCommandOption;
}

declare function validateName$1(name: unknown): asserts name is string;
declare function validateDescription(description: unknown): asserts description is string;
declare function validateLocale(locale: unknown): Locale;
declare function validateMaxOptionsLength(options: unknown): asserts options is ToAPIApplicationCommandOptions[];
declare function validateRequiredParameters$1(name: string, description: string, options: ToAPIApplicationCommandOptions[]): void;
declare function validateDefaultPermission$1(value: unknown): asserts value is boolean;
declare function validateRequired(required: unknown): asserts required is boolean;
declare function validateChoicesLength(amountAdding: number, choices?: APIApplicationCommandOptionChoice[]): void;
declare function assertReturnOfBuilder<T extends ApplicationCommandOptionBase | SlashCommandSubcommandBuilder | SlashCommandSubcommandGroupBuilder>(input: unknown, ExpectedInstanceOf: new () => T): asserts input is T;
declare const localizationMapPredicate: _sapphire_shapeshift.UnionValidator<_sapphire_shapeshift.UndefinedToOptional<Partial<Record<"en-US" | "en-GB" | "bg" | "zh-CN" | "zh-TW" | "hr" | "cs" | "da" | "nl" | "fi" | "fr" | "de" | "el" | "hi" | "hu" | "it" | "ja" | "ko" | "lt" | "no" | "pl" | "pt-BR" | "ro" | "ru" | "es-ES" | "sv-SE" | "th" | "tr" | "uk" | "vi", string | null>>> | null | undefined>;
declare function validateLocalizationMap(value: unknown): asserts value is LocalizationMap;
declare function validateDMPermission$1(value: unknown): asserts value is boolean | null | undefined;
declare function validateDefaultMemberPermissions$1(permissions: unknown): string | null | undefined;

declare const Assertions$1_validateDescription: typeof validateDescription;
declare const Assertions$1_validateLocale: typeof validateLocale;
declare const Assertions$1_validateMaxOptionsLength: typeof validateMaxOptionsLength;
declare const Assertions$1_validateRequired: typeof validateRequired;
declare const Assertions$1_validateChoicesLength: typeof validateChoicesLength;
declare const Assertions$1_assertReturnOfBuilder: typeof assertReturnOfBuilder;
declare const Assertions$1_localizationMapPredicate: typeof localizationMapPredicate;
declare const Assertions$1_validateLocalizationMap: typeof validateLocalizationMap;
declare namespace Assertions$1 {
  export {
    validateName$1 as validateName,
    Assertions$1_validateDescription as validateDescription,
    Assertions$1_validateLocale as validateLocale,
    Assertions$1_validateMaxOptionsLength as validateMaxOptionsLength,
    validateRequiredParameters$1 as validateRequiredParameters,
    validateDefaultPermission$1 as validateDefaultPermission,
    Assertions$1_validateRequired as validateRequired,
    Assertions$1_validateChoicesLength as validateChoicesLength,
    Assertions$1_assertReturnOfBuilder as assertReturnOfBuilder,
    Assertions$1_localizationMapPredicate as localizationMapPredicate,
    Assertions$1_validateLocalizationMap as validateLocalizationMap,
    validateDMPermission$1 as validateDMPermission,
    validateDefaultMemberPermissions$1 as validateDefaultMemberPermissions,
  };
}

declare class ContextMenuCommandBuilder {
    /**
     * The name of this context menu command
     */
    readonly name: string;
    /**
     * The localized names for this command
     */
    readonly name_localizations?: LocalizationMap;
    /**
     * The type of this context menu command
     */
    readonly type: ContextMenuCommandType;
    /**
     * Whether the command is enabled by default when the app is added to a guild
     *
     * @deprecated This property is deprecated and will be removed in the future.
     * You should use {@link ContextMenuCommandBuilder.setDefaultMemberPermissions} or {@link ContextMenuCommandBuilder.setDMPermission} instead.
     */
    readonly default_permission: boolean | undefined;
    /**
     * Set of permissions represented as a bit set for the command
     */
    readonly default_member_permissions: Permissions | null | undefined;
    /**
     * Indicates whether the command is available in DMs with the application, only for globally-scoped commands.
     * By default, commands are visible.
     */
    readonly dm_permission: boolean | undefined;
    /**
     * Sets the name
     *
     * @param name - The name
     */
    setName(name: string): this;
    /**
     * Sets the type
     *
     * @param type - The type
     */
    setType(type: ContextMenuCommandType): this;
    /**
     * Sets whether the command is enabled by default when the application is added to a guild.
     *
     * @remarks
     * If set to `false`, you will have to later `PUT` the permissions for this command.
     * @param value - Whether or not to enable this command by default
     * @see https://discord.com/developers/docs/interactions/application-commands#permissions
     * @deprecated Use {@link ContextMenuCommandBuilder.setDefaultMemberPermissions} or {@link ContextMenuCommandBuilder.setDMPermission} instead.
     */
    setDefaultPermission(value: boolean): this;
    /**
     * Sets the default permissions a member should have in order to run the command.
     *
     * @remarks
     * You can set this to `'0'` to disable the command by default.
     * @param permissions - The permissions bit field to set
     * @see https://discord.com/developers/docs/interactions/application-commands#permissions
     */
    setDefaultMemberPermissions(permissions: Permissions | bigint | number | null | undefined): this;
    /**
     * Sets if the command is available in DMs with the application, only for globally-scoped commands.
     * By default, commands are visible.
     *
     * @param enabled - If the command should be enabled in DMs
     * @see https://discord.com/developers/docs/interactions/application-commands#permissions
     */
    setDMPermission(enabled: boolean | null | undefined): this;
    /**
     * Sets a name localization
     *
     * @param locale - The locale to set a description for
     * @param localizedName - The localized description for the given locale
     */
    setNameLocalization(locale: LocaleString, localizedName: string | null): this;
    /**
     * Sets the name localizations
     *
     * @param localizedNames - The dictionary of localized descriptions to set
     */
    setNameLocalizations(localizedNames: LocalizationMap | null): this;
    /**
     * Returns the final data that should be sent to Discord.
     *
     * @remarks
     * This method runs validations on the data before serializing it.
     * As such, it may throw an error if the data is invalid.
     */
    toJSON(): RESTPostAPIContextMenuApplicationCommandsJSONBody;
}
type ContextMenuCommandType = ApplicationCommandType.Message | ApplicationCommandType.User;

declare function validateDefaultPermission(value: unknown): asserts value is boolean;
declare function validateName(name: unknown): asserts name is string;
declare function validateType(type: unknown): asserts type is ContextMenuCommandType;
declare function validateRequiredParameters(name: string, type: number): void;
declare function validateDMPermission(value: unknown): asserts value is boolean | null | undefined;
declare function validateDefaultMemberPermissions(permissions: unknown): string | null | undefined;

declare const Assertions_validateDefaultPermission: typeof validateDefaultPermission;
declare const Assertions_validateName: typeof validateName;
declare const Assertions_validateType: typeof validateType;
declare const Assertions_validateRequiredParameters: typeof validateRequiredParameters;
declare const Assertions_validateDMPermission: typeof validateDMPermission;
declare const Assertions_validateDefaultMemberPermissions: typeof validateDefaultMemberPermissions;
declare namespace Assertions {
  export {
    Assertions_validateDefaultPermission as validateDefaultPermission,
    Assertions_validateName as validateName,
    Assertions_validateType as validateType,
    Assertions_validateRequiredParameters as validateRequiredParameters,
    Assertions_validateDMPermission as validateDMPermission,
    Assertions_validateDefaultMemberPermissions as validateDefaultMemberPermissions,
  };
}

declare function embedLength(data: APIEmbed): number;

declare const enableValidators: () => boolean;
declare const disableValidators: () => boolean;
declare const isValidationEnabled: () => boolean;

/**
 * The {@link https://github.com/discordjs/discord.js/blob/main/packages/builders/#readme | @discordjs/builders} version
 * that you are currently using.
 */
declare const version: string;

export { ActionRowBuilder, AnyAPIActionRowComponent, AnyComponentBuilder, ApplicationCommandNumericOptionMinMaxValueMixin, ApplicationCommandOptionAllowedChannelTypes, ApplicationCommandOptionBase, ApplicationCommandOptionChannelTypesMixin, ApplicationCommandOptionWithChoicesAndAutocompleteMixin, BaseSelectMenuBuilder, ButtonBuilder, ChannelSelectMenuBuilder, Assertions$4 as ComponentAssertions, ComponentBuilder, Assertions as ContextMenuCommandAssertions, ContextMenuCommandBuilder, ContextMenuCommandType, Assertions$5 as EmbedAssertions, EmbedAuthorData, EmbedAuthorOptions, EmbedBuilder, EmbedFooterData, EmbedFooterOptions, EmbedImageData, Faces, IconData, MappedComponentTypes, MentionableSelectMenuBuilder, MessageActionRowComponentBuilder, MessageComponentBuilder, ModalActionRowComponentBuilder, Assertions$2 as ModalAssertions, ModalBuilder, ModalComponentBuilder, RGBTuple, RestOrArray, RoleSelectMenuBuilder, StringSelectMenuBuilder as SelectMenuBuilder, StringSelectMenuOptionBuilder as SelectMenuOptionBuilder, SharedNameAndDescription, SharedSlashCommandOptions, Assertions$1 as SlashCommandAssertions, SlashCommandAttachmentOption, SlashCommandBooleanOption, SlashCommandBuilder, SlashCommandChannelOption, SlashCommandIntegerOption, SlashCommandMentionableOption, SlashCommandNumberOption, SlashCommandOptionsOnlyBuilder, SlashCommandRoleOption, SlashCommandStringOption, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder, SlashCommandSubcommandsOnlyBuilder, SlashCommandUserOption, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, Assertions$3 as TextInputAssertions, TextInputBuilder, TimestampStyles, TimestampStylesString, ToAPIApplicationCommandOptions, UserSelectMenuBuilder, blockQuote, bold, channelLink, channelMention, chatInputApplicationCommandMention, codeBlock, createComponentBuilder, disableValidators, embedLength, enableValidators, formatEmoji, hideLinkEmbed, hyperlink, inlineCode, isValidationEnabled, italic, messageLink, normalizeArray, quote, roleMention, spoiler, strikethrough, time, underscore, userMention, version };
