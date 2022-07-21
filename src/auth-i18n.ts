import { Context } from '@nuxt/types'

export default function ({ app, $auth }: Context) {
    // nuxt auth + i18n
    // @see https://stackoverflow.com/a/63341004
    $auth.onRedirect((to) => {
        return app.localePath(to)
    })
}
