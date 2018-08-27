import React from 'react';
import {
  Text,
  View,
} from 'react-native';
import { AR } from 'expo';
import ExpoTHREE, { AR as ThreeAR, THREE } from 'expo-three';
import { View as GraphicsView } from 'expo-graphics';

console.disableYellowBox = true;

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  componentDidMount() {
    // Turn off extra warnings
    THREE.suppressExpoWarnings(true);
    ThreeAR.suppressWarnings();
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

    // Initialize scene...
    this.scene = new THREE.Scene();
    this.scene.background = new ThreeAR.BackgroundTexture(this.renderer);

    // Initialize camera
    this.camera = new ThreeAR.Camera(width, height, 0.1, 1000);

    // Make a cube
    const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    // Color material
    const material = new THREE.MeshPhongMaterial({
      color: 0xff00ff
    });
    this.cube = new THREE.Mesh(geometry, material);
    this.cube.position.z = -0.4;
    this.scene.add(this.cube);

    // Initialize lighting…
    const ambientLight = new THREE.AmbientLight(0xaaaaaa);
    this.scene.add(ambientLight);
  }

  onRender = () => {
    this.renderer.render(this.scene, this.camera);
  }

  render() {
    return (
      <GraphicsView
        style={{ flex: 1 }}
        onContextCreate={this.onContextCreate}
        onRender={this.onRender}
        isArEnabled
        arTrackingConfiguration={AR.TrackingConfigurations.World}
        isArRunningStateEnabled
        isArCameraStateEnabled
      />
    );
  }
}

const styles = {
  container: {
    paddingTop: 20
  }
};
