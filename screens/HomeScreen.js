import React from 'react';
import {
  Text,
  View,
} from 'react-native';
import { AR, Asset, Permissions } from 'expo';
import ExpoTHREE, { AR as ThreeAR, THREE } from 'expo-three';
import { View as GraphicsView } from 'expo-graphics';
import AssetUtils from 'expo-asset-utils';

console.disableYellowBox = true;

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  state = { permission: false };

  componentDidMount() {
    // Turn off extra warnings
    THREE.suppressExpoWarnings(true);
    ThreeAR.suppressWarnings();

    this.getPermission();
  }

  onContextCreate = async ({ gl, scale: pixelRatio, width, height }) => {
    // Initializer renderer....
    AR.setPlaneDetection(AR.PlaneDetectionTypes.Horizontal);
    AR.setPlaneDetection(AR.PlaneDetectionTypes.Vertical);
    this.renderer = new ExpoTHREE.Renderer({
      gl,
      pixelRatio,
      width,
      height
    });
    this.renderer.gammaInput = true;
    this.renderer.gammaOutput = true;
    this.renderer.shadowMap.enabled = true;
    this.renderer.physicallyCorrectLights = true;
    this.renderer.toneMapping = THREE.ReinhardToneMapping;
    // For very bright scenes.
    // this.renderer.toneMappingExposure = Math.pow(0.68, 5.0);

    // Initialize scene...
    this.scene = new THREE.Scene();
    this.scene.background = new ThreeAR.BackgroundTexture(this.renderer);

    // Initialize camera
    this.camera = new ThreeAR.Camera(width, height, 0.1, 1000);

    // Initialize lighting…
    const ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);

    // ARPoint Light....
    this.arPointLight = new ThreeAR.Light();
    this.arPointLight.position.y = 2;
    this.scene.add(this.arPointLight);

    this.shadowLight = this.getShadowLight();
    this.scene.add(this.shadowLight);
    this.scene.add(this.shadowLight.target);

    // Dynamic Light....
    const point = new ThreeAR.Light();
    point.position.y = 2;
    point.update();

    // Texturing....
    const diffuseAsset = await AssetUtils.resolveAsync(
    'https://github.com/mrdoob/three.js/blob/master/examples/textures/brick_diffuse.jpg?raw=true'
    );

    const diffuse = await ExpoTHREE.loadAsync(diffuseAsset);
    diffuse.wrapS = THREE.RepeatWrapping;
    diffuse.wrapT = THREE.RepeatWrapping;
    diffuse.anisotropy = 4;
    diffuse.repeat.set(1, 1);

    const bumpAsset = await AssetUtils.resolveAsync(
    'https://github.com/mrdoob/three.js/blob/master/examples/textures/brick_bump.jpg?raw=true'
    );
    const bumpMap = await ExpoTHREE.loadAsync(bumpAsset);
    bumpMap.wrapS = THREE.RepeatWrapping;
    bumpMap.wrapT = THREE.RepeatWrapping;
    bumpMap.anisotropy = 4;
    bumpMap.repeat.set(1, 1);

    const roughnessAsset = await AssetUtils.resolveAsync(
    'https://github.com/mrdoob/three.js/blob/master/examples/textures/brick_roughness.jpg?raw=true'
    );

    const roughnessMap = await ExpoTHREE.loadAsync(roughnessAsset);
    roughnessMap.wrapS = THREE.RepeatWrapping;
    roughnessMap.wrapT = THREE.RepeatWrapping;
    roughnessMap.anisotropy = 4;
    roughnessMap.repeat.set(9, 0.5);

    const cubeMat = new THREE.MeshStandardMaterial({
      roughness: 0.7,
      color: 0xffffff,
      bumpScale: 0.002,
      metalness: 0.2,
      map: diffuse,
      bumpMap,
      roughnessMap,
    });

    // Make a cube
    const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    this.cube = new THREE.Mesh(geometry, cubeMat);
    this.cube.position.y = 0.05;
    this.cube.castShadow = true;

    this.magneticObject = new ThreeAR.MagneticObject();
    this.magneticObject.maintainScale = false;
    this.magneticObject.maintainRotation = false;

    // Shadow floor....
    this.shadowFloor = new ThreeAR.ShadowFloor({
      width: 1,
      height: 1,
      opacity: 0.6, // The shadow depth
    });
    this.magneticObject.add(this.shadowFloor);
    this.magneticObject.add(this.cube);
    this.scene.add(this.magneticObject);
  }

  getShadowLight = () => {
    // Shadow Light.....
    const light = new THREE.DirectionalLight(0xffffff, 0.6);
    light.castShadow = true;
    const shadowSize = 1;
    light.shadow.camera.left = -shadowSize;
    light.shadow.camera.right = shadowSize;
    light.shadow.camera.top = shadowSize;
    light.shadow.camera.bottom = -shadowSize;
    light.shadow.camera.near = 0.001;
    light.shadow.camera.far = 100;
    light.shadow.camera.updateProjectionMatrix();
    // default is 512
    light.shadow.mapSize.width = 512 * 2;
    light.shadow.mapSize.height = light.shadow.mapSize.width;
    return light;
  }

  // The normalized point on the screen that we want our object to stick to.
  screenCenter = new THREE.Vector2(0.5, 0.5);

  // When the phone rotates, or the view changes size, this method will be called.
  onResize = ({ x, y, scale, width, height }) => {
    // Let's stop the function if we haven't setup our scene yet
    if (!this.renderer) {
      return;
    }
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(scale);
    this.renderer.setSize(width, height);
  };

  onRender = () => {
    // This will make the points get more rawDataPoints from Expo.AR
    this.magneticObject.update(this.camera, this.screenCenter);

    this.arPointLight.update();

    this.shadowFloor.opacity = this.arPointLight.intensity;

    this.shadowLight.target.position.copy(this.magneticObject.position);
    this.shadowLight.position.copy(this.shadowLight.target.position);
    this.shadowLight.position.x += 0.1;
    this.shadowLight.position.y += 1;
    this.shadowLight.position.z += 0.1;

    this.renderer.render(this.scene, this.camera);
  }

  getPermission = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ permission: status === 'granted' });
  };

  render() {
    if (!this.state.permission) {
      return null;
    }

    return (
      <GraphicsView
        style={{ flex: 1 }}
        onContextCreate={this.onContextCreate}
        onRender={this.onRender}
        onResize={this.onResize}
        isArEnabled
        isArRunningStateEnabled
        isArCameraStateEnabled
        isShadowsEnabled
        arTrackingConfiguration={AR.TrackingConfigurations.World}
      />
    );
  }
}

const styles = {
  container: {
    paddingTop: 20
  }
};
