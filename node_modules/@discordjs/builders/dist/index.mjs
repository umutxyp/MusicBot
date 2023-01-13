var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp(target, key, result);
  return result;
};

// src/messages/embed/Assertions.ts
var Assertions_exports = {};
__export(Assertions_exports, {
  RGBPredicate: () => RGBPredicate,
  authorNamePredicate: () => authorNamePredicate,
  colorPredicate: () => colorPredicate,
  descriptionPredicate: () => descriptionPredicate,
  embedAuthorPredicate: () => embedAuthorPredicate,
  embedFieldPredicate: () => embedFieldPredicate,
  embedFieldsArrayPredicate: () => embedFieldsArrayPredicate,
  embedFooterPredicate: () => embedFooterPredicate,
  fieldInlinePredicate: () => fieldInlinePredicate,
  fieldLengthPredicate: () => fieldLengthPredicate,
  fieldNamePredicate: () => fieldNamePredicate,
  fieldValuePredicate: () => fieldValuePredicate,
  footerTextPredicate: () => footerTextPredicate,
  imageURLPredicate: () => imageURLPredicate,
  timestampPredicate: () => timestampPredicate,
  titlePredicate: () => titlePredicate,
  urlPredicate: () => urlPredicate,
  validateFieldLength: () => validateFieldLength
});
import { s } from "@sapphire/shapeshift";

// src/util/validation.ts
var validate = true;
var enableValidators = /* @__PURE__ */ __name(() => validate = true, "enableValidators");
var disableValidators = /* @__PURE__ */ __name(() => validate = false, "disableValidators");
var isValidationEnabled = /* @__PURE__ */ __name(() => validate, "isValidationEnabled");

// src/messages/embed/Assertions.ts
var fieldNamePredicate = s.string.lengthGreaterThanOrEqual(1).lengthLessThanOrEqual(256).setValidationEnabled(isValidationEnabled);
var fieldValuePredicate = s.string.lengthGreaterThanOrEqual(1).lengthLessThanOrEqual(1024).setValidationEnabled(isValidationEnabled);
var fieldInlinePredicate = s.boolean.optional;
var embedFieldPredicate = s.object({
  name: fieldNamePredicate,
  value: fieldValuePredicate,
  inline: fieldInlinePredicate
}).setValidationEnabled(isValidationEnabled);
var embedFieldsArrayPredicate = embedFieldPredicate.array.setValidationEnabled(isValidationEnabled);
var fieldLengthPredicate = s.number.lessThanOrEqual(25).setValidationEnabled(isValidationEnabled);
function validateFieldLength(amountAdding, fields) {
  fieldLengthPredicate.parse((fields?.length ?? 0) + amountAdding);
}
__name(validateFieldLength, "validateFieldLength");
var authorNamePredicate = fieldNamePredicate.nullable.setValidationEnabled(isValidationEnabled);
var imageURLPredicate = s.string.url({
  allowedProtocols: ["http:", "https:", "attachment:"]
}).nullish.setValidationEnabled(isValidationEnabled);
var urlPredicate = s.string.url({
  allowedProtocols: ["http:", "https:"]
}).nullish.setValidationEnabled(isValidationEnabled);
var embedAuthorPredicate = s.object({
  name: authorNamePredicate,
  iconURL: imageURLPredicate,
  url: urlPredicate
}).setValidationEnabled(isValidationEnabled);
var RGBPredicate = s.number.int.greaterThanOrEqual(0).lessThanOrEqual(255).setValidationEnabled(isValidationEnabled);
var colorPredicate = s.number.int.greaterThanOrEqual(0).lessThanOrEqual(16777215).or(s.tuple([RGBPredicate, RGBPredicate, RGBPredicate])).nullable.setValidationEnabled(isValidationEnabled);
var descriptionPredicate = s.string.lengthGreaterThanOrEqual(1).lengthLessThanOrEqual(4096).nullable.setValidationEnabled(isValidationEnabled);
var footerTextPredicate = s.string.lengthGreaterThanOrEqual(1).lengthLessThanOrEqual(2048).nullable.setValidationEnabled(isValidationEnabled);
var embedFooterPredicate = s.object({
  text: footerTextPredicate,
  iconURL: imageURLPredicate
}).setValidationEnabled(isValidationEnabled);
var timestampPredicate = s.union(s.number, s.date).nullable.setValidationEnabled(isValidationEnabled);
var titlePredicate = fieldNamePredicate.nullable.setValidationEnabled(isValidationEnabled);

// src/util/normalizeArray.ts
function normalizeArray(arr) {
  if (Array.isArray(arr[0]))
    return arr[0];
  return arr;
}
__name(normalizeArray, "normalizeArray");

// src/messages/embed/Embed.ts
var EmbedBuilder = class {
  data;
  constructor(data = {}) {
    this.data = { ...data };
    if (data.timestamp)
      this.data.timestamp = new Date(data.timestamp).toISOString();
  }
  addFields(...fields) {
    fields = normalizeArray(fields);
    validateFieldLength(fields.length, this.data.fields);
    embedFieldsArrayPredicate.parse(fields);
    if (this.data.fields)
      this.data.fields.push(...fields);
    else
      this.data.fields = fields;
    return this;
  }
  spliceFields(index, deleteCount, ...fields) {
    validateFieldLength(fields.length - deleteCount, this.data.fields);
    embedFieldsArrayPredicate.parse(fields);
    if (this.data.fields)
      this.data.fields.splice(index, deleteCount, ...fields);
    else
      this.data.fields = fields;
    return this;
  }
  setFields(...fields) {
    this.spliceFields(0, this.data.fields?.length ?? 0, ...normalizeArray(fields));
    return this;
  }
  setAuthor(options) {
    if (options === null) {
      this.data.author = void 0;
      return this;
    }
    embedAuthorPredicate.parse(options);
    this.data.author = { name: options.name, url: options.url, icon_url: options.iconURL };
    return this;
  }
  setColor(color) {
    colorPredicate.parse(color);
    if (Array.isArray(color)) {
      const [red, green, blue] = color;
      this.data.color = (red << 16) + (green << 8) + blue;
      return this;
    }
    this.data.color = color ?? void 0;
    return this;
  }
  setDescription(description) {
    descriptionPredicate.parse(description);
    this.data.description = description ?? void 0;
    return this;
  }
  setFooter(options) {
    if (options === null) {
      this.data.footer = void 0;
      return this;
    }
    embedFooterPredicate.parse(options);
    this.data.footer = { text: options.text, icon_url: options.iconURL };
    return this;
  }
  setImage(url) {
    imageURLPredicate.parse(url);
    this.data.image = url ? { url } : void 0;
    return this;
  }
  setThumbnail(url) {
    imageURLPredicate.parse(url);
    this.data.thumbnail = url ? { url } : void 0;
    return this;
  }
  setTimestamp(timestamp = Date.now()) {
    timestampPredicate.parse(timestamp);
    this.data.timestamp = timestamp ? new Date(timestamp).toISOString() : void 0;
    return this;
  }
  setTitle(title) {
    titlePredicate.parse(title);
    this.data.title = title ?? void 0;
    return this;
  }
  setURL(url) {
    urlPredicate.parse(url);
    this.data.url = url ?? void 0;
    return this;
  }
  toJSON() {
    return { ...this.data };
  }
};
__name(EmbedBuilder, "EmbedBuilder");

