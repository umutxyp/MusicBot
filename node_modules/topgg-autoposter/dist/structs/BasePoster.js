"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePoster = void 0;
const sdk_1 = require("@top-gg/sdk");
const typed_emitter_1 = require("@jpbberry/typed-emitter");
class BasePoster extends typed_emitter_1.EventEmitter {
    constructor(token, options) {
        var _a, _b, _c;
        super();
        this.options = options;
        this.started = false;
        if (!options)
            options = {};
        this.options = {
            interval: (_a = options.interval) !== null && _a !== void 0 ? _a : 1800000,
            postOnStart: (_b = options.postOnStart) !== null && _b !== void 0 ? _b : true,
            startPosting: (_c = options.startPosting) !== null && _c !== void 0 ? _c : true,
            sdk: options.sdk
        };
        if (this.options.interval < 900000) {
            throw new Error('Posting interval must be above 900000 (15 minutes)');
        }
        this.api = this.options.sdk || new sdk_1.Api(token);
    }
    async _binder(binds) {
        this.binds = binds;
        if (this.options.startPosting) {
            if (await this.binds.clientReady())
                this.start();
            else
                this.binds.waitForReady(() => {
                    this.start();
                });
        }
    }
    /**
     * Start the posting
     */
    start() {
        this.started = true;
        this._setupInterval();
    }
    /**
     * Stop the posting
     */
    stop() {
        this.started = false;
        clearInterval(this.interval);
        this.interval = null;
    }
    _setupInterval() {
        if (this.options.postOnStart) {
            setTimeout(() => {
                this.post();
            }, 5000);
        }
        this.interval = setInterval(async () => {
            if (!(await this.binds.clientReady()))
                return;
            this.post();
        }, this.options.interval);
    }
    async post() {
        this.api.postStats(await this.binds.getStats())
            .then((data) => this.emit('posted', data))
            .catch((err) => this.eventNames().includes('error')
            ? this.emit('error', err)
            : console.error(err));
    }
}
exports.BasePoster = BasePoster;
