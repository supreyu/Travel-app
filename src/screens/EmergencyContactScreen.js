import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import * as Contacts from 'expo-contacts';
import * as LocalAuthentication from 'expo-local-authentication';
import call from 'react-native-phone-call';

const EmergencyContactScreen = () => {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        // 尝试进行本地认证（如生物识别或设备密码）
        const authResult = await LocalAuthentication.authenticateAsync({
          promptMessage: "Authentication Required",
          cancelLabel: "Cancel",
          fallbackLabel: "Use Passcode",
        });

        if (authResult.success) {
          // 如果认证成功，请求联系人权限
          const { status } = await Contacts.requestPermissionsAsync();
          if (status === 'granted') {
            const { data } = await Contacts.getContactsAsync({
              fields: [Contacts.Fields.PhoneNumbers],
            });

            if (data.length > 0) {
              setContacts(data);
            }
          }
        } else {
          Alert.alert("Authentication failed", "You could not be verified; please try again.");
        }
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  const makeCall = (phone) => {
    const args = {
      number: phone,
      prompt: false,
    };
    call(args).catch(console.error);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => makeCall(item.phoneNumbers[0].number)}>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 18 }}>{`${item.name}`}</Text>
        {item.phoneNumbers && item.phoneNumbers.length > 0 && (
          <Text style={{ fontSize: 16, color: 'grey' }}>{item.phoneNumbers[0].number}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View>
      <FlatList
        data={contacts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

export default EmergencyContactScreen;