// src/messages/formatters.ts
function codeBlock(language, content) {
  return typeof content === "undefined" ? `\`\`\`
${language}
\`\`\`` : `\`\`\`${language}
${content}
\`\`\``;
}
__name(codeBlock, "codeBlock");
function inlineCode(content) {
  return `\`${content}\``;
}
__name(inlineCode, "inlineCode");
function italic(content) {
  return `_${content}_`;
}
__name(italic, "italic");
function bold(content) {
  return `**${content}**`;
}
__name(bold, "bold");
function underscore(content) {
  return `__${content}__`;
}
__name(underscore, "underscore");
function strikethrough(content) {
  return `~~${content}~~`;
}
__name(strikethrough, "strikethrough");
function quote(content) {
  return `> ${content}`;
}
__name(quote, "quote");
function blockQuote(content) {
  return `>>> ${content}`;
}
__name(blockQuote, "blockQuote");
function hideLinkEmbed(url) {
  return `<${url}>`;
}
__name(hideLinkEmbed, "hideLinkEmbed");
function hyperlink(content, url, title) {
  return title ? `[${content}](${url} "${title}")` : `[${content}](${url})`;
}
__name(hyperlink, "hyperlink");
function spoiler(content) {
  return `||${content}||`;
}
__name(spoiler, "spoiler");
function userMention(userId) {
  return `<@${userId}>`;
}
__name(userMention, "userMention");
function channelMention(channelId) {
  return `<#${channelId}>`;
}
__name(channelMention, "channelMention");
function roleMention(roleId) {
  return `<@&${roleId}>`;
}
__name(roleMention, "roleMention");
function chatInputApplicationCommandMention(commandName, subcommandGroupName, subcommandName, commandId) {
  if (typeof commandId !== "undefined") {
    return `</${commandName} ${subcommandGroupName} ${subcommandName}:${commandId}>`;
  }
  if (typeof subcommandName !== "undefined") {
    return `</${commandName} ${subcommandGroupName}:${subcommandName}>`;
  }
  return `</${commandName}:${subcommandGroupName}>`;
}
__name(chatInputApplicationCommandMention, "chatInputApplicationCommandMention");
function formatEmoji(emojiId, animated = false) {
  return `<${animated ? "a" : ""}:_:${emojiId}>`;
}
__name(formatEmoji, "formatEmoji");
function channelLink(channelId, guildId) {
  return `https://discord.com/channels/${guildId ?? "@me"}/${channelId}`;
}
__name(channelLink, "channelLink");
function messageLink(channelId, messageId, guildId) {
  return `${typeof guildId === "undefined" ? channelLink(channelId) : channelLink(channelId, guildId)}/${messageId}`;
}
__name(messageLink, "messageLink");
function time(timeOrSeconds, style) {
  if (typeof timeOrSeconds !== "number") {
    timeOrSeconds = Math.floor((timeOrSeconds?.getTime() ?? Date.now()) / 1e3);
  }
  return typeof style === "string" ? `<t:${timeOrSeconds}:${style}>` : `<t:${timeOrSeconds}>`;
}
__name(time, "time");
var TimestampStyles = {
  ShortTime: "t",
  LongTime: "T",
  ShortDate: "d",
  LongDate: "D",
  ShortDateTime: "f",
  LongDateTime: "F",
  RelativeTime: "R"
};
var Faces = /* @__PURE__ */ ((Faces2) => {
  Faces2["Shrug"] = "\xAF\\_(\u30C4)\\_/\xAF";
  Faces2["Tableflip"] = "(\u256F\xB0\u25A1\xB0\uFF09\u256F\uFE35 \u253B\u2501\u253B";
  Faces2["Unflip"] = "\u252C\u2500\u252C \u30CE( \u309C-\u309C\u30CE)";
  return Faces2;
})(Faces || {});

// src/components/Assertions.ts
var Assertions_exports2 = {};
__export(Assertions_exports2, {
  buttonLabelValidator: () => buttonLabelValidator,
  buttonStyleValidator: () => buttonStyleValidator,
  channelTypesValidator: () => channelTypesValidator,
  customIdValidator: () => customIdValidator,
  defaultValidator: () => defaultValidator,
  disabledValidator: () => disabledValidator,
  emojiValidator: () => emojiValidator,
  jsonOptionValidator: () => jsonOptionValidator,
  labelValueDescriptionValidator: () => labelValueDescriptionValidator,
  minMaxValidator: () => minMaxValidator,
  optionValidator: () => optionValidator,
  optionsLengthValidator: () => optionsLengthValidator,
  optionsValidator: () => optionsValidator,
  placeholderValidator: () => placeholderValidator,
  urlValidator: () => urlValidator,
  validateRequiredButtonParameters: () => validateRequiredButtonParameters,
  validateRequiredSelectMenuOptionParameters: () => validateRequiredSelectMenuOptionParameters,
  validateRequiredSelectMenuParameters: () => validateRequiredSelectMenuParameters
});
import { s as s2 } from "@sapphire/shapeshift";
import { ButtonStyle, ChannelType } from "discord-api-types/v10";

// src/components/selectMenu/StringSelectMenuOption.ts
var StringSelectMenuOptionBuilder = class {
  constructor(data = {}) {
    this.data = data;
  }
  setLabel(label) {
    this.data.label = labelValueDescriptionValidator.parse(label);
    return this;
  }
  setValue(value) {
    this.data.value = labelValueDescriptionValidator.parse(value);
    return this;
  }
  setDescription(description) {
    this.data.description = labelValueDescriptionValidator.parse(description);
    return this;
  }
  setDefault(isDefault = true) {
    this.data.default = defaultValidator.parse(isDefault);
    return this;
  }
  setEmoji(emoji) {
    this.data.emoji = emojiValidator.parse(emoji);
    return this;
  }
  toJSON() {
    validateRequiredSelectMenuOptionParameters(this.data.label, this.data.value);
    return {
      ...this.data
    };
  }
};
__name(StringSelectMenuOptionBuilder, "StringSelectMenuOptionBuilder");

