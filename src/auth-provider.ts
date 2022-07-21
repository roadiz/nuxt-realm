import { ProviderOptions, SchemeOptions } from '@nuxtjs/auth-next/dist'
import defu from 'defu'

export default function (_nuxt: any, strategy: ProviderOptions & SchemeOptions) {
    const defaultStrategy = {
        scheme: 'local',
        user: {
            property: false,
        },
        endpoints: {
            login: { url: '/api/token', method: 'post' },
            user: { url: '/api/users/me', method: 'get' },
        },
        token: {
            global: false,
        },
    }

    Object.assign(strategy, defu(strategy, defaultStrategy))
}
