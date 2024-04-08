import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const Map = ({ posts }) => {
  const imagesOnMap = [
    {
      id: '1',
      latitude: 41.38268,
      longitude: 2.17702,
      uri: require('../../assets/1.jpg'), 
      text: 'Barcelona'
    },
    {
      id: '2',
      latitude: 48.85679,
      longitude: 2.35108,
      uri: require('../../assets/2.jpg'), 
      text: 'Paris'
    },
    {
      id: '3',
      latitude: 56.79687,
      longitude: -5.00358,
      uri: require('../../assets/3.jpg'), 
      text: 'Ben Nevis'
    },
    {
      id: '4',
      latitude: 55.94982,
      longitude: -3.19030,
      uri: require('../../assets/4.jpg'), 
      text: 'Edinburghs'
    },
    {
      id: '5',
      latitude: 51.50335,
      longitude: -0.07940,
      uri: require('../../assets/5.jpg'), 
      text: 'Londun'
    },

  ];
  console.log('Posts:', posts);
  const [selectedPost, setSelectedPost] = useState(null);
  const initialRegion = posts.length > 0 ? {
    latitude: posts[0].location.latitude,
    longitude: posts[0].location.longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  } : {
    latitude: 54.237933,
    longitude: -3.435973,
    latitudeDelta: 8.5,
    longitudeDelta: 8.5,
  };
  
  const renderMarkers = () => {
    return posts.map((post, index) => {
      if (!post.location || post.location.lat === null || post.location.lng === null) {
        console.log('Post with invalid location:', post);
        return null;
      }

    
      return (
        <Marker
          key={index}
          coordinate={{
            latitude: post.location.latitude,
            longitude: post.location.longitude
          }}
          title={post.text}
          description={`Posted on: ${new Date(post.timestamp).toLocaleDateString()}`}
          onPress={() => setSelectedPost(post)} // 点击时更新选中的帖子
        >
          <View style={styles.customMarkerView}>
            {post.images && post.images.length > 0 && (
              <Image
                source={{ uri: post.images[0].uri }}
                style={styles.customMarkerImage}
              />
            )}
          </View>
        </Marker>
      );
    });
    
  };
  const renderStaticImageMarkers = () => {
    return imagesOnMap.map((image) => (
      <Marker
        key={image.id}
        coordinate={{
          latitude: image.latitude,
          longitude: image.longitude,
        }}
        title={image.text}
      >
        <View style={styles.customMarkerView}>
          <Image
            source={image.uri}
            style={styles.customMarkerImage}
            resizeMode="cover"
          />
          <Text style={styles.markerText}>{image.text}</Text>
        </View>
      </Marker>
    ));
  };
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        onRegionChangeComplete={(region) => {
          if (!selectedPost) return;
          // 如果有选中的帖子，地图区域变化时定位到该帖子
          if (region.latitude.toFixed(4) === selectedPost.location.latitude.toFixed(4) &&
              region.longitude.toFixed(4) === selectedPost.location.longitude.toFixed(4)) return;
          setSelectedPost(null); // 清除选中的帖子
        }}
      >
        {renderMarkers()}
        {renderStaticImageMarkers()}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerImage: {
    width: 40,
    height: 40,
    borderRadius: 15,
  },
  markerText: {
    width: 100, 
    textAlign: 'center', 
  },  
  markerLayout: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  customMarkerView: {
    width: 80, 
    height: 80, 
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white', 
    borderRadius: 30, 
    borderColor: 'grey',
    borderWidth: 1,
  },
  customMarkerImage: {
    width: 100,
    height: 100, 
    borderRadius: 15, 
  },
});

export default Map;
