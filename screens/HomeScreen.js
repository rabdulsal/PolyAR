import React, { Component } from 'react';
import {
  Text,
  View,
  Button,
  TextInput,
  Image,
  ScrollView,
  Modal
} from 'react-native';
import Expo from 'expo';
import ExpoGraphics from 'expo-graphics';
import { AR, Asset, Permissions } from 'expo';
import ExpoTHREE, { AR as ThreeAR, THREE } from 'expo-three';
import { MaterialCommunityIcons as Icon } from 'react-native-vector-icons';
import GooglePoly from './../api/GooglePoly';
import ApiKeys from './../constants/ApiKeys';
import {
  SearchableGooglePolyAssetList,
  CustomARObject
} from '../components/AppComponents';
import TurkeyObject from './../assets/objects/TurkeyObject.json';


console.disableYellowBox = true;

export default class HomeScreen extends Component {

  constructor(props) {
    super(props);

    this.googlePoly = new GooglePoly(ApiKeys.GooglePoly);
    this.state = {
      searchModalVisible: false,
      currentAsset: TurkeyObject,
    };
  }

  onContextCreate = async ({ gl, scale, width, height }) => {
    // Initializer renderer....
    AR.setPlaneDetection(AR.PlaneDetectionTypes.Horizontal);
    AR.setPlaneDetection(AR.PlaneDetectionTypes.Vertical);
    this.renderer = new ExpoTHREE.Renderer({
      gl,
      pixelRatio: scale,
      width,
      height
    });

    // Initialize scene...
    this.scene = new THREE.Scene();
    this.scene.background = new ThreeAR.BackgroundTexture(this.renderer);

    // Initialize camera
    this.camera = new ThreeAR.Camera(width, height, 0.01, 1000);

    // Initialize lighting…
    const ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);
  }

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

  onRender = (delta) => {
    if (this.threeModel) {
      this.threeModel.rotation.x += 2 * delta;
      this.threeModel.rotation.y += 1.5 * delta;
    }

    this.renderer.render(this.scene, this.camera);
  }

  // **** TOUCHABLEVIEW METHOD *****
  // Called when `onPanResponderGrant` is invoked.
  onTouchesBegan = async ({ locationX: x, locationY: y }) => {
   if (!this.renderer) {
      return;
    }

    // Get the size of the renderer
    const size = this.renderer.getSize();
    console.log(`Size: ${size}`);

    // Invoke the native hit test method
    const { hitTest } = await AR.performHitTest(
      {
        x: x / size.width,
        y: y / size.height,
      },
      /* Result type from intersecting a horizontal
        plane estimate, determined for the current frame.
      */
      AR.HitTestResultTypes.HorizontalPlane
    );
    console.log(`X: ${hitTest.x} Y: ${hitTest.y}`);
    // Traverse the test results
    for (let hit of hitTest) {
      const { worldTransform } = hit;
      this.onAddObjectPress();
      console.log('Object added via hit-test');

      // Disable the matrix auto updating system
      this.threeModel.matrixAutoUpdate = false;

      /*
      Parse the matrix array: ex:
        [
          1,0,0,0,
          0,1,0,0,
          0,0,1,0,
          0,0,0,1
        ]
      */
      const matrix = new THREE.Matrix4();
      matrix.fromArray(worldTransform);
      //
      // // Manually update the matrix
      this.threeModel.applyMatrix(matrix);
      this.threeModel.updateMatrix();
    }
  }

  // ***************************

  onAddObjectPress = () => {
    // Remove the current object...
    this.onRemoveObjectPress();

    // Add the current object...
    GooglePoly.getThreeModel(this.state.currentAsset, function (object) {
      this.threeModel = object;
      ExpoTHREE.utils.scaleLongestSideToSize(object, 0.75);
      object.position.z = -3;
      this.scene.add(object);
    }.bind(this), function (error) {
      console.log(`Error: ${error}`);
    });
  }

  onRemoveObjectPress = () => {
    if (this.threeModel) {
      this.scene.remove(this.threeModel);
    }
  }

  onCancelPress = () => {
    this.setState({
      searchModalVisible: false
    });
  }

  onAssetPress = (asset) => {
    this.setState({
      currentAsset: asset
    });
    console.log(`Asset set: ${asset.displayName}`);
    this.setState({
      searchModalVisible: false
    });
  }

  onSearchModalPress = () => {
    this.setState({
      searchModalVisible: true
    });
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <CustomARObject
          onContextCreate={this.onContextCreate}
          onRender={this.onRender}
          onResize={this.onResize}
        />

        <View style={styles.stickyFloorView}>
          <View style={styles.stickyFloorSubview}>
            <Icon.Button
              size={40}
              name='plus'
              backgroundColor='transparent'
              onPress={this.onAddObjectPress}
            />
            <Icon.Button
              size={40}
              name='magnify'
              backgroundColor='transparent'
              onPress={this.onSearchModalPress}
            />
            <Icon.Button
              size={40}
              name='minus'
              backgroundColor='transparent'
              onPress={this.onRemoveObjectPress}
            />
          </View>
        </View>

        <Modal visible={this.state.searchModalVisible} animationType="slide">
          <SearchableGooglePolyAssetList
            googlePoly={this.googlePoly}
            onCancelPress={this.onCancelPress}
            onAssetPress={this.onAssetPress}
          />
        </Modal>
      </View>
    );
  }
}

const styles = {
  textInputStyle: {
    borderWidth: 1,
    height: 40,
    marginHorizontal: 10,
    borderRadius: 10,
    paddingHorizontal: 10
  },
  stickyFloorView: {
    position: 'absolute',
    bottom: 0,
    flex: 1,
    flexDirection: 'row'
  },
  stickyFloorSubview: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
};
