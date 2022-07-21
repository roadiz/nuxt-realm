import { resolve } from 'path'
import { Module } from '@nuxt/types'

const realmModule: Module = function () {
    this.addPlugin({
        src: resolve(__dirname, './plugin.js'),
        fileName: 'roadiz/plugins/realm.js',
    })
}

;(realmModule as any).meta = require('../package.json')

export default realmModule
