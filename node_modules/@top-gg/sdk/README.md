# Top.gg Node SDK

An official module for interacting with the Top.<span>gg API

# Installation

`yarn add @top-gg/sdk` or `npm i @top-gg/sdk`

# Introduction

The base client is Topgg.Api, and it takes your Top.<span>gg token and provides you with plenty of methods to interact with the API.

Your Top.<span>gg token can be found at `top.gg/bot/(BOT_ID)/webhooks` and copying the token.

You can also setup webhooks via Topgg.Webhook, look down below at the examples for how to do so!

# Links

[Documentation](https://topgg.js.org)

[API Reference](https://docs.top.gg) | [GitHub](https://github.com/top-gg/node-sdk) | [NPM](https://npmjs.com/package/@top-gg/sdk) | [Discord Server](https://discord.gg/EYHTgJX)

# Popular Examples

## Auto-Posting stats

If you're looking for an easy way to post your bot's stats (server count, shard count), check out [`topgg-autoposter`](https://npmjs.com/package/topgg-autoposter)

```js
const client = Discord.Client() // Your discord.js client or any other
const { AutoPoster } = require('topgg-autoposter')

AutoPoster('topgg-token', client)
  .on('posted', () => {
    console.log('Posted stats to Top.gg!')
  })
```
With this your server count and shard count will be posted to Top.<span>gg

## Webhook server

```js
const express = require('express')
const Topgg = require('@top-gg/sdk')

const app = express() // Your express app

const webhook = new Topgg.Webhook('topggauth123') // add your Top.gg webhook authorization (not bot token)

app.post('/dblwebhook', webhook.listener(vote => {
  // vote is your vote object
  console.log(vote.user) // 221221226561929217
})) // attach the middleware

app.listen(3000) // your port
```
With this example, your webhook dashboard should look like this:
![](https://i.imgur.com/wFlp4Hg.png)
