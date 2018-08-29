/* @flow */

import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Button
} from 'react-native';
import GooglePolyAsset from './GooglePolyAsset';

export default class SearchableGooglePolyAssetList extends Component {

  static defaultProps = {
    googlePoly: { },
    onCancelPress: () => { },
    onAssetPress: (asset) => { }
  }

  constructor(props) {
    super(props);
    this.state = {
      searchQuery: '',
      currentResults: this.props.googlePoly.currentResults,
    };
  }

  onSearchPress = () => {
    var keywords = this.state.searchQuery;
    this.props.googlePoly.setSearchParams(keywords);

    this.props.googlePoly.getSearchResults().then(function(assets) {
      this.setState({ currentResults: this.props.googlePoly.currentResults });
    }.bind(this));
  }

  onLoadMorePress = () => {
    this.props.googlePoly.getSearchResults().then(function (assets) {
      this.setState({ currentResults: this.props.googlePoly.currentResults });
    }.bind(this));
  }

  onSearchChangeText = (text) => {
    this.setState({ searchQuery: text });
  }

  renderSearchInput = () => {
    return (<TextInput
      style={styles.textInputStyle}
      placeholder="Search..."
      autoCapitalize="none"
      value={this.state.searchQuery}
      onChangeText={this.onSearchChangeText}
    />);
  }

  renderCurrentResults = () => {
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
        results.push(
          <GooglePolyAsset
            asset={this.state.currentResults[i]}
            key={i}
            onPress={this.props.onAssetPress}
          />
        );
        break;
      }
      const rowKey = `row_${i}`;
      const nextResult = this.state.currentResults[i + 1];
      results.push(
        <View style={{ flexDirection: 'row' }} key={rowKey}>
          <GooglePolyAsset
            asset={this.state.currentResults[i]}
            key={i}
            onPress={this.props.onAssetPress}
          />
          <GooglePolyAsset
            asset={nextResult}
            key={nextResult}
            onPress={this.props.onAssetPress}
          />
        </View>
      );
    }
    return (
      <View style={{ flex: 1, alignItems: 'center' }}>
        {results}
      </View>
    );
  }

  renderLoadMoreButton = () => {
    return (!this.props.googlePoly.nextPageToken)
        ? <View />
        : <Button title="Load more..." onPress={this.onLoadMorePress} />;
  }

  render() {
    return (
      <ScrollView style={{ paddingTop: 20 }}>
         {this.renderSearchInput()}
         <Button title="Search" onPress={this.onSearchPress} />
         {this.renderCurrentResults()}
         {this.renderLoadMoreButton()}
         <View style={{ paddingTop: 40 }} />
     </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textInputStyle: {
    borderWidth: 1,
    height: 40,
    marginHorizontal: 10,
    paddingHorizontal: 10
  }
});
