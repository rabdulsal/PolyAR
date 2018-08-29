import React, { Component } from 'react';
import {
  Text,
  View,
  Button,
  TextInput,
  Image,
  ScrollView
} from 'react-native';
import CustomARObject from '../components/AppComponents/CustomARObject';
import GooglePoly from './../api/GooglePoly';
import ApiKeys from './../constants/ApiKeys';
import { GooglePolyAsset } from '../components/AppComponents';
import TurkeyObject from './../assets/objects/TurkeyObject.json';

export default class HomeScreen extends Component {

  constructor(props) {
    super(props);

    this.googlePoly = new GooglePoly(ApiKeys.GooglePoly);
    this.googlePoly.getSearchResults('duck', '').then((assets) => {
      const json = JSON.stringify(assets[0]);
    });

    this.state = {
      searchQuery: '',
      currentResults: [],
    };
  }

  onSearchChangeText = (text) => {
    this.setState({ searchQuery: text });
  }

  onSearchPress = () => {
    const keyword = this.state.searchQuery;
    this.googlePoly.setSearchParams(keyword);
    this.googlePoly.getSearchResults().then(function (assets) {
      this.setState({ currentResults: this.googlePoly.currentResults });
    }.bind(this));
  }

  onLoadMorePress = () => {
    this.googlePoly.getSearchResults().then(function (assets) {
      console.log(assets);
      this.setState({ currentResults: this.googlePoly.currentResults });
    }.bind(this));
  }

  renderCurrentResults() {
    if (this.state.currentResults.length === 0) {
      return (
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text>No results</Text>
        </View>
      );
    }

    const results = [];
    const resultsCount = this.state.currentResults.length;
    for (let i = 0; i < resultsCount; i++) {
      if (i === resultsCount - 1) {
        results.push(<GooglePolyAsset asset={this.state.currentResults[i]} key={i} />);
        break;
      }
      const rowKey = `row_${i}`;
      const nextResult = this.state.currentResults[i + 1];
      results.push(
        <View style={{ flexDirection: 'row' }} key={rowKey}>
          <GooglePolyAsset asset={this.state.currentResults[i]} key={i} />
          <GooglePolyAsset asset={nextResult} key={nextResult} />
        </View>
      );
    }
    return (
      <View style={{ flex: 1, alignItems: 'center' }}>
        {results}
      </View>
    );
  }

  render() {
    return (
      <ScrollView style={{ paddingTop: 20 }}>
        <TextInput
          style={{ borderWidth: 1, height: 40 }}
          placeholder="Search..."
          value={this.state.searchQuery}
          onChangeText={this.onSearchChangeText}
        />
        <Button title="Search" onPress={this.onSearchPress} />
        {this.renderCurrentResults()}
        {
          (this.state.currentResults.length === 0)
          ? <View />
          : <Button title="Load More" onPress={this.onLoadMorePress} />
        }
        <View style={{ paddingTop: 40 }} />
      </ScrollView>
      // <CustomARObject />
    );
  }
}