// src/components/Assertions.ts
var customIdValidator = s2.string.lengthGreaterThanOrEqual(1).lengthLessThanOrEqual(100).setValidationEnabled(isValidationEnabled);
var emojiValidator = s2.object({
  id: s2.string,
  name: s2.string,
  animated: s2.boolean
}).partial.strict.setValidationEnabled(isValidationEnabled);
var disabledValidator = s2.boolean;
var buttonLabelValidator = s2.string.lengthGreaterThanOrEqual(1).lengthLessThanOrEqual(80).setValidationEnabled(isValidationEnabled);
var buttonStyleValidator = s2.nativeEnum(ButtonStyle);
var placeholderValidator = s2.string.lengthLessThanOrEqual(150).setValidationEnabled(isValidationEnabled);
var minMaxValidator = s2.number.int.greaterThanOrEqual(0).lessThanOrEqual(25).setValidationEnabled(isValidationEnabled);
var labelValueDescriptionValidator = s2.string.lengthGreaterThanOrEqual(1).lengthLessThanOrEqual(100).setValidationEnabled(isValidationEnabled);
var jsonOptionValidator = s2.object({
  label: labelValueDescriptionValidator,
  value: labelValueDescriptionValidator,
  description: labelValueDescriptionValidator.optional,
  emoji: emojiValidator.optional,
  default: s2.boolean.optional
}).setValidationEnabled(isValidationEnabled);
var optionValidator = s2.instance(StringSelectMenuOptionBuilder).setValidationEnabled(isValidationEnabled);
var optionsValidator = optionValidator.array.lengthGreaterThanOrEqual(0).setValidationEnabled(isValidationEnabled);
var optionsLengthValidator = s2.number.int.greaterThanOrEqual(0).lessThanOrEqual(25).setValidationEnabled(isValidationEnabled);
function validateRequiredSelectMenuParameters(options, customId) {
  customIdValidator.parse(customId);
  optionsValidator.parse(options);
}
__name(validateRequiredSelectMenuParameters, "validateRequiredSelectMenuParameters");
var defaultValidator = s2.boolean;
function validateRequiredSelectMenuOptionParameters(label, value) {
  labelValueDescriptionValidator.parse(label);
  labelValueDescriptionValidator.parse(value);
}
__name(validateRequiredSelectMenuOptionParameters, "validateRequiredSelectMenuOptionParameters");
var channelTypesValidator = s2.nativeEnum(ChannelType).array.setValidationEnabled(isValidationEnabled);
var urlValidator = s2.string.url({
  allowedProtocols: ["http:", "https:", "discord:"]
}).setValidationEnabled(isValidationEnabled);
function validateRequiredButtonParameters(style, label, emoji, customId, url) {
  if (url && customId) {
    throw new RangeError("URL and custom id are mutually exclusive");
  }
  if (!label && !emoji) {
    throw new RangeError("Buttons must have a label and/or an emoji");
  }
  if (style === ButtonStyle.Link) {
    if (!url) {
      throw new RangeError("Link buttons must have a url");
    }
  } else if (url) {
    throw new RangeError("Non-link buttons cannot have a url");
  }
}
__name(validateRequiredButtonParameters, "validateRequiredButtonParameters");

// src/components/ActionRow.ts
import {
  ComponentType as ComponentType9
} from "discord-api-types/v10";

// src/components/Component.ts
var ComponentBuilder = class {
  data;
  constructor(data) {
    this.data = data;
  }
};
__name(ComponentBuilder, "ComponentBuilder");

// src/components/Components.ts
import { ComponentType as ComponentType8 } from "discord-api-types/v10";

// src/components/button/Button.ts
import {
  ComponentType
} from "discord-api-types/v10";
var ButtonBuilder = class extends ComponentBuilder {
  constructor(data) {
    super({ type: ComponentType.Button, ...data });
  }
  setStyle(style) {
    this.data.style = buttonStyleValidator.parse(style);
    return this;
  }
  setURL(url) {
    this.data.url = urlValidator.parse(url);
    return this;
  }
  setCustomId(customId) {
    this.data.custom_id = customIdValidator.parse(customId);
    return this;
  }
  setEmoji(emoji) {
    this.data.emoji = emojiValidator.parse(emoji);
    return this;
  }
  setDisabled(disabled = true) {
    this.data.disabled = disabledValidator.parse(disabled);
    return this;
  }
  setLabel(label) {
    this.data.label = buttonLabelValidator.parse(label);
    return this;
  }
  toJSON() {
    validateRequiredButtonParameters(
      this.data.style,
      this.data.label,
      this.data.emoji,
      this.data.custom_id,
      this.data.url
    );
    return {
      ...this.data
    };
  }
};
__name(ButtonBuilder, "ButtonBuilder");

// src/components/selectMenu/ChannelSelectMenu.ts
import { ComponentType as ComponentType2 } from "discord-api-types/v10";

// src/components/selectMenu/BaseSelectMenu.ts
var BaseSelectMenuBuilder = class extends ComponentBuilder {
  setPlaceholder(placeholder) {
    this.data.placeholder = placeholderValidator.parse(placeholder);
    return this;
  }
  setMinValues(minValues) {
    this.data.min_values = minMaxValidator.parse(minValues);
    return this;
  }
  setMaxValues(maxValues) {
    this.data.max_values = minMaxValidator.parse(maxValues);
    return this;
  }
  setCustomId(customId) {
    this.data.custom_id = customIdValidator.parse(customId);
    return this;
  }
  setDisabled(disabled = true) {
    this.data.disabled = disabledValidator.parse(disabled);
    return this;
  }
  toJSON() {
    customIdValidator.parse(this.data.custom_id);
    return {
      ...this.data
    };
  }
};
__name(BaseSelectMenuBuilder, "BaseSelectMenuBuilder");

// src/components/selectMenu/ChannelSelectMenu.ts
var ChannelSelectMenuBuilder = class extends BaseSelectMenuBuilder {
  constructor(data) {
    super({ ...data, type: ComponentType2.ChannelSelect });
  }
  addChannelTypes(...types) {
    types = normalizeArray(types);
    this.data.channel_types ??= [];
    this.data.channel_types.push(...channelTypesValidator.parse(types));
    return this;
  }
  setChannelTypes(...types) {
    types = normalizeArray(types);
    this.data.channel_types ??= [];
    this.data.channel_types.splice(0, this.data.channel_types.length, ...channelTypesValidator.parse(types));
    return this;
  }
  toJSON() {
    customIdValidator.parse(this.data.custom_id);
    return {
      ...this.data
    };
  }
};
__name(ChannelSelectMenuBuilder, "ChannelSelectMenuBuilder");

// src/components/selectMenu/MentionableSelectMenu.ts
import { ComponentType as ComponentType3 } from "discord-api-types/v10";
var MentionableSelectMenuBuilder = class extends BaseSelectMenuBuilder {
  constructor(data) {
    super({ ...data, type: ComponentType3.MentionableSelect });
  }
};
__name(MentionableSelectMenuBuilder, "MentionableSelectMenuBuilder");

// src/components/selectMenu/RoleSelectMenu.ts
import { ComponentType as ComponentType4 } from "discord-api-types/v10";
var RoleSelectMenuBuilder = class extends BaseSelectMenuBuilder {
  constructor(data) {
    super({ ...data, type: ComponentType4.RoleSelect });
  }
};
__name(RoleSelectMenuBuilder, "RoleSelectMenuBuilder");

// src/components/selectMenu/StringSelectMenu.ts
import { ComponentType as ComponentType5 } from "discord-api-types/v10";
var StringSelectMenuBuilder = class extends BaseSelectMenuBuilder {
  options;
  constructor(data) {
    const { options, ...initData } = data ?? {};
    super({ ...initData, type: ComponentType5.StringSelect });
    this.options = options?.map((option) => new StringSelectMenuOptionBuilder(option)) ?? [];
  }
  addOptions(...options) {
    options = normalizeArray(options);
    optionsLengthValidator.parse(this.options.length + options.length);
    this.options.push(
      ...options.map(
        (option) => option instanceof StringSelectMenuOptionBuilder ? option : new StringSelectMenuOptionBuilder(jsonOptionValidator.parse(option))
      )
    );
    return this;
  }
  setOptions(...options) {
    options = normalizeArray(options);
    optionsLengthValidator.parse(options.length);
    this.options.splice(
      0,
      this.options.length,
      ...options.map(
        (option) => option instanceof StringSelectMenuOptionBuilder ? option : new StringSelectMenuOptionBuilder(jsonOptionValidator.parse(option))
      )
    );
    return this;
  }
  toJSON() {
    validateRequiredSelectMenuParameters(this.options, this.data.custom_id);
    return {
      ...this.data,
      options: this.options.map((option) => option.toJSON())
    };
  }
};
__name(StringSelectMenuBuilder, "StringSelectMenuBuilder");

