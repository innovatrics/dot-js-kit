import { h, render, FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';
import { customisationType } from './theme';
import LandscapeFaceMask from './components/img/mask_face_lndscp.svg';
import PortraitFaceMask from './components/img/mask_face_prtr.svg';
import LandscapeDocumentMask from './components/img/mask_card_lndscp.svg';
import PortraitDocumentMask from './components/img/mask_card_prtr.svg';
import './main';

declare module 'preact/src/jsx' {
  //TODO: fix the type declaration, should probably be a part of the element itself.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSXInternal {
    // import HTMLAttributes = JSXInternal.HTMLAttributes;

    interface IntrinsicElements {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      'x-face-capture': any; // HTMLAttributes<FaceCaptureElement>;
    }

    interface FaceCaptureElement extends HTMLElement {
      imageType: 'png' | 'jpg';
      cameraFacing: 'user' | 'environment';
      landscapeMask: string;
      portraitMask: string;
      photoTakenCb: (image: string) => void;
      uiCustomisation: customisationType;
    }
  }
}

const mountElement = document.querySelector('#app');

if (mountElement == null) {
  throw new Error('#app div not found :(');
}

type Props = {
  imageType: 'png' | 'jpg';
  cameraFacing: 'user' | 'environment';
  uiCustomisation: customisationType;
  isLandscape: boolean;
  landscapeMask: string;
  portraitMask: string;
  photoTakenCb: (data: string) => void;
};

// https://css-tricks.com/3-approaches-to-integrate-react-with-custom-elements/
// https://coryrylan.com/blog/using-web-components-in-react
// https://www.robinwieruch.de/react-web-components
// https://reactjs.org/docs/web-components.html
const FaceCamera: FunctionalComponent<Props> = (props: Props) => {
  console.log('demo face camera props: ', props);
  return <x-face-capture cameraOptions={props} />;
};

const DocumentCamera: FunctionalComponent<Props> = (props: Props) => {
  console.log('demo document camera props: ', props);
  return <x-face-capture cameraOptions={props} />;
};

const Page = () => {
  type FacingMode = 'environment' | 'user';
  const [showing, setShowing] = useState('hub');
  const [facing, setFacing] = useState('user' as FacingMode);
  const [imageTaken, setImage] = useState<Blob>((null as unknown) as Blob);

  const handleFacePhotoTaken = async (image: string) => {
    const res = await fetch(image);
    const blob = await res.blob();

    setImage(blob);

    setShowing('imageData');

    console.log('photo taken');
  };

  const handleDocumentPhotoTaken = async (image: string) => {
    const res = await fetch(image);
    const blob = await res.blob();

    setImage(blob);

    setShowing('imageData');

    console.log('photo taken');
  };

  const uiCustomisation: customisationType = {
    colors: {
      dotFaceCaptureCircleOutline: 'gold',
    },
  };

  return (
    <div>
      {showing == 'hub' ? (
        <div>
          pick a component <br />
          <a
            onClick={(event) => {
              event.preventDefault();
              setShowing('selfie');
            }}
            href="#"
          >
            {' '}
            selfie
          </a>
          &nbsp;
          <a
            onClick={(event) => {
              event.preventDefault();
              setShowing('document');
            }}
            href="#"
          >
            document
          </a>
        </div>
      ) : showing == 'selfie' ? (
        <div>
          <select
            onChange={(event) => {
              setFacing((event.target as HTMLOptionElement).value as FacingMode);
            }}
          >
            <option value="user"> selfie camera </option>
            <option value="environment"> environment camera </option>
          </select>
          <FaceCamera
            imageType="png"
            isLandscape={false}
            cameraFacing={facing}
            uiCustomisation={uiCustomisation}
            photoTakenCb={handleFacePhotoTaken}
            landscapeMask={LandscapeFaceMask}
            portraitMask={PortraitFaceMask}
          />
        </div>
      ) : showing == 'document' ? (
        <DocumentCamera
          imageType="png"
          isLandscape
          cameraFacing={'environment'}
          uiCustomisation={uiCustomisation}
          photoTakenCb={handleDocumentPhotoTaken}
          landscapeMask={LandscapeDocumentMask}
          portraitMask={PortraitDocumentMask}
        />
      ) : showing == 'imageData' ? (
        <div>
          <a
            onClick={(event) => {
              event.preventDefault();
              setShowing('hub');
            }}
            href="#"
          >
            go back
          </a>
          <br />
          <img src={window.URL.createObjectURL(imageTaken)} />
          <br />
        </div>
      ) : (
        <span>invalid page selected.</span>
      )}
    </div>
  );
};

const App = <Page />;

render(App, mountElement);
