import { Response } from "node-fetch";
/**
 * API Error
 */
export default class TopGGAPIError extends Error {
    /**
     * Possible response from Request
     */
    response?: Response;
    constructor(code: number, text: string, response: Response);
}
