import {assert} from "chai"
import "mocha"
import {soundcloud} from "./login"

describe("Tracks", async function() {
    it("should get a track", async function() {
        const response = await soundcloud.tracks.get("https://soundcloud.com/tenpimusic/snowflake")
        assert(response.hasOwnProperty("description"))
    })

    it("should search tracks", async function() {
        const response = await soundcloud.tracks.search({q: "virtual riot"})
        assert(response[0].hasOwnProperty("description"))
    })

    it("should get track comments", async function() {
        const response = await soundcloud.tracks.comments("https://soundcloud.com/tenpimusic/snowflake")
        assert(response[0].hasOwnProperty("body"))
    })

    it("should get a comment", async function() {
        const response = await soundcloud.tracks.comment("https://soundcloud.com/tenpimusic/snowflake", 577938945)
        assert(response.hasOwnProperty("body"))
    })

    it("should get favoriters", async function() {
        const response = await soundcloud.tracks.favoriters("https://soundcloud.com/tenpimusic/kudasai")
        assert(response[0].hasOwnProperty("description"))
    })

    /* 401 Error - Possibly bug with soundcloud.
    it("should get a favoriter", async function() {
        const response = await soundcloud.tracks.favoriter("https://soundcloud.com/inf1n1temusic/inf1n1tea-konus-nova1", "tenpimusic")
        assert(response.hasOwnProperty("description"))
    })*/

    it("should get a secret token", async function() {
        const response = await soundcloud.tracks.secretToken("https://soundcloud.com/tenpimusic/kudasai")
        assert(response.hasOwnProperty("token"))
    })
})