// src/components/selectMenu/UserSelectMenu.ts
import { ComponentType as ComponentType6 } from "discord-api-types/v10";
var UserSelectMenuBuilder = class extends BaseSelectMenuBuilder {
  constructor(data) {
    super({ ...data, type: ComponentType6.UserSelect });
  }
};
__name(UserSelectMenuBuilder, "UserSelectMenuBuilder");

// src/components/textInput/TextInput.ts
import { isJSONEncodable } from "@discordjs/util";
import { ComponentType as ComponentType7 } from "discord-api-types/v10";
import isEqual from "fast-deep-equal";

// src/components/textInput/Assertions.ts
var Assertions_exports3 = {};
__export(Assertions_exports3, {
  labelValidator: () => labelValidator,
  maxLengthValidator: () => maxLengthValidator,
  minLengthValidator: () => minLengthValidator,
  placeholderValidator: () => placeholderValidator2,
  requiredValidator: () => requiredValidator,
  textInputStyleValidator: () => textInputStyleValidator,
  validateRequiredParameters: () => validateRequiredParameters,
  valueValidator: () => valueValidator
});
import { s as s3 } from "@sapphire/shapeshift";
import { TextInputStyle } from "discord-api-types/v10";
var textInputStyleValidator = s3.nativeEnum(TextInputStyle);
var minLengthValidator = s3.number.int.greaterThanOrEqual(0).lessThanOrEqual(4e3).setValidationEnabled(isValidationEnabled);
var maxLengthValidator = s3.number.int.greaterThanOrEqual(1).lessThanOrEqual(4e3).setValidationEnabled(isValidationEnabled);
var requiredValidator = s3.boolean;
var valueValidator = s3.string.lengthLessThanOrEqual(4e3).setValidationEnabled(isValidationEnabled);
var placeholderValidator2 = s3.string.lengthLessThanOrEqual(100).setValidationEnabled(isValidationEnabled);
var labelValidator = s3.string.lengthGreaterThanOrEqual(1).lengthLessThanOrEqual(45).setValidationEnabled(isValidationEnabled);
function validateRequiredParameters(customId, style, label) {
  customIdValidator.parse(customId);
  textInputStyleValidator.parse(style);
  labelValidator.parse(label);
}
__name(validateRequiredParameters, "validateRequiredParameters");

// src/components/textInput/TextInput.ts
var TextInputBuilder = class extends ComponentBuilder {
  constructor(data) {
    super({ type: ComponentType7.TextInput, ...data });
  }
  setCustomId(customId) {
    this.data.custom_id = customIdValidator.parse(customId);
    return this;
  }
  setLabel(label) {
    this.data.label = labelValidator.parse(label);
    return this;
  }
  setStyle(style) {
    this.data.style = textInputStyleValidator.parse(style);
    return this;
  }
  setMinLength(minLength) {
    this.data.min_length = minLengthValidator.parse(minLength);
    return this;
  }
  setMaxLength(maxLength) {
    this.data.max_length = maxLengthValidator.parse(maxLength);
    return this;
  }
  setPlaceholder(placeholder) {
    this.data.placeholder = placeholderValidator2.parse(placeholder);
    return this;
  }
  setValue(value) {
    this.data.value = valueValidator.parse(value);
    return this;
  }
  setRequired(required = true) {
    this.data.required = requiredValidator.parse(required);
    return this;
  }
  toJSON() {
    validateRequiredParameters(this.data.custom_id, this.data.style, this.data.label);
    return {
      ...this.data
    };
  }
  equals(other) {
    if (isJSONEncodable(other)) {
      return isEqual(other.toJSON(), this.data);
    }
    return isEqual(other, this.data);
  }
};
__name(TextInputBuilder, "TextInputBuilder");

// src/components/Components.ts
function createComponentBuilder(data) {
  if (data instanceof ComponentBuilder) {
    return data;
  }
  switch (data.type) {
    case ComponentType8.ActionRow:
      return new ActionRowBuilder(data);
    case ComponentType8.Button:
      return new ButtonBuilder(data);
    case ComponentType8.StringSelect:
      return new StringSelectMenuBuilder(data);
    case ComponentType8.TextInput:
      return new TextInputBuilder(data);
    case ComponentType8.UserSelect:
      return new UserSelectMenuBuilder(data);
    case ComponentType8.RoleSelect:
      return new RoleSelectMenuBuilder(data);
    case ComponentType8.MentionableSelect:
      return new MentionableSelectMenuBuilder(data);
    case ComponentType8.ChannelSelect:
      return new ChannelSelectMenuBuilder(data);
    default:
      throw new Error(`Cannot properly serialize component type: ${data.type}`);
  }
}
__name(createComponentBuilder, "createComponentBuilder");

// src/components/ActionRow.ts
var ActionRowBuilder = class extends ComponentBuilder {
  components;
  constructor({ components, ...data } = {}) {
    super({ type: ComponentType9.ActionRow, ...data });
    this.components = components?.map((component) => createComponentBuilder(component)) ?? [];
  }
  addComponents(...components) {
    this.components.push(...normalizeArray(components));
    return this;
  }
  setComponents(...components) {
    this.components.splice(0, this.components.length, ...normalizeArray(components));
    return this;
  }
  toJSON() {
    return {
      ...this.data,
      components: this.components.map((component) => component.toJSON())
    };
  }
};
__name(ActionRowBuilder, "ActionRowBuilder");

// src/interactions/modals/Assertions.ts
var Assertions_exports4 = {};
__export(Assertions_exports4, {
  componentsValidator: () => componentsValidator,
  titleValidator: () => titleValidator,
  validateRequiredParameters: () => validateRequiredParameters2
});
import { s as s4 } from "@sapphire/shapeshift";
var titleValidator = s4.string.lengthGreaterThanOrEqual(1).lengthLessThanOrEqual(45).setValidationEnabled(isValidationEnabled);
var componentsValidator = s4.instance(ActionRowBuilder).array.lengthGreaterThanOrEqual(1).setValidationEnabled(isValidationEnabled);
function validateRequiredParameters2(customId, title, components) {
  customIdValidator.parse(customId);
  titleValidator.parse(title);
  componentsValidator.parse(components);
}
__name(validateRequiredParameters2, "validateRequiredParameters");

// src/interactions/modals/Modal.ts
var ModalBuilder = class {
  data;
  components = [];
  constructor({ components, ...data } = {}) {
    this.data = { ...data };
    this.components = components?.map((component) => createComponentBuilder(component)) ?? [];
  }
  setTitle(title) {
    this.data.title = titleValidator.parse(title);
    return this;
  }
  setCustomId(customId) {
    this.data.custom_id = customIdValidator.parse(customId);
    return this;
  }
  addComponents(...components) {
    this.components.push(
      ...normalizeArray(components).map(
        (component) => component instanceof ActionRowBuilder ? component : new ActionRowBuilder(component)
      )
    );
    return this;
  }
  setComponents(...components) {
    this.components.splice(0, this.components.length, ...normalizeArray(components));
    return this;
  }
  toJSON() {
    validateRequiredParameters2(this.data.custom_id, this.data.title, this.components);
    return {
      ...this.data,
      components: this.components.map((component) => component.toJSON())
    };
  }
};
__name(ModalBuilder, "ModalBuilder");

