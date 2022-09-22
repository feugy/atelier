# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.8.0](https://github.com/feugy/atelier/compare/v0.7.1...v0.8.0) (2022-09-22)

### Features

- **plugin:** exports a static version of atelier during vite build ([#24](https://github.com/feugy/atelier/issues/24)) ([db184c6](https://github.com/feugy/atelier/commit/db184c6a2fba3011917a7f3ac06664ac384bff99))
- **plugin:** exports atelier in dedicated build ([#25](https://github.com/feugy/atelier/issues/25)) ([418b4e2](https://github.com/feugy/atelier/commit/418b4e292c92eba5804aa82a3f1e57032a86f10e))

### [0.7.2](https://github.com/feugy/atelier/compare/v0.7.1...v0.7.2) (2022-09-21)

### Features

- **plugin:** exports a static version of atelier during vite build ([#24](https://github.com/feugy/atelier/issues/24)) ([db184c6](https://github.com/feugy/atelier/commit/db184c6a2fba3011917a7f3ac06664ac384bff99))

### [0.7.1](https://github.com/feugy/atelier/compare/v0.7.0...v0.7.1) (2022-06-21)

### Bug Fixes

- **toolshot:** relaxes peer dependency to allow jest@28 ([#22](https://github.com/feugy/atelier/issues/22)) ([581dbd5](https://github.com/feugy/atelier/commit/581dbd51740b8b4c7f375a986e4143ea98d80232))

## [0.7.0](https://github.com/feugy/atelier/compare/v0.6.9...v0.7.0) (2022-06-18)

### Features

- adds svelte-kit support ([#21](https://github.com/feugy/atelier/issues/21)) ([74cefbe](https://github.com/feugy/atelier/commit/74cefbe32800b1833be50d89f27f2bb23862ea3a))

### [0.6.9](https://github.com/feugy/atelier/compare/v0.6.8...v0.6.9) (2022-03-10)

### Bug Fixes

- **ui:** body overflow is not set ([60b2e2d](https://github.com/feugy/atelier/commit/60b2e2d035f860d4400e0ecc29dc6c75661e5571))

### [0.6.8](https://github.com/feugy/atelier/compare/v0.6.7...v0.6.8) (2022-03-10)

### Bug Fixes

- **ui:** no overflow for Atelier logo ([#20](https://github.com/feugy/atelier/issues/20)) ([5fa41b7](https://github.com/feugy/atelier/commit/5fa41b71727ed7c96ff2b585bf747699a7daba89))

### [0.6.7](https://github.com/feugy/atelier/compare/v0.6.6...v0.6.7) (2022-01-29)

### Bug Fixes

- **ui:** undesired margin with large frame ([9821593](https://github.com/feugy/atelier/commit/98215930a92f27be37187f7c8f1e1f29db77e8b7))

### [0.6.6](https://github.com/feugy/atelier/compare/v0.6.5...v0.6.6) (2022-01-29)

### Bug Fixes

- **svelte, ui:** frame and explorer don't have scroll bars ([#19](https://github.com/feugy/atelier/issues/19)) ([8d76156](https://github.com/feugy/atelier/commit/8d76156b71b6da1892fe3a244c1f4e2fb9b99770))

### [0.6.5](https://github.com/feugy/atelier/compare/v0.6.4...v0.6.5) (2022-01-15)

### Bug Fixes

- **ui:** 1st background still not applied by default ([4006e22](https://github.com/feugy/atelier/commit/4006e221444e8e7c97215e30cadda41ad67c8281))

### [0.6.4](https://github.com/feugy/atelier/compare/v0.6.3...v0.6.4) (2022-01-15)

### Bug Fixes

- **ui:** 1st background is not selected by default ([72c47b6](https://github.com/feugy/atelier/commit/72c47b6ffef08882af403ef0d8e09dd9dae4e65a))

### [0.6.3](https://github.com/feugy/atelier/compare/v0.6.2...v0.6.3) (2022-01-15)

### Bug Fixes

- vite-plugin-atelier can not load ui ([7f54e70](https://github.com/feugy/atelier/commit/7f54e70fb20a50e004240c177c65cbf5208bd1ce))

### [0.6.2](https://github.com/feugy/atelier/compare/v0.6.1...v0.6.2) (2022-01-09)

### [0.6.1](https://github.com/feugy/atelier/compare/v0.6.0...v0.6.1) (2022-01-09)

## [0.6.0](https://github.com/feugy/atelier/compare/v0.5.1...v0.6.0) (2022-01-09)

### ⚠ BREAKING CHANGES

- **plugin:** framework-agnostic plugin (#16)
- **plugin:** new configuration defaults (#13)

### Features

- **plugin:** framework-agnostic plugin ([#16](https://github.com/feugy/atelier/issues/16)) ([ec2368b](https://github.com/feugy/atelier/commit/ec2368bbde4bd55fc675833dd8320438bd8be810))
- **plugin:** new configuration defaults ([#13](https://github.com/feugy/atelier/issues/13)) ([1def126](https://github.com/feugy/atelier/commit/1def1262fa88b75104aabf48cbc1e299778bfc51))
- **ui, plugin:** configure UI throught plugin ([#17](https://github.com/feugy/atelier/issues/17)) ([dfafb16](https://github.com/feugy/atelier/commit/dfafb16d4b7bec97e863ead62a661f8fb38c7ead))
- **ui:** adds background and size pickers ([#15](https://github.com/feugy/atelier/issues/15)) ([ac41c38](https://github.com/feugy/atelier/commit/ac41c386e96444aeabd1f35cefdd6248d73b2e2f))
- **ui:** revamps user interface ([#14](https://github.com/feugy/atelier/issues/14)) ([bf26c6e](https://github.com/feugy/atelier/commit/bf26c6e6ce688ed3f90e00535a15ea1136a25d73))

### Bug Fixes

- **ui, svelte:** duplicates when renaming tools ([#18](https://github.com/feugy/atelier/issues/18)) ([21ab6d7](https://github.com/feugy/atelier/commit/21ab6d7002929170539d1bd4c7abc21baba53e39))

### [0.5.1](https://github.com/feugy/atelier/compare/v0.5.0...v0.5.1) (2021-10-10)

### Bug Fixes

- **plugin-svelte:** wrong UI version referenced ([57770be](https://github.com/feugy/atelier/commit/57770bec8422724a91243a922fda0f6cb83adeb1))

## [0.5.0](https://github.com/feugy/atelier/compare/v0.4.1...v0.5.0) (2021-10-09)

### Features

- improves layout management and supports toolshot timeouts ([#12](https://github.com/feugy/atelier/issues/12)) ([30b0be0](https://github.com/feugy/atelier/commit/30b0be00a76d3d9d919c4a70ecbce23b355d68b8))

### [0.4.1](https://github.com/feugy/atelier/compare/v0.4.0...v0.4.1) (2021-10-03)

### Bug Fixes

- **plugin:** referenced UI is outdated ([c8624f7](https://github.com/feugy/atelier/commit/c8624f7665d587ce93fb95898f18867a619a4a09))

## [0.4.0](https://github.com/feugy/atelier/compare/v0.3.1...v0.4.0) (2021-10-03)

### Features

- **ui:** adds loading indicator ([#11](https://github.com/feugy/atelier/issues/11)) ([b50ef73](https://github.com/feugy/atelier/commit/b50ef731b65b53b9f499f150e22ff32c2cf2f1c4))
- **ui:** automatically shows event panel when receiving event ([#10](https://github.com/feugy/atelier/issues/10)) ([fde7f6b](https://github.com/feugy/atelier/commit/fde7f6bde65ed25ecfd769b2a3b548cd049802b4))
- **ui:** introduces layouts ([#9](https://github.com/feugy/atelier/issues/9)) ([9583e7f](https://github.com/feugy/atelier/commit/9583e7f8b695bc6becb14e3a81a2602a880b184f))

### [0.3.1](https://github.com/feugy/atelier/compare/v0.3.0...v0.3.1) (2021-10-02)

### Bug Fixes

- **plugin-svelte:** no such file or directory, scandir '@atelier-wb/ui/dist' ([cec03c0](https://github.com/feugy/atelier/commit/cec03c032058e8f7bfd0ce0f228e343fe2357928))

## [0.3.0](https://github.com/feugy/atelier/compare/v0.2.1...v0.3.0) (2021-10-02)

### Features

- **svelte:** allows to programmatically record events ([#7](https://github.com/feugy/atelier/issues/7)) ([b71c34d](https://github.com/feugy/atelier/commit/b71c34da66403f4d4365a546f27b35759e13c654))
- **svelte:** passes and overrides tool props with setup functions ([#8](https://github.com/feugy/atelier/issues/8)) ([4d38fdd](https://github.com/feugy/atelier/commit/4d38fdd31f73e02d7a3dd59e68f67468e0414ac5))
- **toolshot:** uses tool short name in snapshot ([#6](https://github.com/feugy/atelier/issues/6)) ([ef4b55d](https://github.com/feugy/atelier/commit/ef4b55db32d2fed0ca5f6674378f514a26c4e994))

### [0.2.1](https://github.com/feugy/atelier/compare/v0.2.0...v0.2.1) (2021-09-30)

### Bug Fixes

- **plugin-svelte:** fails when path is '/' ([b4bfb28](https://github.com/feugy/atelier/commit/b4bfb2882774638b929ff0ffc36c8bcec2b2a104))
- **svelte:** invisible tools are aligned on a row ([7594a7e](https://github.com/feugy/atelier/commit/7594a7e938a1cb66f45266f229c0b970dfaa60f0))
- **toolshot:** non-source files are published ([3ab1041](https://github.com/feugy/atelier/commit/3ab10416c75214f19a224f80e84700898c3f2fb9))

## 0.2.0 (2021-09-29)

### Features

- **svelte:** introduce ToolBox and refactor Tool ([fd69377](https://github.com/feugy/atelier/commit/fd6937792f59ed56abb943d0c90511b880837342))
- **svelte:** supports Tool/ToolBox slots, introduces before and teardown hooks ([#5](https://github.com/feugy/atelier/pulls/5)) ([1459273](https://github.com/feugy/atelier/commit/1459273b392fc95a221d83703a28314f6acd2472))
- **toolshot:** introduces tools snapshots in Jest ([#5](https://github.com/feugy/atelier/pulls/5)) ([1459273](https://github.com/feugy/atelier/commit/1459273b392fc95a221d83703a28314f6acd2472))
- **ui:** adds button to clear event log ([#3](https://github.com/feugy/atelier/pulls/3)) ([d04dae9](https://github.com/feugy/atelier/commit/d04dae91b20843ed7dfb1caca8e66f46d39dc6d5))
- **ui:** introduces properties pane ([#2](https://github.com/feugy/atelier/pulls/2)) ([2cabdc8](https://github.com/feugy/atelier/commit/2cabdc81c4a9ed2ea4fff7f3d25e8cf112a847db))

### Bug Fixes

- **ui:** tab container can not be collapsed ([c9bb5a0](https://github.com/feugy/atelier/commit/c9bb5a06a25cb286b96d7ebf35d5339c32972ce7))

## 0.1.0 (2021-04-18)

- initial commit! ([fd69377](<(https://github.com/feugy/atelier/commit/fd6937792f59ed56abb943d0c90511b880837342)>)
