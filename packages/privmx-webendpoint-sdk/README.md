# PrivMX Web Endpoint SDK

## Overview

PrivMX Web Endpoint SDK is a set of TypeScript/JavaScript tools that simplify working with PrivMX Bridge in Web
environments.
It consists of:

- high-level wrappers for native WASM assets, to accelerate the development of end-to-end encrypted apps even more;
- types for powerful autocompletion in your IDE;
- CLI for straightforward project initialization.

## Initial Requirements

To start developing end-to-end encrypted applications using PrivMX Endpoint you need:

- A PrivMX Bridge Instance. Go to [Bridge CLI repo](https://github.com/simplito/privmx-bridge-docker) to find scripts to
  create and initialize one on your local machine.

- A server for managing users. It can be new or existing, depending on the specific requirements.
  For more information about how PrivMX Endpoint integrates into your stack check
  our [getting started guide](https://docs.privmx.dev/js/getting-started).

## Installation

First, install this package using your package manager of choice.

- npm:

```
npm install @simplito/privmx-webendpoint-sdk@latest 
```

- pnpm:

```
pnpm add @simplito/privmx-webendpoint-sdk@latest 
```

- yarn:

```
yarn add @simplito/privmx-webendpoint-sdk@latest 
```

The wrappers need access to the core lib in order to work properly. To do this, follow these steps:

1. Host core WASM assets from your static assets folder (e.g. `/public`). Then import them using `<script>`
   tags inside your app's main file. Depending on the stack it can be for example `index.html` or `app.js`.
2. Configure your server to properly integrate our library.
   You need to set up specific HTTP headers:

- `Cross-Origin-Embedder-Policy: require-corp`
- `Cross-Origin-Opener-Policy: same-origin`

This will ensure the library functions correctly and maintain security.

The steps above can be handled automatically, using our setup npx script:

```
npx webendpoint-manager
```

## Documentation

Full documentation about this package's functions, types and example usage can be
found in our [docs](https://docs.privmx.dev).

## Example Apps

If you prefer a more hands-on approach to learning, start by cloning one of our example apps:

- [Endpoint Examples Minimal](https://github.com/simplito/privmx-webendpoint-sdk-example) -
  a set of small Tool-specific code examples executed inside browser console. The best for a quick-start with PrivMX
  Endpoint.

- [Chatee](https://github.com/simplito/privmx-chatee) - a full-fledged end-to-end encrypted chat app built using
  Next.js.
  It demonstrates how to:
    - create a secure real-time chat using Threads;
    - send attachments using Stores;
    - manage users inside PrivMX Bridge from your own server using REST API.

## Creating First App

A step-by-step tutorial that will guide you through creating your first app using JavaScript Endpoint SDK
with PrivMX Bridge.

### Setup PrivMX Bridge Instance

To create a PrivMX Bridge Instance, you need Docker with Docker Compose installed on your machine.

1. **First, clone our [Bridge CLI repo](https://github.com/simplito/privmx-bridge-docker)**:
   ```shell
   git clone https://github.com/simplito/privmx-bridge-docker
   ```
2. **Run setup scripts (it may require admin permissions)**:
   ```bash
   ./setup.sh
   ```
   This will fetch the necessary Docker images, create Access Keys and your first Context. After a successful setup, CLI
   will
   display all the API keys necessary for connection.

3. **Register the first user**:

   In your terminal, generate private-public key pair for your user. The keys must be in WIF format:
   ```shell
   ./genKeyPair.sh
   ```

   With the keys ready, register `userId` - public key pair in your Context. Don't forget to replace placeholder values
   with the ones created earlier:
   ```shell
   ./cli.sh context/addUserToContext '{"contextId": "CONTEXT_ID", "userId":"USER_ID", "userPubKey":"USER_PUBLIC_KEY" }'
   ```

### Create Client App

To create client app, you need Node and npm installed on your machine.

1. **Create app using Vite CLI**:
```shell
npm create vite
   ```
Follow all the steps displayed by Vite CLI. You can choose any framework you prefer - PrivMX Endpoint Web SDK is
framework-agnostic.

2. **Install dependencies**

Inside the created project folder, install this Endpoint Web SDK:
```shell
npm i @simplito/privmx-webendpoint-sdk@latest
   ```
After the installation, run setup script provided by the SDK:
```shell
npx webendpoint-manager
   ```
Follow the steps displayed in your terminal.

3. **Connect to your Bridge Instance**

Paste the following snippet to your main JavaScript file (e.g. `./src/App.ts` or `./src/index.js`):
```ts
 async function connectToBridge() {
     const connection = await Endpoint.connect({
         bridgeUrl:"BRIDGE_URL",
         solutionId:"SOLUTION_ID",
         privKey:"USER_PRIVATE_KEY",
     })

     const firstUser = {
         userId:"USER_ID",
         pubKey:"USER_PUBLIC_KEY",
     }

     const threadId = await connection.threads.new({
         users:[firstUser],
         managers:[firstUser]
     })

     await connection.thread(threadId).sendMessage({
         data:new TextEncoder().encode("Hello Bridge!")
     })
     const messageList = await connection.thread(threadId).getMessages(0)

     const decodedMessageList = messageList.readItems.map(message => {
         return {
             data:new TextDecoder().decode(message.data),
             info:message.info,
             authorPubKey:message.authorPubKey,
         }
     })
     console.log(decodedMessageList)
}
   ```
First, you have to connect to your Bridge Instance using `Endpoint.connect` method. It requires the API keys
generated
while initializing your local instance earlier.

```ts
const connection = await Endpoint.connect({
         bridgeUrl:"BRIDGE_URL",
         solutionId:"SOLUTION_ID",
         privKey:"USER_PRIVATE_KEY",
})
```
When connected, you have access to all SDK methods. This example shows how to create a Thread, send and download
a message.
To create a Thread inside Context, use Threads handle methods `new`. Note that you have to pass user ID - public key
pair to make a list of users and managers.

```ts
 const firstUser = {
         userId:"USER_ID",
         pubKey:"USER_PUBLIC_KEY",
     }

     const threadId = await connection.threads.new({
         users:[firstUser],
         managers:[firstUser]
     })
```
With the Thread created, you can now send the first message.

> Endpoint sends data in `Uint8Array` format. It requires encoding your data from string or object format to
binary (e.g. the usage of `TextEncoder` for string encoding).

```ts
await connection.thread(threadId).sendMessage({
    data:new TextEncoder().encode("Hello Bridge!")
})
```

To get a list of messages inside a Thread, use `getMessages` method. Because data inside messages is in Uint8Array
you
have to deserialize it to human-readable string.
**Endpoint takes care of encrypting your data before sending it to PrivMX Bridge.**

```ts
   const messageList = await connection.thread(threadId).getMessages(0)

     const decodedMessageList = messageList.readItems.map(message => {
         return {
             data:new TextDecoder().decode(message.data),
             info:message.info,
             authorPubKey:message.authorPubKey,
         }
     })
     console.log(decodedMessageList)
```

4. **Run your app**

In your terminal, run `npm run dev` to start local app server.

## License

[MIT](./LICENSE)
