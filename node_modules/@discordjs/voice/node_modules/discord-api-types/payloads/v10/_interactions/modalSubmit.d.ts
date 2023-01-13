import type { APIActionRowComponent, APIModalActionRowComponent } from '../channel';
import type { APIBaseInteraction, APIDMInteractionWrapper, APIGuildInteractionWrapper, ComponentType, InteractionType } from '../index';
export interface ModalSubmitComponent {
    type: ComponentType;
    custom_id: string;
    value: string;
}
export interface ModalSubmitActionRowComponent extends Omit<APIActionRowComponent<APIModalActionRowComponent>, 'components'> {
    components: ModalSubmitComponent[];
}
export interface APIModalSubmission {
    /**
     * A developer-defined identifier for the component, max 100 characters
     */
    custom_id: string;
    /**
     * A list of child components
     */
    components?: ModalSubmitActionRowComponent[];
}
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 */
export declare type APIModalSubmitInteraction = APIBaseInteraction<InteractionType.ModalSubmit, APIModalSubmission> & Required<Pick<APIBaseInteraction<InteractionType.ModalSubmit, APIModalSubmission>, 'data'>>;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 */
export declare type APIModalSubmitDMInteraction = APIDMInteractionWrapper<APIModalSubmitInteraction>;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 */
export declare type APIModalSubmitGuildInteraction = APIGuildInteractionWrapper<APIModalSubmitInteraction>;
//# sourceMappingURL=modalSubmit.d.ts.map