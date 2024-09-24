# mSupply ColdChain

Android mobile application designed and developed by [Sustainable Solutions](http://sussol.net). Integrates with [mSupply](https://www.msupply.org.nz/) to provide accessible and user-friendly temperature monitoring control for medical stock. Open-source and free-to-use, mSupply ColdChain is designed and built with a specific focus on the needs of developing countries.

Currently implemented sensors are the [BlueMaestro](https://bluemaestro.com/home) low-energy bluetooth temperature sensors.
Support for additional sensor vendors is underway.

## Features

- Track temperatures via bluetooth.

See [https://docs.msupply.foundation/en:cold_chain:start](https://docs.msupply.foundation/en:cold_chain:start) for more details of these and many other features.

## Getting started

- Note that these instructions have only been tested on mac OS. If there are any issues you have with different operating systems, please feel free to open an issue.

### Prerequisites

#### Android SDK

- Install Android Studio and SDK tools: https://developer.android.com/studio.
- Install SDKMAN for managing Java versions: https://sdkman.io/.

The application is using java v11 you may need to target a specific java version in order to run the app locally.
e.g. (with sdkman installed):

```
 sdk use java 11.0.23-zulu
```

#### React Native

- Install nvm for managing Node versions: https://github.com/nvm-sh/nvm.
- Install yarn for managing Node packages: https://yarnpkg.com/lang/en/.
- Install React Native: https://reactnative.dev/docs/environment-setup. Follow the steps listed under "Building Projects with Native Code" and set Target OS as "Android".

The node version should be >= 12.8.4 < 20

### Installing

- Clone the repo: `git clone https://github.com/openmsupply/mobile.git`.
- Setup local node environment as specified in `.nvmrc`: `nvm install && nvm use`.
- Install/update app dependencies: `yarn install`.

### Building

Simply run `yarn build` to build the app.
If you have the following error:
`A problem occurred starting process 'command 'node''`

try editing `android/app/build.gradle` and adding the `nodeExecutableAndArgs` value, specific to your environment:

```
project.ext.react = [
    nodeExecutableAndArgs: ["/usr/local/bin/node"]
    ...other entries
]
```

## Contributors

We welcome contributions from external developers!

### How to contribute

1. Find a bug or feature you'd like to work on from the [issues page](https://github.com/openmsupply/msupply-cold-chain/issues), or submit your own. If suggesting a feature, make sure to provide a compelling use case (functionality useful to only one or a few users is unlikely to be approved).
2. Comment on the issue to indicate you are interested in working on it.
3. Be patient :). A Sussoler will respond with any additional information or questions, and assign you when the issue is ready to be worked on.
4. Fork your own copy of the repository.
5. Code!
6. Open a pull request to the appropriate branch.
7. A Sussoler will review your PR and provide comments or request changes.
8. Sit back and enjoy the warm glow of success :).

### Checklist

- Ready to contribute? Before opening a PR, do a final check against the following list:
  - do all you changes adhered to the Sussol code conventions?
  - have you tested all changes you have made for bugs and regressions?
  - are your changes consistent with the mSupply Mobile mission statement (basic functionality with a focus on user-friendly and consistent design)?
