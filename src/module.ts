import { resolve, join } from 'path'
import { Module } from '@nuxt/types'

const realmModule: Module = function () {
    const { nuxt, addPlugin } = this
    const runtimeDir = resolve(__dirname)

    addPlugin({
        src: resolve(__dirname, './plugin.js'),
        fileName: 'roadiz/plugins/realm.js',
    })

    nuxt.hook('components:dirs', (dirs: Record<string, unknown>[]) => {
        dirs.push({
            path: join(runtimeDir, 'RoadizRealm'),
        })
    })
}

module.exports.meta = require('./package.json')

export default realmModule
