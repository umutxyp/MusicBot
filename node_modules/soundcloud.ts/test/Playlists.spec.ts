import {assert} from "chai"
import "mocha"
import {soundcloud} from "./login"

describe("Playlists", async function() {
    it("should get a playlist", async function() {
        const response = await soundcloud.playlists.get("https://soundcloud.com/tenpimusic/sets/my-songs")
        assert(response.hasOwnProperty("description"))
    })

    it("should search for playlists", async function() {
        const response = await soundcloud.playlists.search()
        assert(response[0].hasOwnProperty("description"))
    })

    it("should get a secret token", async function() {
        const response = await soundcloud.playlists.secretToken("https://soundcloud.com/tenpimusic/sets/my-songs")
        assert(response.hasOwnProperty("token"))
    })
})
