import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AddPost from './src/screens/AddPost';
import HomeScreen from './src/screens/HomeScreen';
import Map from './src/screens/Map';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
const Tab = createBottomTabNavigator();

export default function App() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const loadPosts = async () => {
      const postsData = await AsyncStorage.getItem('posts');
      const parsedPosts = postsData ? JSON.parse(postsData) : [];
      setPosts(parsedPosts);
    };

    loadPosts();
  }, []);

  const addPost = (newPost) => {
    const updatedPosts = [...posts, newPost];
    setPosts(updatedPosts);
    AsyncStorage.setItem('posts', JSON.stringify(updatedPosts));
  };

  const deletePost = (postId) => {
    const updatedPosts = posts.filter((post) => post.id !== postId);
    setPosts(updatedPosts);
    AsyncStorage.setItem('posts', JSON.stringify(updatedPosts));
  };
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused ? 'ios-home' : 'ios-home-outline';
            } else if (route.name === 'AddPost') {
              iconName = focused ? 'ios-add-circle' : 'ios-add-circle-outline';
            } else if (route.name === 'Map') {
              iconName = focused ? 'ios-map' : 'ios-map-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ focused, color, size }) => {
              let iconName = focused ? 'home' : 'home-outline';
              return <Ionicons name={iconName} size={size} color={color} />;
            },
          }}
        />
        <Tab.Screen name="AddPost" options={{
          tabBarIcon: ({ focused, color, size }) => {
            let iconName = focused ? 'add-circle' : 'add-circle-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        }}>
          {() => <AddPost addPost={addPost} deletePost={deletePost} posts={posts} />}
        </Tab.Screen>
        <Tab.Screen name="Map" options={{
          tabBarIcon: ({ focused, color, size }) => {
            let iconName = focused ? 'map' : 'map-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        }}>
          {() => <Map posts={posts} />} 
        </Tab.Screen>

      </Tab.Navigator>
    </NavigationContainer>
  );
}
