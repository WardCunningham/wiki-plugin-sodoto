import { sodoto } from '../src/client/sodoto.js'
import { suite, test } from 'node:test'
import assert from 'node:assert'

suite('sodoto plugin', () => {
  suite('expand', () => {
    test('can escape html markup characters', () => {
      const result = sodoto.expand('try < & >')
      assert.equal(result, 'try &lt; &amp; &gt;')
    })
  })
})
