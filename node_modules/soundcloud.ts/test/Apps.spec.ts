import {assert} from "chai"
import "mocha"
import {soundcloud} from "./login"

describe("Apps", async function() {
    it("should get apps", async function() {
        const response = await soundcloud.apps.get()
        assert(response[0].hasOwnProperty("creator"))
    })
})