// src/interactions/slashCommands/Assertions.ts
var Assertions_exports5 = {};
__export(Assertions_exports5, {
  assertReturnOfBuilder: () => assertReturnOfBuilder,
  localizationMapPredicate: () => localizationMapPredicate,
  validateChoicesLength: () => validateChoicesLength,
  validateDMPermission: () => validateDMPermission,
  validateDefaultMemberPermissions: () => validateDefaultMemberPermissions,
  validateDefaultPermission: () => validateDefaultPermission,
  validateDescription: () => validateDescription,
  validateLocale: () => validateLocale,
  validateLocalizationMap: () => validateLocalizationMap,
  validateMaxOptionsLength: () => validateMaxOptionsLength,
  validateName: () => validateName,
  validateRequired: () => validateRequired,
  validateRequiredParameters: () => validateRequiredParameters3
});
import { s as s5 } from "@sapphire/shapeshift";
import { Locale } from "discord-api-types/v10";
var namePredicate = s5.string.lengthGreaterThanOrEqual(1).lengthLessThanOrEqual(32).regex(/^[\p{Ll}\p{Lm}\p{Lo}\p{N}\p{sc=Devanagari}\p{sc=Thai}_-]+$/u).setValidationEnabled(isValidationEnabled);
function validateName(name) {
  namePredicate.parse(name);
}
__name(validateName, "validateName");
var descriptionPredicate2 = s5.string.lengthGreaterThanOrEqual(1).lengthLessThanOrEqual(100).setValidationEnabled(isValidationEnabled);
var localePredicate = s5.nativeEnum(Locale);
function validateDescription(description) {
  descriptionPredicate2.parse(description);
}
__name(validateDescription, "validateDescription");
var maxArrayLengthPredicate = s5.unknown.array.lengthLessThanOrEqual(25).setValidationEnabled(isValidationEnabled);
function validateLocale(locale) {
  return localePredicate.parse(locale);
}
__name(validateLocale, "validateLocale");
function validateMaxOptionsLength(options) {
  maxArrayLengthPredicate.parse(options);
}
__name(validateMaxOptionsLength, "validateMaxOptionsLength");
function validateRequiredParameters3(name, description, options) {
  validateName(name);
  validateDescription(description);
  validateMaxOptionsLength(options);
}
__name(validateRequiredParameters3, "validateRequiredParameters");
var booleanPredicate = s5.boolean;
function validateDefaultPermission(value) {
  booleanPredicate.parse(value);
}
__name(validateDefaultPermission, "validateDefaultPermission");
function validateRequired(required) {
  booleanPredicate.parse(required);
}
__name(validateRequired, "validateRequired");
var choicesLengthPredicate = s5.number.lessThanOrEqual(25).setValidationEnabled(isValidationEnabled);
function validateChoicesLength(amountAdding, choices) {
  choicesLengthPredicate.parse((choices?.length ?? 0) + amountAdding);
}
__name(validateChoicesLength, "validateChoicesLength");
function assertReturnOfBuilder(input, ExpectedInstanceOf) {
  s5.instance(ExpectedInstanceOf).parse(input);
}
__name(assertReturnOfBuilder, "assertReturnOfBuilder");
var localizationMapPredicate = s5.object(Object.fromEntries(Object.values(Locale).map((locale) => [locale, s5.string.nullish]))).strict.nullish.setValidationEnabled(isValidationEnabled);
function validateLocalizationMap(value) {
  localizationMapPredicate.parse(value);
}
__name(validateLocalizationMap, "validateLocalizationMap");
var dmPermissionPredicate = s5.boolean.nullish;
function validateDMPermission(value) {
  dmPermissionPredicate.parse(value);
}
__name(validateDMPermission, "validateDMPermission");
var memberPermissionPredicate = s5.union(
  s5.bigint.transform((value) => value.toString()),
  s5.number.safeInt.transform((value) => value.toString()),
  s5.string.regex(/^\d+$/)
).nullish;
function validateDefaultMemberPermissions(permissions) {
  return memberPermissionPredicate.parse(permissions);
}
__name(validateDefaultMemberPermissions, "validateDefaultMemberPermissions");

// src/interactions/slashCommands/SlashCommandBuilder.ts
import { mix as mix6 } from "ts-mixer";

// src/interactions/slashCommands/SlashCommandSubcommands.ts
import {
  ApplicationCommandOptionType as ApplicationCommandOptionType11
} from "discord-api-types/v10";
import { mix as mix5 } from "ts-mixer";

// src/interactions/slashCommands/mixins/NameAndDescription.ts
var SharedNameAndDescription = class {
  name;
  name_localizations;
  description;
  description_localizations;
  setName(name) {
    validateName(name);
    Reflect.set(this, "name", name);
    return this;
  }
  setDescription(description) {
    validateDescription(description);
    Reflect.set(this, "description", description);
    return this;
  }
  setNameLocalization(locale, localizedName) {
    if (!this.name_localizations) {
      Reflect.set(this, "name_localizations", {});
    }
    const parsedLocale = validateLocale(locale);
    if (localizedName === null) {
      this.name_localizations[parsedLocale] = null;
      return this;
    }
    validateName(localizedName);
    this.name_localizations[parsedLocale] = localizedName;
    return this;
  }
  setNameLocalizations(localizedNames) {
    if (localizedNames === null) {
      Reflect.set(this, "name_localizations", null);
      return this;
    }
    Reflect.set(this, "name_localizations", {});
    for (const args of Object.entries(localizedNames)) {
      this.setNameLocalization(...args);
    }
    return this;
  }
  setDescriptionLocalization(locale, localizedDescription) {
    if (!this.description_localizations) {
      Reflect.set(this, "description_localizations", {});
    }
    const parsedLocale = validateLocale(locale);
    if (localizedDescription === null) {
      this.description_localizations[parsedLocale] = null;
      return this;
    }
    validateDescription(localizedDescription);
    this.description_localizations[parsedLocale] = localizedDescription;
    return this;
  }
  setDescriptionLocalizations(localizedDescriptions) {
    if (localizedDescriptions === null) {
      Reflect.set(this, "description_localizations", null);
      return this;
    }
    Reflect.set(this, "description_localizations", {});
    for (const args of Object.entries(localizedDescriptions)) {
      this.setDescriptionLocalization(...args);
    }
    return this;
  }
};
__name(SharedNameAndDescription, "SharedNameAndDescription");

// src/interactions/slashCommands/options/attachment.ts
import { ApplicationCommandOptionType } from "discord-api-types/v10";

// src/interactions/slashCommands/mixins/ApplicationCommandOptionBase.ts
var ApplicationCommandOptionBase = class extends SharedNameAndDescription {
  required = false;
  setRequired(required) {
    validateRequired(required);
    Reflect.set(this, "required", required);
    return this;
  }
  runRequiredValidations() {
    validateRequiredParameters3(this.name, this.description, []);
    validateLocalizationMap(this.name_localizations);
    validateLocalizationMap(this.description_localizations);
    validateRequired(this.required);
  }
};
__name(ApplicationCommandOptionBase, "ApplicationCommandOptionBase");

// src/interactions/slashCommands/options/attachment.ts
var SlashCommandAttachmentOption = class extends ApplicationCommandOptionBase {
  type = ApplicationCommandOptionType.Attachment;
  toJSON() {
    this.runRequiredValidations();
    return { ...this };
  }
};
__name(SlashCommandAttachmentOption, "SlashCommandAttachmentOption");

