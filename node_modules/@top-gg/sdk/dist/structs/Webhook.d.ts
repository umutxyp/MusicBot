import { Request, Response, NextFunction } from "express";
import { WebhookPayload } from "../typings";
export interface WebhookOptions {
    /**
     * Handles an error created by the function passed to Webhook.listener()
     * @default console.error
     */
    error?: (error: Error) => void | Promise<void>;
}
/**
 * Top.gg Webhook
 * @example
 * ```js
 * const express = require('express')
 * const { Webhook } = require(`@top-gg/sdk`)
 *
 * const app = express()
 * const wh = new Webhook('webhookauth123')
 *
 * app.post('/dblwebhook', wh.listener(vote => {
 *   // vote is your vote object e.g
 *   console.log(vote.user) // => 321714991050784770
 * }))
 *
 * app.listen(80)
 *
 * // In this situation, your TopGG Webhook dashboard should look like
 * // URL = http://your.server.ip:80/dblwebhook
 * // Authorization: webhookauth123
 * ```
 * @link {@link https://docs.top.gg/resources/webhooks/#schema | Webhook Data Schema}
 * @link {@link https://docs.top.gg/resources/webhoooks | Webhook Documentation}
 */
export declare class Webhook {
    private authorization?;
    options: WebhookOptions;
    /**
     * Create a new webhook client instance
     * @param authorization Webhook authorization to verify requests
     */
    constructor(authorization?: string | undefined, options?: WebhookOptions);
    private _formatIncoming;
    private _parseRequest;
    /**
     * Listening function for handling webhook requests
     * @example
     * ```js
     * app.post('/webhook', wh.listener((vote) => {
     *   console.log(vote.user) // => 395526710101278721
     * }))
     * ```
     * @param fn Vote handling function, this function can also throw an error to allow for the webhook to resend from Top.gg
     * @example
     * ```js
     * // Throwing an error to resend the webhook
     * app.post('/webhook/', wh.listener((vote) => {
     *   // for example, if your bot is offline, you should probably not handle votes and try again
     *   if (bot.offline) throw new Error('Bot offline')
     * }))
     * ```
     * @returns An express request handler
     */
    listener(fn: (payload: WebhookPayload, req?: Request, res?: Response, next?: NextFunction) => void | Promise<void>): (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Middleware function to pass to express, sets req.vote to the payload
     * @deprecated Use the new {@link Webhook.listener | .listener()} function
     * @example
     * ```js
     * app.post('/dblwebhook', wh.middleware(), (req, res) => {
     *   // req.vote is your payload e.g
     *   console.log(req.vote.user) // => 395526710101278721
     * })
     * ```
     */
    middleware(): (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
