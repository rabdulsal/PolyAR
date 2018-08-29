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
import ExpoTHREE, { THREE } from 'expo-three';
import ExpoGraphics from 'expo-graphics';
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

  onRender = (delta) => {
    if (this.turkey) {
      this.turkey.rotation.x += 2 * delta;
      this.turkey.rotation.y += 1.5 * delta;
    }
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
      console.log(error);
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
      // <CustomARObject />
      <View style={{ flex: 1 }}>
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
