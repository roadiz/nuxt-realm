import { ProviderOptions, SchemeOptions } from '@nuxtjs/auth-next/dist'
import defu from 'defu'
import { joinURL } from 'ufo'

interface RoadizSchemeOptions {
    baseURL?: string
}

export default function (_nuxt: any, strategy: ProviderOptions & SchemeOptions & RoadizSchemeOptions) {
    const defaultStrategy = {
        scheme: 'local',
        user: {
            property: false,
        },
        endpoints: {
            login: { url: joinURL(strategy.baseURL || '', '/api/token'), method: 'post' },
            user: { url: joinURL(strategy.baseURL || '', '/api/users/me'), method: 'get' },
        },
        token: {
            global: false,
        },
    }

    Object.assign(strategy, defu(strategy, defaultStrategy))
}
