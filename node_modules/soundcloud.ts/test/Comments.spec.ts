import {assert} from "chai"
import "mocha"
import {soundcloud} from "./login"

describe("Comments", async function() {
    it("should get a comment", async function() {
        const response = await soundcloud.comments.get(577904916)
        assert(response.hasOwnProperty("body"))
    })
})