// src/interactions/slashCommands/options/boolean.ts
import { ApplicationCommandOptionType as ApplicationCommandOptionType2 } from "discord-api-types/v10";
var SlashCommandBooleanOption = class extends ApplicationCommandOptionBase {
  type = ApplicationCommandOptionType2.Boolean;
  toJSON() {
    this.runRequiredValidations();
    return { ...this };
  }
};
__name(SlashCommandBooleanOption, "SlashCommandBooleanOption");

// src/interactions/slashCommands/options/channel.ts
import { ApplicationCommandOptionType as ApplicationCommandOptionType3 } from "discord-api-types/v10";
import { mix } from "ts-mixer";

// src/interactions/slashCommands/mixins/ApplicationCommandOptionChannelTypesMixin.ts
import { s as s6 } from "@sapphire/shapeshift";
import { ChannelType as ChannelType2 } from "discord-api-types/v10";
var allowedChannelTypes = [
  ChannelType2.GuildText,
  ChannelType2.GuildVoice,
  ChannelType2.GuildCategory,
  ChannelType2.GuildAnnouncement,
  ChannelType2.AnnouncementThread,
  ChannelType2.PublicThread,
  ChannelType2.PrivateThread,
  ChannelType2.GuildStageVoice,
  ChannelType2.GuildForum
];
var channelTypesPredicate = s6.array(s6.union(...allowedChannelTypes.map((type) => s6.literal(type))));
var ApplicationCommandOptionChannelTypesMixin = class {
  channel_types;
  addChannelTypes(...channelTypes) {
    if (this.channel_types === void 0) {
      Reflect.set(this, "channel_types", []);
    }
    this.channel_types.push(...channelTypesPredicate.parse(channelTypes));
    return this;
  }
};
__name(ApplicationCommandOptionChannelTypesMixin, "ApplicationCommandOptionChannelTypesMixin");

// src/interactions/slashCommands/options/channel.ts
var SlashCommandChannelOption = class extends ApplicationCommandOptionBase {
  type = ApplicationCommandOptionType3.Channel;
  toJSON() {
    this.runRequiredValidations();
    return { ...this };
  }
};
__name(SlashCommandChannelOption, "SlashCommandChannelOption");
SlashCommandChannelOption = __decorateClass([
  mix(ApplicationCommandOptionChannelTypesMixin)
], SlashCommandChannelOption);

// src/interactions/slashCommands/options/integer.ts
import { s as s8 } from "@sapphire/shapeshift";
import { ApplicationCommandOptionType as ApplicationCommandOptionType5 } from "discord-api-types/v10";
import { mix as mix2 } from "ts-mixer";

// src/interactions/slashCommands/mixins/ApplicationCommandNumericOptionMinMaxValueMixin.ts
var ApplicationCommandNumericOptionMinMaxValueMixin = class {
  max_value;
  min_value;
};
__name(ApplicationCommandNumericOptionMinMaxValueMixin, "ApplicationCommandNumericOptionMinMaxValueMixin");

// src/interactions/slashCommands/mixins/ApplicationCommandOptionWithChoicesAndAutocompleteMixin.ts
import { s as s7 } from "@sapphire/shapeshift";
import { ApplicationCommandOptionType as ApplicationCommandOptionType4 } from "discord-api-types/v10";
var stringPredicate = s7.string.lengthGreaterThanOrEqual(1).lengthLessThanOrEqual(100);
var numberPredicate = s7.number.greaterThan(Number.NEGATIVE_INFINITY).lessThan(Number.POSITIVE_INFINITY);
var choicesPredicate = s7.object({
  name: stringPredicate,
  name_localizations: localizationMapPredicate,
  value: s7.union(stringPredicate, numberPredicate)
}).array;
var booleanPredicate2 = s7.boolean;
var ApplicationCommandOptionWithChoicesAndAutocompleteMixin = class {
  choices;
  autocomplete;
  type;
  addChoices(...choices) {
    if (choices.length > 0 && this.autocomplete) {
      throw new RangeError("Autocomplete and choices are mutually exclusive to each other.");
    }
    choicesPredicate.parse(choices);
    if (this.choices === void 0) {
      Reflect.set(this, "choices", []);
    }
    validateChoicesLength(choices.length, this.choices);
    for (const { name, name_localizations, value } of choices) {
      if (this.type === ApplicationCommandOptionType4.String) {
        stringPredicate.parse(value);
      } else {
        numberPredicate.parse(value);
      }
      this.choices.push({ name, name_localizations, value });
    }
    return this;
  }
  setChoices(...choices) {
    if (choices.length > 0 && this.autocomplete) {
      throw new RangeError("Autocomplete and choices are mutually exclusive to each other.");
    }
    choicesPredicate.parse(choices);
    Reflect.set(this, "choices", []);
    this.addChoices(...choices);
    return this;
  }
  setAutocomplete(autocomplete) {
    booleanPredicate2.parse(autocomplete);
    if (autocomplete && Array.isArray(this.choices) && this.choices.length > 0) {
      throw new RangeError("Autocomplete and choices are mutually exclusive to each other.");
    }
    Reflect.set(this, "autocomplete", autocomplete);
    return this;
  }
};
__name(ApplicationCommandOptionWithChoicesAndAutocompleteMixin, "ApplicationCommandOptionWithChoicesAndAutocompleteMixin");

// src/interactions/slashCommands/options/integer.ts
var numberValidator = s8.number.int;
var SlashCommandIntegerOption = class extends ApplicationCommandOptionBase {
  type = ApplicationCommandOptionType5.Integer;
  setMaxValue(max) {
    numberValidator.parse(max);
    Reflect.set(this, "max_value", max);
    return this;
  }
  setMinValue(min) {
    numberValidator.parse(min);
    Reflect.set(this, "min_value", min);
    return this;
  }
  toJSON() {
    this.runRequiredValidations();
    if (this.autocomplete && Array.isArray(this.choices) && this.choices.length > 0) {
      throw new RangeError("Autocomplete and choices are mutually exclusive to each other.");
    }
    return { ...this };
  }
};
__name(SlashCommandIntegerOption, "SlashCommandIntegerOption");
SlashCommandIntegerOption = __decorateClass([
  mix2(ApplicationCommandNumericOptionMinMaxValueMixin, ApplicationCommandOptionWithChoicesAndAutocompleteMixin)
], SlashCommandIntegerOption);

// src/interactions/slashCommands/options/mentionable.ts
import { ApplicationCommandOptionType as ApplicationCommandOptionType6 } from "discord-api-types/v10";
var SlashCommandMentionableOption = class extends ApplicationCommandOptionBase {
  type = ApplicationCommandOptionType6.Mentionable;
  toJSON() {
    this.runRequiredValidations();
    return { ...this };
  }
};
__name(SlashCommandMentionableOption, "SlashCommandMentionableOption");

// src/interactions/slashCommands/options/number.ts
import { s as s9 } from "@sapphire/shapeshift";
import { ApplicationCommandOptionType as ApplicationCommandOptionType7 } from "discord-api-types/v10";
import { mix as mix3 } from "ts-mixer";
var numberValidator2 = s9.number;
var SlashCommandNumberOption = class extends ApplicationCommandOptionBase {
  type = ApplicationCommandOptionType7.Number;
  setMaxValue(max) {
    numberValidator2.parse(max);
    Reflect.set(this, "max_value", max);
    return this;
  }
  setMinValue(min) {
    numberValidator2.parse(min);
    Reflect.set(this, "min_value", min);
    return this;
  }
  toJSON() {
    this.runRequiredValidations();
    if (this.autocomplete && Array.isArray(this.choices) && this.choices.length > 0) {
      throw new RangeError("Autocomplete and choices are mutually exclusive to each other.");
    }
    return { ...this };
  }
};
__name(SlashCommandNumberOption, "SlashCommandNumberOption");
SlashCommandNumberOption = __decorateClass([
  mix3(ApplicationCommandNumericOptionMinMaxValueMixin, ApplicationCommandOptionWithChoicesAndAutocompleteMixin)
], SlashCommandNumberOption);

