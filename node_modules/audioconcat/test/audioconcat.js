var fs = require('fs')
var expect = require('chai').expect
var audioconcat = require('../')
var fixtures = 'test/fixtures'

suite('audioconcat', function () {
  var songs = [
    fixtures + '/pipershut.mp3',
    fixtures + '/tailtoddle.mp3'
  ]

  var output = 'test/fixtures/out.mp3'

  function clean() {
    fs.unlink(output, function () {})
  }

  before(clean)
  after(clean)

  test('merge multiple files', function (done) {
    audioconcat(songs)
      .concat('test/fixtures/out.mp3')
      .on('start', function (cmd) {
        expect(cmd).to.match(/pipershut.mp3/)
        expect(cmd).to.match(/tailtoddle.mp3/)
      })
      .on('error', done)
      .on('end', function () {
        expect(fs.existsSync(output)).to.be.true
        done()
      })
  })

})
