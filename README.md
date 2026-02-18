# Face, Document and Palm Capture Web Components

This repository is a collection of web components for face, ID document or palm photo capture with usage instructions for easy implementation into your application.

The repository contains the following Innovatrics DOT web components:

- Face Auto Capture Component
- Document Auto Capture Component
- Multi-Range Liveness Component
- Palm Auto Capture Component
- MagnifEye Liveness Component
- Smile Liveness Component
- Auto Capture UI Component

The components can be used to develop remote identity verification or digital onboarding solutions, as demonstrated in this [demo application](https://dot.innovatrics.com/).

You can also check out the [integration samples](https://github.com/innovatrics/dot-web-samples) in various technologies (React, Vue, Angular, jQuery).

## Features

The output of all the components is one or more face / document / palm image(s) in the JPEG format and/or a proprietary file format for safe transfer to [Digital Identity Service](https://developers.innovatrics.com/digital-onboarding/technical/api-reference/) on server for further processing.

### Face Auto Capture Component

[Innovatrics Face Auto Capture Component](https://www.npmjs.com/package/@innovatrics/dot-face-auto-capture) renders the video stream from an available phone or web camera to automatically capture an image of a user’s face with the required quality.

<p align="center">
  <img alt="Face Auto Capture" src="https://www.innovatrics.com/wp-content/uploads/2024/03/Passive-Liveness-preview-400px.gif" width="200" height="400">
</p>

### Document Auto Capture Component

[Innovatrics Document Auto Capture Component](https://www.npmjs.com/package/@innovatrics/dot-document-auto-capture) renders the video stream from an available phone or web camera to automatically capture an image of an ID document with the required quality.

<p align="center">
  <img alt="Document Auto Capture" src="https://www.innovatrics.com/wp-content/uploads/2024/03/Onboarding-document-scanning-400px.gif" width="200" height="400">
</p>

### Multi-Range Liveness Component

[Innovatrics Multi-Range Liveness Component](https://www.npmjs.com/package/@innovatrics/dot-multi-range-liveness) renders the video stream from an available phone or web camera to automatically capture multiple images of a user’s face in random distances with the required quality. The component lays the foundation for an active liveness capture capability.

<p align="center">
  <img alt="Multi-Range Liveness" src="https://www.innovatrics.com/wp-content/uploads/2025/12/multirange_resized.gif" width="200" height="400">
</p>

### Palm Capture Component

[Innovatrics Palm Capture Component](https://www.npmjs.com/package/@innovatrics/dot-palm-capture) renders the video stream from an available phone or web camera to automatically capture an image of a user’s palm with the required quality.

<p align="center">
  <img alt="Palm Capture" src="https://www.innovatrics.com/wp-content/uploads/2025/03/palm.gif" width="200" height="400">
</p>

### MagnifEye Liveness Component

[Innovatrics MagnifEye Liveness Component](https://www.npmjs.com/package/@innovatrics/dot-magnifeye-liveness) renders the video stream from an available phone or web camera to automatically capture a detailed image of a user’s face and their eye with the required quality. The component lays the foundation for a semi-passive liveness capture capability.

<p align="center">
  <img alt="MagnifEye Liveness Component" src="https://www.innovatrics.com/wp-content/uploads/2024/03/MagnifEye_liveness-preview-400px.gif" width="200" height="400">
</p>

### Smile Liveness Component

[Innovatrics Smile Liveness Component](https://www.npmjs.com/package/@innovatrics/dot-smile-liveness) renders the video stream from an available phone or web camera to automatically capture two images of a user’s face with the required quality. The component lays the foundation for a semi-passive liveness capture capability.

<p align="center">
  <img alt="Smile Liveness Component" src="https://www.innovatrics.com/wp-content/uploads/2024/03/Smile-liveness-preview-400px.gif" width="200" height="400">
</p>

### Auto Capture UI Component

[Innovatrics Auto Capture UI Component](https://www.npmjs.com/package/@innovatrics/dot-auto-capture-ui) renders an overlay over the video stream. The overlay includes a placeholder, camera control buttons and instructions to guide the user to position their face or their ID document correctly. It is recommended to be used with other components mentioned above.

## Requirements

Before using any of the components that are available in this repository, beware of the following requirements:

### UI Component

**IMPORTANT:** For the auto capture and liveness components to work as intended, we highly recommend you also have [Auto Capture UI Component](https://www.npmjs.com/package/@innovatrics/dot-auto-capture-ui) installed in your project. You can learn more about why this is important on our [developers portal](https://developers.innovatrics.com/digital-onboarding/technical/remote/dot-web-face/latest/documentation/).

### Camera requirements

To get appropriate results using this component, the camera resolution on your device needs to be at least 720x720 pixels.

Supported browsers
The Face Auto Capture Component was tested with Chrome, Firefox, Edge, Safari, SafariVC, WebView and WKWebView. More information can be found [here](https://developers.innovatrics.com/digital-onboarding/technical/remote/dot-web-face/latest/documentation/#_supported_browsers).

## Installation

Installation of the components is available via NPM, PNPM or Yarn:

### Face Auto Capture Component

Using npm:

```bash
$ npm install @innovatrics/dot-face-auto-capture
```

Using yarn:

```bash
$ yarn add @innovatrics/dot-face-auto-capture
```

Using pnpm:

```bash
$ pnpm add @innovatrics/dot-face-auto-capture
```

### Document Auto Capture Component

Using npm:

```bash
$ npm install @innovatrics/dot-document-auto-capture
```

Using yarn:

```bash
$ yarn add @innovatrics/dot-document-auto-capture
```

Using pnpm:

```bash
$ pnpm add @innovatrics/dot-document-auto-capture
```

### Multi-Range Liveness Component

Using npm:

```bash
$ npm install @innovatrics/dot-multi-range-liveness
```

Using yarn:

```bash
$ yarn add @innovatrics/dot-multi-range-liveness
```

Using pnpm:

```bash
$ pnpm add @innovatrics/dot-multi-range-liveness
```


### Palm Auto Capture Component

```bash
$ npm install @innovatrics/dot-palm-capture
```

Using yarn:

```bash
$ yarn add @innovatrics/dot-palm-capture
```

Using pnpm:

```bash
$ pnpm add @innovatrics/dot-palm-capture
```

### MagnifEye Liveness Component

Using npm:

```bash
$ npm install @innovatrics/dot-magnifeye-liveness
```

Using yarn:

```bash
$ yarn add @innovatrics/dot-magnifeye-liveness
```

Using pnpm:

```bash
$ pnpm add @innovatrics/dot-magnifeye-liveness
```

### Smile Liveness Component

Using npm:

```bash
$ npm install @innovatrics/dot-smile-liveness
```

Using yarn:

```bash
$ yarn add @innovatrics/dot-smile-liveness
```

Using pnpm:

```bash
$ pnpm add @innovatrics/dot-smile-liveness
```

### Auto Capture UI Component

Using npm:

```bash
$ npm install @innovatrics/dot-auto-capture-ui
```

Using yarn:

```bash
$ yarn add @innovatrics/dot-auto-capture-ui
```

Using pnpm:

```bash
$ pnpm add @innovatrics/dot-auto-capture-ui
```

## Usage

The following components are [web components](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements) which use custom HTML tag.
Properties need to be passed into the component after the tag was rendered.

To learn more about the initial setup and usage of the components, head to the following developer portal pages:

- [Face Auto Capture Component developer portal](https://developers.innovatrics.com/digital-onboarding/technical/remote/dot-web-face/latest/documentation/#_usage)
- [Document Auto Capture Component developer portal](https://developers.innovatrics.com/digital-onboarding/technical/remote/dot-web-document/latest/documentation/#_usage)
- [Multi-Range Liveness Component developer portal](https://developers.innovatrics.com/digital-onboarding/technical/remote/dot-web-multi-range-liveness/latest/documentation/#_usage)
- [Palm Capture Component developer portal](https://developers.innovatrics.com/digital-onboarding/technical/remote/dot-web-palm/latest/documentation/)
- [MagnifEye Liveness Component developer portal](https://developers.innovatrics.com/digital-onboarding/technical/remote/dot-web-magnifeye-liveness/latest/documentation/#_usage)
- [Smile Liveness Component developer portal](https://developers.innovatrics.com/digital-onboarding/technical/remote/dot-web-smile-liveness/latest/documentation/#_usage)

## Changelogs

- [Face Auto Capture Component changelog](https://developers.innovatrics.com/digital-onboarding/technical/remote/dot-web-face/latest/documentation/#_changelog)
- [Document Auto Capture Component changelog](https://developers.innovatrics.com/digital-onboarding/technical/remote/dot-web-document/latest/documentation/#_changelog)
- [Multi-Range Liveness Component changelog](https://developers.innovatrics.com/digital-onboarding/technical/remote/dot-web-multi-range-liveness/latest/documentation/#_changelog)
- [Palm Auto Capture Component changelog](https://developers.innovatrics.com/digital-onboarding/technical/remote/dot-web-palm/latest/documentation/#_changelog)
- [MagnifEye Liveness Component changelog](https://developers.innovatrics.com/digital-onboarding/technical/remote/dot-web-magnifeye-liveness/latest/documentation/#_changelog)
- [Smile Liveness Component changelog](https://developers.innovatrics.com/digital-onboarding/technical/remote/dot-web-smile-liveness/latest/documentation/#_changelog)

## License

The following components are available under Innovatrics proprietary license (see License tab to read the T&C).

The components can be used in a freemium mode without a license agreement. However, please note that the free version includes a watermark overlay in the components.

To obtain a license agreement and use the component without the overlay, please contact us at support@innovatrics.com.