// src/interactions/slashCommands/options/role.ts
import { ApplicationCommandOptionType as ApplicationCommandOptionType8 } from "discord-api-types/v10";
var SlashCommandRoleOption = class extends ApplicationCommandOptionBase {
  type = ApplicationCommandOptionType8.Role;
  toJSON() {
    this.runRequiredValidations();
    return { ...this };
  }
};
__name(SlashCommandRoleOption, "SlashCommandRoleOption");

// src/interactions/slashCommands/options/string.ts
import { s as s10 } from "@sapphire/shapeshift";
import { ApplicationCommandOptionType as ApplicationCommandOptionType9 } from "discord-api-types/v10";
import { mix as mix4 } from "ts-mixer";
var minLengthValidator2 = s10.number.greaterThanOrEqual(0).lessThanOrEqual(6e3);
var maxLengthValidator2 = s10.number.greaterThanOrEqual(1).lessThanOrEqual(6e3);
var SlashCommandStringOption = class extends ApplicationCommandOptionBase {
  type = ApplicationCommandOptionType9.String;
  max_length;
  min_length;
  setMaxLength(max) {
    maxLengthValidator2.parse(max);
    Reflect.set(this, "max_length", max);
    return this;
  }
  setMinLength(min) {
    minLengthValidator2.parse(min);
    Reflect.set(this, "min_length", min);
    return this;
  }
  toJSON() {
    this.runRequiredValidations();
    if (this.autocomplete && Array.isArray(this.choices) && this.choices.length > 0) {
      throw new RangeError("Autocomplete and choices are mutually exclusive to each other.");
    }
    return { ...this };
  }
};
__name(SlashCommandStringOption, "SlashCommandStringOption");
SlashCommandStringOption = __decorateClass([
  mix4(ApplicationCommandOptionWithChoicesAndAutocompleteMixin)
], SlashCommandStringOption);

// src/interactions/slashCommands/options/user.ts
import { ApplicationCommandOptionType as ApplicationCommandOptionType10 } from "discord-api-types/v10";
var SlashCommandUserOption = class extends ApplicationCommandOptionBase {
  type = ApplicationCommandOptionType10.User;
  toJSON() {
    this.runRequiredValidations();
    return { ...this };
  }
};
__name(SlashCommandUserOption, "SlashCommandUserOption");

// src/interactions/slashCommands/mixins/SharedSlashCommandOptions.ts
var SharedSlashCommandOptions = class {
  options;
  addBooleanOption(input) {
    return this._sharedAddOptionMethod(input, SlashCommandBooleanOption);
  }
  addUserOption(input) {
    return this._sharedAddOptionMethod(input, SlashCommandUserOption);
  }
  addChannelOption(input) {
    return this._sharedAddOptionMethod(input, SlashCommandChannelOption);
  }
  addRoleOption(input) {
    return this._sharedAddOptionMethod(input, SlashCommandRoleOption);
  }
  addAttachmentOption(input) {
    return this._sharedAddOptionMethod(input, SlashCommandAttachmentOption);
  }
  addMentionableOption(input) {
    return this._sharedAddOptionMethod(input, SlashCommandMentionableOption);
  }
  addStringOption(input) {
    return this._sharedAddOptionMethod(input, SlashCommandStringOption);
  }
  addIntegerOption(input) {
    return this._sharedAddOptionMethod(input, SlashCommandIntegerOption);
  }
  addNumberOption(input) {
    return this._sharedAddOptionMethod(input, SlashCommandNumberOption);
  }
  _sharedAddOptionMethod(input, Instance) {
    const { options } = this;
    validateMaxOptionsLength(options);
    const result = typeof input === "function" ? input(new Instance()) : input;
    assertReturnOfBuilder(result, Instance);
    options.push(result);
    return this;
  }
};
__name(SharedSlashCommandOptions, "SharedSlashCommandOptions");

// src/interactions/slashCommands/SlashCommandSubcommands.ts
var SlashCommandSubcommandGroupBuilder = class {
  name = void 0;
  description = void 0;
  options = [];
  addSubcommand(input) {
    const { options } = this;
    validateMaxOptionsLength(options);
    const result = typeof input === "function" ? input(new SlashCommandSubcommandBuilder()) : input;
    assertReturnOfBuilder(result, SlashCommandSubcommandBuilder);
    options.push(result);
    return this;
  }
  toJSON() {
    validateRequiredParameters3(this.name, this.description, this.options);
    return {
      type: ApplicationCommandOptionType11.SubcommandGroup,
      name: this.name,
      name_localizations: this.name_localizations,
      description: this.description,
      description_localizations: this.description_localizations,
      options: this.options.map((option) => option.toJSON())
    };
  }
};
__name(SlashCommandSubcommandGroupBuilder, "SlashCommandSubcommandGroupBuilder");
SlashCommandSubcommandGroupBuilder = __decorateClass([
  mix5(SharedNameAndDescription)
], SlashCommandSubcommandGroupBuilder);
var SlashCommandSubcommandBuilder = class {
  name = void 0;
  description = void 0;
  options = [];
  toJSON() {
    validateRequiredParameters3(this.name, this.description, this.options);
    return {
      type: ApplicationCommandOptionType11.Subcommand,
      name: this.name,
      name_localizations: this.name_localizations,
      description: this.description,
      description_localizations: this.description_localizations,
      options: this.options.map((option) => option.toJSON())
    };
  }
};
__name(SlashCommandSubcommandBuilder, "SlashCommandSubcommandBuilder");
SlashCommandSubcommandBuilder = __decorateClass([
  mix5(SharedNameAndDescription, SharedSlashCommandOptions)
], SlashCommandSubcommandBuilder);

// src/interactions/slashCommands/SlashCommandBuilder.ts
var SlashCommandBuilder = class {
  name = void 0;
  name_localizations;
  description = void 0;
  description_localizations;
  options = [];
  default_permission = void 0;
  default_member_permissions = void 0;
  dm_permission = void 0;
  toJSON() {
    validateRequiredParameters3(this.name, this.description, this.options);
    validateLocalizationMap(this.name_localizations);
    validateLocalizationMap(this.description_localizations);
    return {
      ...this,
      options: this.options.map((option) => option.toJSON())
    };
  }
  setDefaultPermission(value) {
    validateDefaultPermission(value);
    Reflect.set(this, "default_permission", value);
    return this;
  }
  setDefaultMemberPermissions(permissions) {
    const permissionValue = validateDefaultMemberPermissions(permissions);
    Reflect.set(this, "default_member_permissions", permissionValue);
    return this;
  }
  setDMPermission(enabled) {
    validateDMPermission(enabled);
    Reflect.set(this, "dm_permission", enabled);
    return this;
  }
  addSubcommandGroup(input) {
    const { options } = this;
    validateMaxOptionsLength(options);
    const result = typeof input === "function" ? input(new SlashCommandSubcommandGroupBuilder()) : input;
    assertReturnOfBuilder(result, SlashCommandSubcommandGroupBuilder);
    options.push(result);
    return this;
  }
  addSubcommand(input) {
    const { options } = this;
    validateMaxOptionsLength(options);
    const result = typeof input === "function" ? input(new SlashCommandSubcommandBuilder()) : input;
    assertReturnOfBuilder(result, SlashCommandSubcommandBuilder);
    options.push(result);
    return this;
  }
};
__name(SlashCommandBuilder, "SlashCommandBuilder");
SlashCommandBuilder = __decorateClass([
  mix6(SharedSlashCommandOptions, SharedNameAndDescription)
], SlashCommandBuilder);

