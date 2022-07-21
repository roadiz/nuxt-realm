import { Context } from '@nuxt/types'
import { RoadizSecureRealm } from '@roadiz/abstract-api-client/dist/types/roadiz'
import { TokenableScheme } from '@nuxtjs/auth-next/dist'
import { joinURL } from 'ufo'

type AuthenticationScheme = RoadizSecureRealm['authenticationScheme']

export const REALM_ITEM_KEY_PREFIX = 'realm'
export const PASSWORD_ITEM_KEY_PREFIX = 'realm-password'

export function isAuthenticationScheme(realm: RoadizSecureRealm, scheme: AuthenticationScheme): boolean {
    return realm.authenticationScheme === scheme
}

export function isPasswordScheme(realm: RoadizSecureRealm): boolean {
    return isAuthenticationScheme(realm, 'PasswordQuery')
}

export function isBearerScheme(realm: RoadizSecureRealm): boolean {
    return isAuthenticationScheme(realm, 'Bearer')
}

function getRealmItemKey(path: string): string {
    return `${REALM_ITEM_KEY_PREFIX}-${joinURL('/', path)}`
}

function getPasswordItemKey(realmID: string): string {
    return `${PASSWORD_ITEM_KEY_PREFIX}-${realmID}`
}

export function getStoredRealmByPath(path: string): RoadizSecureRealm | undefined {
    const rawRealm = sessionStorage.getItem(getRealmItemKey(path))

    if (!rawRealm) return

    return JSON.parse(rawRealm)
}

export function storeRealmByPath(path: string, realm: RoadizSecureRealm) {
    return sessionStorage.setItem(getRealmItemKey(path), JSON.stringify(realm))
}

export function getStoredPasswordByRealmID(realmID: string): string | null {
    return sessionStorage.getItem(getPasswordItemKey(realmID))
}

export function storePasswordByRealmID(realmID: string, password: string) {
    sessionStorage.setItem(getPasswordItemKey(realmID), password)
}

export default function (context: Context) {
    const { app, $roadiz } = context
    // add password to request if available
    $roadiz.axios.interceptors.request.use((config) => {
        if (process.client) {
            const path = app.router?.currentRoute.path

            if (!path) return config

            const realm = getStoredRealmByPath(path)

            if (!realm) return config

            if (isPasswordScheme(realm)) {
                const password = getStoredPasswordByRealmID(realm['@id'])

                if (password && typeof config.params?.password === 'undefined') {
                    config.params = { ...config.params, password }
                }
            } else if (isBearerScheme(realm) && app.$auth?.loggedIn) {
                const strategy = app.$auth?.strategy as TokenableScheme

                config.headers[strategy.options.token.name] = strategy.token.get()
            }
        }

        return config
    })
}
