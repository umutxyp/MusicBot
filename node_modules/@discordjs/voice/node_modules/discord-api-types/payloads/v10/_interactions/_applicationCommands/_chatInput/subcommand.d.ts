import type { APIApplicationCommandOptionBase } from './base';
import type { ApplicationCommandOptionType } from './shared';
import type { APIApplicationCommandBasicOption, APIApplicationCommandInteractionDataBasicOption } from '../chatInput';
export interface APIApplicationCommandSubcommandOption extends APIApplicationCommandOptionBase<ApplicationCommandOptionType.Subcommand> {
    options?: APIApplicationCommandBasicOption[];
}
export interface APIApplicationCommandInteractionDataSubcommandOption {
    name: string;
    type: ApplicationCommandOptionType.Subcommand;
    options?: APIApplicationCommandInteractionDataBasicOption[];
}
//# sourceMappingURL=subcommand.d.ts.map