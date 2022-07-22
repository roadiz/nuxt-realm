# nuxt-realm
Roadiz realm authentication with Nuxt

## Usage

`yarn add @roadiz/nuxt-realm`

### Configuration

Add module in you `nuxt.config.js` file

```js
// nuxt.config.js
buildModules: [
    '@roadiz/nuxt-realm'
]
```

### Bearer authentication

This module use Nuxt auth module [https://auth.nuxtjs.org]() for bearer authentication.  
Please refer to the module documentation for any question about it.  
`$auth` is automatically injected by this module, and it'll be used for handling user authentication. 

### The RoadizRealm component

The module comes with a built-in component `<RoadizRealm>` for display a Roadiz realm.  
It's a renderless component, it can wrap only one root component.

```vue
<template>
    <roadiz-realm :response="myRoadizWebResponse">
      <div> // or any other tag / component
        // ... 
      </div>
    </roadiz-realm>
</template>
```

This component provides methods and properties for handling realm state.

```ts
export interface RoadizRealmProvide {
    realm?: RoadizSecureRealm // active realm
    realmAuthWithPassword(password: string): Promise<void> // authenticate with pasword
    realmHasPassword(): boolean // is there already a filled password for this realm
    realmIsBearerScheme: boolean // bearer authentication scheme 
    realmIsPasswordScheme: boolean // plain password authentication scheme 
}
```

These methods and properties can be injected into any child component.

#### Active realm

```ts
export default Vue.extend({
    inject: ['realm'],
})
```

#### Testing authentication scheme

```vue
<template>
    <login-form v-if="realmIsBearerScheme && !$auth.loggedIn" />
</template>
```

```ts
export default Vue.extend({
    inject: ['realmIsBearerScheme'],
})
```


#### Authenticate with plain password (password scheme)

```vue
<template>
    <form @submit="submit">
      <input type="password" v-model="password" />
      // ...
    </form>
</template>
```

```ts
export default Vue.extend({
    inject: ['realmAuthWithPassword'],
    data() {
        return {
            password: ''
        }
    },
    methods: {
        submit(event: Event) {
            event.preventDefault()
            
            this.realmAuthWithPassword(this.password)
        }
    }
})
```

### Testing if active realm has a stored password

```vue
<template>
    <password-form v-if="!hasPassword" />
</template>
```

```ts
export default Vue.extend({
    inject: ['realmHasPassword'],

    computed: {
        hasPassword(): boolean {
            return this.realmHasPassword() // use a computed prop with a getter for using data reactivity
        }
    }
})
```


#### Authenticate with user (bearer scheme)

```vue
<template>
    <form @submit="submit">
      <input type="username" v-model="login.username" />
      <input type="password" v-model="login.password" />
      // ...
    </form>
</template>
```

```ts
export default Vue.extend({
    data() {
        return {
            login: {
                username: '',
                password: ''
            }
        }
    },
    methods: {
        submit(event: Event) {
            event.preventDefault()

            this.$auth.loginWith('roadiz', { data: this.login })
        }
    }
})
```
