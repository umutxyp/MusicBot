# node-ytsr

A light-weight ytsr for [DisTube](https://distube.js.org).

*Forked from [ytsr](https://www.npmjs.com/package/ytsr).*

# Feature
- Search for videos on YouTube

# Usage

```js
const ytsr = require('@distube/ytsr');

ytsr('DisTube', { safeSearch: true, limit: 1 }).then(result => {
    let song = result.items[0];
    console.log('ID: ' + song.id);
    console.log('Name: ' + song.name);
    console.log('URL: ' + song.url);
    console.log('Views: ' + song.views);
    console.log('Duration: ' + song.duration);
    console.log('Live: ' + song.isLive);
})

/*
ID: Bk7RVw3I8eg
Name: Disturbed "The Sound Of Silence" 03/28/16
URL: https://www.youtube.com/watch?v=Bk7RVw3I8eg
Views: 114892726
Duration: 4:25
Live: false
*/
```

## Example Response

```js
{
  query: 'lofi',
  items: [
    {
      name: 'lofi hip hop radio - beats to relax/study to',
      id: '5qap5aO4i9A',
      url: 'https://www.youtube.com/watch?v=5qap5aO4i9A',
      thumbnail: 'https://i.ytimg.com/vi/5qap5aO4i9A/hq720_live.jpg?sqp=-oaymwEXCNAFEJQDSFryq4qpAwkIARUAAIhCGAE=&rs=AOn4CLD0pBKpXiNqTSHm5c4PWbtYvEhs3A',
      views: 49275,
      duration: null,
      isLive: true
    },
    {
      name: 'lofi hip hop radio - beats to sleep/chill to',
      id: 'DWcJFNfaw9c',
      url: 'https://www.youtube.com/watch?v=DWcJFNfaw9c',
      thumbnail: 'https://i.ytimg.com/vi/DWcJFNfaw9c/hq720_live.jpg?sqp=-oaymwEXCNAFEJQDSFryq4qpAwkIARUAAIhCGAE=&rs=AOn4CLBbeCtWD3xjXaOaQTz67aAwI-_fNA',
      views: 8522,
      duration: null,
      isLive: true
    },
    {
      name: '� 24-7 lofi hip hop radio - late nite chat - every night 8pm-4am ♫',
      id: 'FdODvm2nVj0',
      url: 'https://www.youtube.com/watch?v=FdODvm2nVj0',
      thumbnail: 'https://i.ytimg.com/vi/FdODvm2nVj0/hq720_live.jpg?sqp=-oaymwEXCNAFEJQDSFryq4qpAwkIARUAAIhCGAE=&rs=AOn4CLDNAGh0sQP3KaH6MJZY9aB1dBfJxA',
      views: 787,
      duration: null,
      isLive: true
    },
    {
      name: "old songs but it's lofi remix",
      id: 'BrnDlRmW5hs',
      url: 'https://www.youtube.com/watch?v=BrnDlRmW5hs',
      thumbnail: 'https://i.ytimg.com/vi/BrnDlRmW5hs/hqdefault.jpg?sqp=-oaymwEjCOADEI4CSFryq4qpAxUIARUAAAAAGAElAADIQj0AgKJDeAE=&rs=AOn4CLCcyDp4ava3NpDQ9-DulcRCNDZwfw',
      views: 10158485,
      duration: '24:01',
      isLive: false
    },
    {
      name: '1 A.M Study Session � - [lofi hip hop/chill beats]',
      id: 'lTRiuFIWV54',
      url: 'https://www.youtube.com/watch?v=lTRiuFIWV54',
      thumbnail: 'https://i.ytimg.com/vi/lTRiuFIWV54/hq720.jpg?sqp=-oaymwEXCNAFEJQDSFryq4qpAwkIARUAAIhCGAE=&rs=AOn4CLAC0Nc8H1ik0exLK7pnsK__2al1Gg',
      views: 26510353,
      duration: '1:01:14',
      isLive: false
    },
    {
      name: 'lofi songs for slow days',
      id: 'AzV77KFsLn4',
      url: 'https://www.youtube.com/watch?v=AzV77KFsLn4',
      thumbnail: 'https://i.ytimg.com/vi/AzV77KFsLn4/hq720.jpg?sqp=-oaymwEXCNAFEJQDSFryq4qpAwkIARUAAIhCGAE=&rs=AOn4CLDWymfbIH0U0KuP1AahnpBagf9ZXQ',
      views: 2327359,
      duration: '19:00',
      isLive: false
    },
    {
      name: 'Summer Feelings ~ lofi hip hop mix',
      id: 'qsdzdUYl5c0',
      url: 'https://www.youtube.com/watch?v=qsdzdUYl5c0',
      thumbnail: 'https://i.ytimg.com/vi/qsdzdUYl5c0/hq720.jpg?sqp=-oaymwEXCNAFEJQDSFryq4qpAwkIARUAAIhCGAE=&rs=AOn4CLCA_tBElR13FB5XLuk27-pcIuRbTA',
      views: 2292510,
      duration: '55:00',
      isLive: false
    },
    {
      name: 'cute lofi mix  songs to help you be happy - 寛げる [ J A P A N E S E   L O F I   F U T U R E   B A S S]',
      id: 'XN41UJ7EZ4E',
      url: 'https://www.youtube.com/watch?v=XN41UJ7EZ4E',
      thumbnail: 'https://i.ytimg.com/vi/XN41UJ7EZ4E/hq720.jpg?sqp=-oaymwEXCNAFEJQDSFryq4qpAwkIARUAAIhCGAE=&rs=AOn4CLDF4e2Hd0NMwXPePywOz52VFLrsmA',
      views: 4548754,
      duration: '28:50',
      isLive: false
    },
    {
      name: '3 A.M Study Session � - [lofi hip hop/chill beats]',
      id: 'BTYAsjAVa3I',
      url: 'https://www.youtube.com/watch?v=BTYAsjAVa3I',
      thumbnail: 'https://i.ytimg.com/vi/BTYAsjAVa3I/hq720.jpg?sqp=-oaymwEXCNAFEJQDSFryq4qpAwkIARUAAIhCGAE=&rs=AOn4CLAxJ2mk3FWhyoKfCgCEviGgfmNyeg',
      views: 2386862,
      duration: '1:00:04',
      isLive: false
    },
    {
      name: 'cherry blossom. [lofi / jazzhop / chill mix]',
      id: '5wRWniH7rt8',
      url: 'https://www.youtube.com/watch?v=5wRWniH7rt8',
      thumbnail: 'https://i.ytimg.com/vi/5wRWniH7rt8/hq720.jpg?sqp=-oaymwEXCNAFEJQDSFryq4qpAwkIARUAAIhCGAE=&rs=AOn4CLC-JEQBQyTp5yV9xaXBDNplq3Vcpw',
      views: 98449,
      duration: '41:35',
      isLive: false
    },
    {
      name: 'Philanthrope - Cabin in the Woods [lofi instrumental beats]',
      id: 'wmNyN1XN9-8',
      url: 'https://www.youtube.com/watch?v=wmNyN1XN9-8',
      thumbnail: 'https://i.ytimg.com/vi/wmNyN1XN9-8/hq720.jpg?sqp=-oaymwEXCNAFEJQDSFryq4qpAwkIARUAAIhCGAE=&rs=AOn4CLCQu7_ZN1zteAcgBE4rFK8ZhdFicA',
      views: 125340,
      duration: '26:09',
      isLive: false
    }
  ],
  results: 14601710,
  continuation: 'EoEDEgRsb2ZpGvgCU0NpQ0FRczFkMUpYYm1sSU4zSjBPSUlCQzNkdFRubE9NVmhPT1MwNGdnRUxWbEZ2YW5WZlJHWnBPVFNDQVF0SlUwNUNabko1UW10VGI0SUJDM2xPWHpWcVRuaE5NRU5WZ2dFTE1sY3diREYxUld0a1oxbUNBUXQyZW1wT1JVZFdOVUZFYzRJQkN6Sk5UVk5qTlhGQlNVVm5nZ0VMTFRWTFFVNDVYME42VTBHQ0FRdEZSbVJJYUdkSk9DMW1kNElCQzFsUFNuTkxZWFJYTFZSemdnRUxjemh4VjNCRFRXZGxZM09DQVFzemVrSm5ORlZPWkY5SGQ0SUJDMkp3U21kYWVVTlVSMHhyZ2dFTFNrRlZaWHB2YVVGVFZFV0NBUXRUV0daMWNFcEpXSFJTUVlJQkMxSkRRVFF6VkVwd1VqTlpnZ0VMVkZsRFFtbGpTM2xXYUhPQ0FRdGxSREYyZEdkT1FrSjNNSUlCQ3pCb05YSkZVbTlCVmxwbhiB4OgYIgtzZWFyY2gtZmVlZA%3D%3D'
}
```