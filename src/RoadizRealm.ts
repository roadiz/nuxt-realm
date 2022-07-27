import type { PropType, VNode } from 'vue'
import Vue from 'vue'
import { RoadizSecureRealm, RoadizWebResponse } from '@roadiz/abstract-api-client/dist/types/roadiz'
import { AxiosError } from 'axios'
import {
    getStoredPasswordByRealmID,
    isBearerScheme,
    isPasswordScheme,
    storePasswordByRealmID,
    storeRealmByPath,
} from './plugin'

export interface RoadizRealmProvide {
    realm?: RoadizSecureRealm
    realmAuthWithPassword(password: string): Promise<void>
    realmHasPassword(): boolean
    realmIsBearerScheme: boolean
    realmIsPasswordScheme: boolean
}

export default Vue.extend({
    name: 'RoadizRealm',
    provide(): RoadizRealmProvide {
        return {
            realm: this.realm,
            realmAuthWithPassword: this.authWithPassword,
            realmHasPassword: () => this.hasPassword,
            realmIsBearerScheme: this.isBearerScheme,
            realmIsPasswordScheme: this.isPasswordScheme,
        }
    },
    props: {
        response: {
            type: Object as PropType<RoadizWebResponse>,
            required: true,
        },
    },
    data() {
        return {
            hasPassword: false,
        }
    },
    computed: {
        realm(): RoadizSecureRealm | undefined {
            return this.response?.realms?.[0]
        },
        isBearerScheme(): boolean {
            return !!this.realm && isBearerScheme(this.realm)
        },
        isPasswordScheme(): boolean {
            return !!this.realm && isPasswordScheme(this.realm)
        },
        loggedIn(): boolean {
            return !!this.$auth && this.$auth.loggedIn
        },
    },
    watch: {
        loggedIn() {
            this.$nuxt.refresh()
        },
    },
    mounted() {
        if (!this.realm) return

        this.hasPassword = !!getStoredPasswordByRealmID(this.realm['@id'])
        this.refreshIfNeeded()
    },
    methods: {
        async authWithPassword(password: string): Promise<void> {
            if (!password) {
                // this error should never append because of the form validation
                return Promise.reject(new Error('No password provided'))
            }

            const path = this.$route.path
            const response = await this.$roadiz.getWebResponseByPath({ path, password }).catch((error: AxiosError) => {
                return Promise.reject(error)
            })
            const { realms, hidingBlocks } = response.data

            if (hidingBlocks === false) {
                const realm = realms?.[0]

                if (realm) {
                    storeRealmByPath(path, realm)
                    storePasswordByRealmID(realm['@id'], password)

                    this.hasPassword = true
                }

                return this.$nuxt.refresh()
            }

            return Promise.reject(new Error('Wrong password'))
        },
        async refreshIfNeeded(): Promise<boolean> {
            if (!this.realm) return Promise.resolve(false)

            // if (!response.hidingBlocks) return Promise.resolve()

            // will be used by axios interceptor
            storeRealmByPath(this.$route.path, this.realm)

            // TODO: does hidingBlocks is true even if there is no block?
            if (this.realm.behaviour === 'hide_blocks' && !this.response.hidingBlocks) return Promise.resolve(false)
            // for behaviour `none` we don't know what to do then we'll always refresh

            if (isPasswordScheme(this.realm)) {
                const password = getStoredPasswordByRealmID(this.realm['@id'])

                if (!password) return Promise.resolve(false)
            } else if (isBearerScheme(this.realm)) {
                if (!this.$auth.loggedIn) return Promise.resolve(false)
            }

            // into the ssr context, the $loading component is available only on next tick
            await Vue.nextTick()

            return this.$nuxt.refresh().then(() => true)
        },
    },
    render(createElement): VNode {
        return this.$slots.default?.[0] || createElement('')
    },
})
