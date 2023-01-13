import {assert} from "chai"
import "mocha"
import {soundcloud} from "./login"

describe("Me", async function() {
    it("should get activities", async function() {
        const response = await soundcloud.me.activities()
        assert(response.hasOwnProperty("collection"))
    })

    it("should get affiliated activities", async function() {
        const response = await soundcloud.me.activitiesAffiliated()
        assert(response.hasOwnProperty("collection"))
    })

    it("should get exclusive activities", async function() {
        const response = await soundcloud.me.activitiesExclusive()
        assert(response.hasOwnProperty("collection"))
    })

    it("should get own activities", async function() {
        const response = await soundcloud.me.activitiesOwn()
        assert(response.hasOwnProperty("collection"))
    })

    it("should get connections", async function() {
        const response = await soundcloud.me.connections()
        assert(typeof response !== "undefined")
    })

})
