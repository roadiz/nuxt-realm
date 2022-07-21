export default function () {
    return {
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
}
