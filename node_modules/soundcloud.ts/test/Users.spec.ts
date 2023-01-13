import {assert} from "chai"
import "mocha"
import {soundcloud} from "./login"

describe("Users", async function() {
    it("should get a user", async function() {
        const response = await soundcloud.users.get("https://soundcloud.com/tenpimusic")
        assert(response.hasOwnProperty("description"))
    })

    it("should search for users", async function() {
        const response = await soundcloud.users.search({q: "virtual riot"})
        assert(response[0].hasOwnProperty("description"))
    })

    it("should get user comments", async function() {
        const response = await soundcloud.users.comments("https://soundcloud.com/tenpimusic")
        assert(response[0].hasOwnProperty("body"))
    })

    it("should get a user favorite", async function() {
        const response = await soundcloud.users.favorite("https://soundcloud.com/tenpimusic", "https://soundcloud.com/inf1n1temusic/inf1n1tea-konus-nova1")
        assert(response.hasOwnProperty("description"))
    })

    it("should get user favorites", async function() {
        const response = await soundcloud.users.favorites("https://soundcloud.com/tenpimusic")
        assert(response[0].hasOwnProperty("description"))
    })

    /* 401
    it("should get a user following", async function() {
        const response = await soundcloud.users.following("https://soundcloud.com/tenpimusic", "virtual-riot")
        assert(response.hasOwnProperty("description"))
    })
    */

    it("should get user followings", async function() {
        const response = await soundcloud.users.followings("https://soundcloud.com/tenpimusic")
        assert(response.hasOwnProperty("collection"))
    })

    it("should get user followers", async function() {
        const response = await soundcloud.users.followers("https://soundcloud.com/tenpimusic")
        assert(response.hasOwnProperty("collection"))
    })

    /* 401
    it("should get a user follower", async function() {
        const response = await soundcloud.users.follower("https://soundcloud.com/tenpimusic", "tenma1")
        assert(response.hasOwnProperty("description"))
    })
    */

    it("should get user tracks", async function() {
        const response = await soundcloud.users.tracks("https://soundcloud.com/tenpimusic")
        assert(response[0].hasOwnProperty("description"))
    })

    it("should get user playlists", async function() {
        const response = await soundcloud.users.playlists("https://soundcloud.com/tenpimusic")
        // assert(response[0].hasOwnProperty("description"))
    })

    it("should get a users web profiles", async function() {
        const response = await soundcloud.users.webProfiles("https://soundcloud.com/tenpimusic")
        assert(response[0].hasOwnProperty("url"))
    })
})
