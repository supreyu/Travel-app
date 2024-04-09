import React, { useState, useEffect, useRef } from 'react';
import { Linking, TouchableOpacity, FlatList, StyleSheet, TextInput, View, Button, ScrollView, Text, Image, Modal, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import ImageViewer from 'react-native-image-zoom-viewer';
import { Camera } from 'expo-camera';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { Video } from 'expo-av';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as Sharing from 'expo-sharing';
import * as Contacts from 'expo-contacts';



export default function AddPost(props) {
    const [text, setText] = useState('');
    const [posts, setPosts] = useState([]);
    const [images, setImages] = useState([]);
    const [location, setLocation] = useState(null);
    const [isViewerVisible, setIsViewerVisible] = useState(false);
    const [currentImageUrls, setCurrentImageUrls] = useState([]);
    const [editablePostId, setEditablePostId] = useState(null);
    const [editableText, setEditableText] = useState("");
    const [city, setCity] = useState('');
    const [isVideoMode, setIsVideoMode] = useState(false);
    const cameraRef = useRef(null);
    const [isCameraVisible, setIsCameraVisible] = useState(false);
    const [isVideoPlayerVisible, setIsVideoPlayerVisible] = useState(false);
    const [currentVideoUri, setCurrentVideoUri] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isContactsModalVisible, setIsContactsModalVisible] = useState(false);
    const [contacts, setContacts] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const { addPost, deletePost } = props;
    useEffect(() => {
        loadPosts();
        requestPermissions();
    }, []);
    useEffect(() => {
        console.log('当前 images 状态:', images);
    }, [images]);
    const requestPermissions = async () => {
        // 请求相册权限
        await ImagePicker.requestMediaLibraryPermissionsAsync();
        // 请求相机权限
        await ImagePicker.requestCameraPermissionsAsync();
        await Contacts.requestPermissionsAsync();
        // 请求地理位置权限
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            alert('Permission to access location was denied');
            return;
        }
        let loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);

        const reverseGeocode = await Location.reverseGeocodeAsync(loc.coords);
        if (reverseGeocode && reverseGeocode.length > 0) {
            const city = reverseGeocode[0].city;
            setCity(city);
        }
    };



    const pickMedia = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
        if (!result.cancelled && result.assets && result.assets.length > 0) {
            console.log(result.assets[0]);
            // 获取媒体类型和URI
            result.assets.forEach(asset => {
                const mediaType = asset.type; // 'image' 或 'video'
                setImages(prevImages => [...prevImages, { uri: asset.uri, type: mediaType }]);
            });
        } else {
            console.log('The selected media file was canceled or the URI does not exist');
        }
    };





    const takePhotoOrVideo = async () => {
        // 请求权限...
        const { status } = await Camera.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            alert('We need camera permissions!');
            return;
        }

        if (isVideoMode) {
            if (!cameraRef.current) return; // 如果没有获取到相机引用，直接返回

            // 如果当前已经在录像，则停止录像
            if (isRecording) {
                cameraRef.current.stopRecording(); // 停止录像
                setIsRecording(false); // 更新录像状态
            } else {
                // 开始录像
                setIsRecording(true); // 更新录像状态
                const video = await cameraRef.current.recordAsync();
                setImages(prevImages => [...prevImages, { uri: video.uri, type: 'video' }]);
                setIsCameraVisible(false); // 关闭相机界面
                setIsRecording(false); // 重置录像状态
            }

        } else {
            if (cameraRef.current) {
                const photo = await cameraRef.current.takePictureAsync();
                setImages(prevImages => [...prevImages, { uri: photo.uri, type: 'image' }]);
                setIsCameraVisible(false); // 关闭相机界面
            }
        }
    };



    const handleSubmit = async () => {
        // 提取 images 数组中每个元素的 uri 字段
        const imagesUris = images.map(image => image.uri).filter(uri => !!uri);

        if (images.length > 0 && imagesUris.length === 0) {
            alert('One or more media items are invalid and cannot be saved.');
            return; 
        }
        const currentTime = new Date();
        const newPost = {
            text,
            images,
            location,
            city,
            id: Date.now(),
            timestamp: currentTime,
        };
        addPost(newPost);
        try {
            const updatedPosts = [...posts, newPost];
            console.log('Posts after adding new post:', updatedPosts);
            setPosts(updatedPosts);
            await AsyncStorage.setItem('posts', JSON.stringify(updatedPosts));
            console.log('Posts updated successfully', updatedPosts);
            Alert.alert("Success", "Post published successfully!", `Published on: ${currentTime.toLocaleString()}`);

            setText('');
            setImages([]);
        } catch (error) {
            console.error(error);
        }
    };


    const loadPosts = async () => {
        const postsData = await AsyncStorage.getItem('posts');
        const parsedPosts = postsData ? JSON.parse(postsData) : [];
        setPosts(parsedPosts); // 更新状态
    };


    const handleDeletePost = async (postId) => {
        // 弹出确认对话框
        Alert.alert(
            "Confirm Delete",
            "Are you sure you want to delete this post?",
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel"
                },
                {
                    text: "Yes",
                    onPress: async () => {
                        // 用户确认后执行的删除逻辑
                        const updatedPosts = posts.filter(post => post.id !== postId);
                        setPosts(updatedPosts);
                        await AsyncStorage.setItem('posts', JSON.stringify(updatedPosts));
                    }
                }
            ],
            { cancelable: false } // 防止用户点击对话框外部取消
        );
    };



    const saveImageToLocal = async (imageUri) => {
        try {
            // 请求相册保存权限
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== "granted") {
                alert("We need permissions to save images to your device.");
                return;
            }

            // 下载图片到临时文件，然后保存到相册
            const asset = await MediaLibrary.createAssetAsync(imageUri);
            await MediaLibrary.createAlbumAsync("Download", asset, false);
            alert("Image saved to your device.");
        } catch (error) {
            console.error("Error saving image: ", error);
            alert("Failed to save image.");
        }
    };

    // 获取联系人的函数
    const loadContacts = async () => {
        const { status } = await Contacts.requestPermissionsAsync();
        if (status === 'granted') {
            const { data } = await Contacts.getContactsAsync({
                fields: [Contacts.Fields.Emails],
            });

            if (data.length > 0) {
                setContacts(data);
            }
        }
    };
    //分享
    const sharePost = async (post) => {
        setSelectedPost(post);
        await loadContacts();
        setIsContactsModalVisible(true);
    };
    const shareWithContact = async (post, contact) => {
        try {
            // 现在分享，这里的post是用户选中的帖子
            await Sharing.shareAsync(post.images[0].uri, {
                dialogTitle: `Share ${contact.name}'s post`,
                UTI: 'public.jpeg',
            });
        } catch (error) {
            alert('Unable to share the post. Error: ' + error.message);
        }
    };

    // 定义一个状态来存储当前正在编辑的帖子的 id
    const [editingPostId, setEditingPostId] = useState(null);
    // 定义一个状态来存储正在编辑的文本
    const [editingText, setEditingText] = useState('');
    const startEditing = (post) => {
        setEditingPostId(post.id);
        setEditingText(post.text);
        // 可以在这里设置其他需要编辑的字段
    };
    const saveEdit = async () => {
        const updatedPosts = posts.map(post => {
            if (post.id === editablePostId) {
                return { ...post, text: editableText };
            }
            return post;
        });

        setPosts(updatedPosts);
        await AsyncStorage.setItem('posts', JSON.stringify(updatedPosts));
        setEditablePostId(null); // 重置编辑状态
        setEditableText(''); // 清空编辑文本
    };

    const savePostText = (postId) => {
        const updatedPosts = posts.map((post) => {
            if (post.id === postId) {
                return { ...post, text: editableText };
            }
            return post;
        });

        setPosts(updatedPosts);
        setEditablePostId(null); // 退出编辑模式
        setEditableText(""); // 重置编辑文本

        // 保存更新后的帖子到本地存储
        AsyncStorage.setItem('posts', JSON.stringify(updatedPosts));
    };
    //联系人
    const getContacts = async () => {
        const { status } = await Contacts.requestPermissionsAsync();
        if (status === 'granted') {
            const { data } = await Contacts.getContactsAsync({
                fields: [Contacts.Fields.Emails],
            });

            if (data.length > 0) {
                console.log(data); // 这里是联系人的数组
            }
        }
    };
    //谷歌地图
    const openMap = () => {
        if (location) {
          const latitude = location.latitude;
          const longitude = location.longitude;
          const label = encodeURI(city || "Unknown Location"); // 使用从逆地理编码获取的城市名称或默认值
          const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}&query_place_id=${label}`;
          Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
        } else {
          alert('Location is not available.');
        }
      };
    return (

        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container}>
                <TextInput
                    style={[styles.input, { marginTop: 20 }]}
                    multiline
                    numberOfLines={4}
                    onChangeText={setText}
                    value={text}
                    placeholder="Share your travel stories..."
                />
                <View style={styles.imagePicker}>
                    <MaterialIcons.Button
                        name="photo-library"
                        backgroundColor="transparent"
                        onPress={pickMedia}
                        color="black"
                    >
                        Choose from Album
                    </MaterialIcons.Button>

                    <MaterialIcons.Button
                        name="camera-alt"
                        backgroundColor="transparent"
                        color="black"
                        onPress={() => setIsCameraVisible(true)}
                    >
                        Camera
                    </MaterialIcons.Button>
                </View>
                <View style={styles.imagePreview}>
                    {images.slice(0, 9).map((media, index) => { // 确保不超过9张图片
                        if (!media.uri) {
                            console.log('Image URI is undefined, index:', index);
                            return null;
                        }
                        return (
                            <View key={index} style={styles.imageContainer}>
                                {media.type === 'image' ? (
                                    <Image source={{ uri: media.uri }} style={styles.image} />
                                ) : (
                                    // 使用expo-av的Video组件来渲染视频
                                    <Video
                                        source={{ uri: media.uri }}
                                        rate={1.0}
                                        volume={1.0}
                                        isMuted={false}
                                        resizeMode="cover"
                                        shouldPlay={true} // 让视频加载后自动播放
                                        isLooping
                                        useNativeControls
                                        style={styles.video}
                                    />

                                )}
                                <TouchableOpacity
                                    style={styles.deleteIcon}
                                    onPress={() => {
                                        const newImages = images.filter((_, i) => i !== index);
                                        setImages(newImages);
                                    }}
                                >
                                    <Text style={styles.deleteText}>X</Text>
                                </TouchableOpacity>
                            </View>
                        );

                    })}

                </View>

                <TouchableOpacity style={styles.postButton} onPress={handleSubmit}>
                    <Text style={styles.postButtonText}>Post</Text>
                </TouchableOpacity>

                {posts.map((post, index) => (
                    <View key={post.id} style={styles.post}>
                        {/* 发布时间 */}
                        <Text style={styles.timestamp}>
                            {new Date(post.timestamp).toLocaleString()}
                        </Text>
                        {/* 判断是否处于编辑状态以显示输入框或帖子文本 */}
                        {editablePostId === post.id ? (
                            <TextInput
                                style={styles.input}
                                onChangeText={(text) => setEditableText(text)}
                                value={editableText}
                                multiline
                            />
                        ) : (
                            <Text style={styles.postText}>{post.text}</Text>

                        )}
                        <View style={styles.postImagesContainer}>
                            {post.images && post.images.slice(0, 9).map((media, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    onPress={() => {
                                        if (media.type === 'video') {
                                            setCurrentVideoUri(media.uri);
                                            setIsVideoPlayerVisible(true); // 显示全屏视频播放模态
                                        } else if (media.type === 'image') {
                                            setCurrentImageUrls([{ url: media.uri }]);
                                            setIsViewerVisible(true);
                                        }


                                    }}
                                    style={styles.postImageContainer}
                                >
                                    {media.type === 'image' ? (
                                        <Image source={{ uri: media.uri }} style={styles.postImage} />
                                    ) : media.type === 'video' ? (
                                        <Video
                                            source={{ uri: media.uri }}
                                            rate={1.0}
                                            volume={1.0}
                                            isMuted={false}
                                            resizeMode="cover"
                                            shouldPlay={false}
                                            isLooping
                                            useNativeControls
                                            style={styles.postVideo}
                                        />
                                    ) : null}
                                </TouchableOpacity>
                            ))}
                        </View>

                        {post.location && (
                            <Text style={styles.location} onPress={openMap}>
                                Location: {post.city ? `${post.city}  ` : ''}{post.location.latitude}, {post.location.longitude}
                            </Text>
                        )}
                        <View style={styles.buttonContainer}>
                            {editablePostId === post.id ? (
                                <MaterialIcons.Button
                                    name="save"
                                    backgroundColor="transparent"
                                    color="black"
                                    onPress={() => savePostText(post.id)}>
                                    Save
                                </MaterialIcons.Button>
                            ) : (
                                <>
                                    <MaterialIcons.Button
                                        name="delete"
                                        backgroundColor="transparent"
                                        color="#ff0000"
                                        onPress={() => handleDeletePost(post.id)}>
                                        Delete
                                    </MaterialIcons.Button>

                                    <MaterialIcons.Button
                                        name="edit"
                                        backgroundColor="transparent"
                                        color="black"
                                        onPress={() => {
                                            setEditablePostId(post.id);
                                            setEditableText(post.text);
                                        }}>
                                        Edit
                                    </MaterialIcons.Button>
                                    <MaterialIcons.Button
                                        name="share"
                                        backgroundColor="transparent"
                                        color="black"
                                        onPress={() => sharePost(post)}
                                    >
                                        Share
                                    </MaterialIcons.Button>
                                </>
                            )}
                        </View>
                        <Modal
                            visible={isContactsModalVisible}
                            onRequestClose={() => setIsContactsModalVisible(false)}
                        >
                            <FlatList
                                data={contacts}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => {
                                            setIsContactsModalVisible(false); // 用户选择后关闭Modal

                                            shareWithContact(selectedPost, item); // 这是一个单独的函数，用于处理分享逻辑
                                        }}
                                    >
                                        <Text>{item.name}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </Modal>
                    </View>
                ))}
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={isVideoPlayerVisible}
                    onRequestClose={() => {
                        setIsVideoPlayerVisible(!isVideoPlayerVisible);
                    }}
                >
                    <View style={styles.fullScreenVideoContainer}>
                        {currentVideoUri && (
                            <Video
                                source={{ uri: currentVideoUri }}
                                rate={1.0}
                                volume={1.0}
                                isMuted={false}
                                resizeMode="contain"
                                shouldPlay
                                isLooping
                                useNativeControls
                                style={styles.fullScreenVideo}
                            />
                        )}
                        <TouchableOpacity
                            onPress={() => setIsVideoPlayerVisible(false)}
                            style={styles.closeVideoButton}
                        >
                            <Text style={styles.buttonText}>Close Video</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
            </ScrollView>
            <Modal visible={isViewerVisible} transparent={true} onRequestClose={() => setIsViewerVisible(false)}>
                <ImageViewer
                    imageUrls={currentImageUrls}
                    enableSwipeDown={true}
                    onSwipeDown={() => setIsViewerVisible(false)}
                    onLongPress={(image) => {
                        Alert.alert(
                            "Save Image",
                            "Do you want to save this image to your device?",
                            [
                                {
                                    text: "Cancel",
                                    onPress: () => console.log("Cancel Pressed"),
                                    style: "cancel"
                                },
                                { text: "Save", onPress: () => saveImageToLocal(image.url) }
                            ],
                            { cancelable: false }
                        );
                    }}
                />
            </Modal>
            <Modal
                visible={isCameraVisible}
                onRequestClose={() => setIsCameraVisible(false)}
                animationType="slide"
            >
                <Camera
                    style={styles.camera}
                    type={Camera.Constants.Type.back}
                    ref={cameraRef}
                >
                    <View style={styles.cameraControl}>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => setIsVideoMode(!isVideoMode)}
                        >
                            <Text style={styles.buttonText1}>
                                {isVideoMode ? "Switch to photo mode" : "Switch to video recording mode"}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.button2}
                            onPress={takePhotoOrVideo}
                        >
                            <Ionicons name="camera" size={24} color="black" />
                        </TouchableOpacity>
                    </View>

                </Camera>
            </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        marginBottom: 20,
        borderRadius: 6,
        marginTop: 20,
    },
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        padding: 16,
    },
    post: {
        padding: 10,
        marginTop: 10,
        backgroundColor: '#f8f8f8',
        borderRadius: 5,
    },
    imagePicker: {
        marginBottom: 15,
    },
    imagePreview: {
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    image: {
        width: '100%',
        aspectRatio: 1,
        marginBottom: 2,
    },
    imageContainer: {
        position: 'relative',
        width: '32%',
        margin: '0.5%',
        aspectRatio: 1,
        marginBottom: 2,
    },
    deleteIcon: {
        position: 'absolute',
        right: 0,
        top: 0,
        backgroundColor: 'red',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteText: {
        color: 'white',
        fontWeight: 'bold',
    },
    postImagesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        marginVertical: 8,

    },
    postImageContainer: {
        width: '32%',
        aspectRatio: 1,
        margin: '0.5%',
        marginBottom: 4,
    },
    postImage: {
        width: '100%',
        height: '100%',
    },
    location: {
        fontSize: 12,
        color: '#888',
        marginTop: 8,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 8,
    },
    video: {
        width: '100%',
        aspectRatio: 1,
    },
    camera: {
        flex: 1,
    },
    cameraControl: {
        flex: 1,
        backgroundColor: 'transparent',
        flexDirection: 'row',
        margin: 20,
    },
    button: {
        alignSelf: 'flex-end',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    buttonText1: {
        fontSize: 18,
        color: 'black',
    },
    postVideo: {
        width: '100%',
        height: '100%',
    },
    fullScreenVideoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
    },
    fullScreenVideo: {
        width: '100%',
        height: '100%',
    },
    closeVideoButton: {
        position: 'absolute',
        top: 100,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 10,
        borderRadius: 20,
        zIndex: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
    button2: {
        padding: 20,
        backgroundColor: '#ddd',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 10,
    },
    cameraControl: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 50,
    },

    imagePicker: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderBottomWidth: 1,
        borderBottomColor: '#d9d9d9',
    },
    timestamp: {
        fontSize: 14,
        marginBottom: 4,
        color: '#666',
    },
    postText: {
        fontWeight: 'bold',
        fontSize: 17,
        color: '#333',
    },
    postButton: {
        backgroundColor: '#76a0ce',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    postButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)', // 半透明背景
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
    },
    contactItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    contactName: {
        fontSize: 18,
        color: '#333',
    },
});    