// src/interactions/contextMenuCommands/Assertions.ts
var Assertions_exports6 = {};
__export(Assertions_exports6, {
  validateDMPermission: () => validateDMPermission2,
  validateDefaultMemberPermissions: () => validateDefaultMemberPermissions2,
  validateDefaultPermission: () => validateDefaultPermission2,
  validateName: () => validateName2,
  validateRequiredParameters: () => validateRequiredParameters4,
  validateType: () => validateType
});
import { s as s11 } from "@sapphire/shapeshift";
import { ApplicationCommandType } from "discord-api-types/v10";
var namePredicate2 = s11.string.lengthGreaterThanOrEqual(1).lengthLessThanOrEqual(32).regex(/^( *[\p{P}\p{L}\p{N}\p{sc=Devanagari}\p{sc=Thai}]+ *)+$/u).setValidationEnabled(isValidationEnabled);
var typePredicate = s11.union(s11.literal(ApplicationCommandType.User), s11.literal(ApplicationCommandType.Message)).setValidationEnabled(isValidationEnabled);
var booleanPredicate3 = s11.boolean;
function validateDefaultPermission2(value) {
  booleanPredicate3.parse(value);
}
__name(validateDefaultPermission2, "validateDefaultPermission");
function validateName2(name) {
  namePredicate2.parse(name);
}
__name(validateName2, "validateName");
function validateType(type) {
  typePredicate.parse(type);
}
__name(validateType, "validateType");
function validateRequiredParameters4(name, type) {
  validateName2(name);
  validateType(type);
}
__name(validateRequiredParameters4, "validateRequiredParameters");
var dmPermissionPredicate2 = s11.boolean.nullish;
function validateDMPermission2(value) {
  dmPermissionPredicate2.parse(value);
}
__name(validateDMPermission2, "validateDMPermission");
var memberPermissionPredicate2 = s11.union(
  s11.bigint.transform((value) => value.toString()),
  s11.number.safeInt.transform((value) => value.toString()),
  s11.string.regex(/^\d+$/)
).nullish;
function validateDefaultMemberPermissions2(permissions) {
  return memberPermissionPredicate2.parse(permissions);
}
__name(validateDefaultMemberPermissions2, "validateDefaultMemberPermissions");

// src/interactions/contextMenuCommands/ContextMenuCommandBuilder.ts
var ContextMenuCommandBuilder = class {
  name = void 0;
  name_localizations;
  type = void 0;
  default_permission = void 0;
  default_member_permissions = void 0;
  dm_permission = void 0;
  setName(name) {
    validateName2(name);
    Reflect.set(this, "name", name);
    return this;
  }
  setType(type) {
    validateType(type);
    Reflect.set(this, "type", type);
    return this;
  }
  setDefaultPermission(value) {
    validateDefaultPermission2(value);
    Reflect.set(this, "default_permission", value);
    return this;
  }
  setDefaultMemberPermissions(permissions) {
    const permissionValue = validateDefaultMemberPermissions2(permissions);
    Reflect.set(this, "default_member_permissions", permissionValue);
    return this;
  }
  setDMPermission(enabled) {
    validateDMPermission2(enabled);
    Reflect.set(this, "dm_permission", enabled);
    return this;
  }
  setNameLocalization(locale, localizedName) {
    if (!this.name_localizations) {
      Reflect.set(this, "name_localizations", {});
    }
    const parsedLocale = validateLocale(locale);
    if (localizedName === null) {
      this.name_localizations[parsedLocale] = null;
      return this;
    }
    validateName2(localizedName);
    this.name_localizations[parsedLocale] = localizedName;
    return this;
  }
  setNameLocalizations(localizedNames) {
    if (localizedNames === null) {
      Reflect.set(this, "name_localizations", null);
      return this;
    }
    Reflect.set(this, "name_localizations", {});
    for (const args of Object.entries(localizedNames))
      this.setNameLocalization(...args);
    return this;
  }
  toJSON() {
    validateRequiredParameters4(this.name, this.type);
    validateLocalizationMap(this.name_localizations);
    return { ...this };
  }
};
__name(ContextMenuCommandBuilder, "ContextMenuCommandBuilder");

// src/util/componentUtil.ts
function embedLength(data) {
  return (data.title?.length ?? 0) + (data.description?.length ?? 0) + (data.fields?.reduce((prev, curr) => prev + curr.name.length + curr.value.length, 0) ?? 0) + (data.footer?.text.length ?? 0) + (data.author?.name.length ?? 0);
}
__name(embedLength, "embedLength");

// src/index.ts
export * from "@discordjs/util";
var version = "1.4.0";
export {
  ActionRowBuilder,
  ApplicationCommandNumericOptionMinMaxValueMixin,
  ApplicationCommandOptionBase,
  ApplicationCommandOptionChannelTypesMixin,
  ApplicationCommandOptionWithChoicesAndAutocompleteMixin,
  BaseSelectMenuBuilder,
  ButtonBuilder,
  ChannelSelectMenuBuilder,
  Assertions_exports2 as ComponentAssertions,
  ComponentBuilder,
  Assertions_exports6 as ContextMenuCommandAssertions,
  ContextMenuCommandBuilder,
  Assertions_exports as EmbedAssertions,
  EmbedBuilder,
  Faces,
  MentionableSelectMenuBuilder,
  Assertions_exports4 as ModalAssertions,
  ModalBuilder,
  RoleSelectMenuBuilder,
  StringSelectMenuBuilder as SelectMenuBuilder,
  StringSelectMenuOptionBuilder as SelectMenuOptionBuilder,
  SharedNameAndDescription,
  SharedSlashCommandOptions,
  Assertions_exports5 as SlashCommandAssertions,
  SlashCommandAttachmentOption,
  SlashCommandBooleanOption,
  SlashCommandBuilder,
  SlashCommandChannelOption,
  SlashCommandIntegerOption,
  SlashCommandMentionableOption,
  SlashCommandNumberOption,
  SlashCommandRoleOption,
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandGroupBuilder,
  SlashCommandUserOption,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  Assertions_exports3 as TextInputAssertions,
  TextInputBuilder,
  TimestampStyles,
  UserSelectMenuBuilder,
  blockQuote,
  bold,
  channelLink,
  channelMention,
  chatInputApplicationCommandMention,
  codeBlock,
  createComponentBuilder,
  disableValidators,
  embedLength,
  enableValidators,
  formatEmoji,
  hideLinkEmbed,
  hyperlink,
  inlineCode,
  isValidationEnabled,
  italic,
  messageLink,
  normalizeArray,
  quote,
  roleMention,
  spoiler,
  strikethrough,
  time,
  underscore,
  userMention,
  version
};
//# sourceMappingURL=index.mjs.map