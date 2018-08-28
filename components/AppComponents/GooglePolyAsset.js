/* @flow */

import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity
} from 'react-native';

export default class GooglePolyAsset extends Component {

  static defaultProps = {
    asset: { },
    onPress: () => { }
  }

  render() {
    return (
      <TouchableOpacity
        onPress={this.props.onPress}
        style={styles.container}
      >
        <Image
          source={{ uri: this.props.asset.thumbnail.url }}
          style={styles.imageStyle}
        />
        <Text style={styles.displayName}>{this.props.asset.displayName}</Text>
        <Text style={styles.authorName}>{this.props.asset.authorName}</Text>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 10
  },
  imageStyle: {
    width: 150,
    height: 150,
    borderRadius: 10
  },
  displayName: {
    fontWeight: 'bold'
  },
  authorName: {

  }
});
