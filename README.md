## Universal Camera Web Component

This is a platform independent web component that handles taking picture in browser both for face selfie and document photo scenario, both in landscape and in portrait, both for desktop with webcam and for mobile.

The component renders a video feed from the chosen camera and a button that allows user to take a picture. The component tries to open Full HD video stream, or the largest resolution available. The Full HD 1080p and 720p image resolution is suitable for further processing in DOT products. Higher resolution is useless, smaller than 720p is insufficient.

If component succeeds to open the environment camera (back side of mobile), the video stream is not mirrored. Fallback is the user camera (selfie). In case of user camera, the video stream is mirrored for better user experience, but the returned photo is not mirrored.

If present, the video feed will be also rendered with an overlay mask. Component requires 2 masks one for landscape and one for portrait, to prevent stretching of the mask when switching between modes. The component tries to detect the display orientation (necessary on mobile websites). Based on this, the appropriate mask is selected.

Pressing the button captures the image from the media stream and returns it in the required format as blob.

### Known supported browsers
This component was tested with:
* Chrome on desktop (Windows and Linux)
* Firefox on desktop (Windows and Linux)
* Chrome on Android
* Firefox on Android
* Safari on iPhone*

### Known issues
* currently the video feed does not react properly to rotation of mobile from landscape to portrait
* the component does not work with Chrome (or other browsers) on iPhone as iOS does not provide camera access to other browsers than Safari
* the responsivity has issues with Safari on iOS if it is reloaded more times within the same page

## Properties

```
cameraOptions: {
  imageType: 'jpg' | 'png';
  cameraFacing: 'environment' | 'user';
  landscapeMask?: string;
  portraitMask?: string;
  photoTakenCb: (image: string) => void;
  uiCustomisation: customisationType;
}
```

### cameraOptions
object: passes the properties to the component
### imageType
`jpg` or `png`: property that tells the component image type of the picture captured, defaults to png
### cameraFacing
`user` or `environment`: property that tells the component which camera to acquire from browser getUserMedia API, if there is no camera with chosen facing, browser may return a different facing camera. `user` refers to front-facing camera, `environment` means back-facing camera.
### landscapeMask
SVG image: optional property that passes the overlay mask to use when device is in landscape mode. If none is provided, no mask will be shown in landscape mode.
### portraitMask
SVG image: optional property that passes the overlay mask to use when device is in portrait mode. If none is provided, no mask will be shown in portrait mode.
### photoTakenCb
function: Callback that takes a single string argument, this function will be called when the component captures a picture, the argument `image` will contain a dataUri to the Blob of the image.
### uiCustomisation
customisationType: property that lets integrator customise theming of the component, currently supports changing colors used.

### customisationType

```
customisationType = {
  colors?: {
    dotCommonError?: string;
    dotFaceCaptureCircleOutline?: string;
    dotFaceCaptureBackgroundOverlay?: string;
  };
};
```
All properties in this type are optional, if a property is not present, default value will be used.

## Demo

to run the demo, just unpack the compiled .tgz and then run `npx http-server dist/` in the unpacked `package` folder