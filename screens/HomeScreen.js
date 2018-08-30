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
import CustomARObject from '../components/AppComponents/CustomARObject';
import GooglePoly from './../api/GooglePoly';
import ApiKeys from './../constants/ApiKeys';
import { SearchableGooglePolyAssetList } from '../components/AppComponents';
import TurkeyObject from './../assets/objects/TurkeyObject.json';

export default class HomeScreen extends Component {

  constructor(props) {
    super(props);

    this.googlePoly = new GooglePoly(ApiKeys.GooglePoly);
    this.state = {
      searchModalVisible: false,
      currentAsset: TurkeyObject,
    };
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

    // Initialize lighting…
    const ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);
  }

  onRender = (delta) => {
    if (this.threeModel) {
      this.threeModel.rotation.x += 2 * delta;
      this.threeModel.rotation.y += 1.5 * delta;
    }

    this.renderer.render(this.scene, this.camera);
  }

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
        />

        <Button title="Add Object" onPress={this.onAddObjectPress} />
        <Button title="Search" onPress={this.onSearchModalPress} />

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
  }
};
