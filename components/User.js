import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';

export default function User() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const BASE_URL = 'https://67404657d0b59228b7ef578e.mockapi.io/Books';

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(BASE_URL);
      const data = await response.json();
      setUsers(data);
      setFilteredUsers(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async () => {
    if (!name || !avatar) {
      Alert.alert('Error', 'Please provide both name and avatar URL.');
      return;
    }

    const newUser = { name, avatar };

    try {
      if (editingUser) {
        // Update existing user
        await fetch(`${BASE_URL}/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser),
        });
      } else {
        // Add new user
        await fetch(BASE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser),
        });
      }
      setName('');
      setAvatar('');
      setEditingUser(null);
      setModalVisible(false);
      fetchUsers();
    } catch (error) {
      console.error('Error adding/updating user:', error);
    }
  };

  const handleEditUser = (user) => {
    setName(user.name);
    setAvatar(user.avatar);
    setEditingUser(user);
    setModalVisible(true);
  };

  const handleDeleteUser = (id) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this user?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
            fetchUsers();
          } catch (error) {
            console.error('Error deleting user:', error);
          }
        },
      },
    ]);
  };

  const handleSearch = (text) => {
    setSearch(text);
    if (text) {
      const filtered = users.filter((user) =>
        user.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User inform</Text>
      <TextInput
        placeholder="Search Users"
        value={search}
        onChangeText={handleSearch}
        style={styles.searchInput}
      />
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <Text style={styles.name}>{item.name}</Text>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEditUser(item)}
              >
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteUser(item.id)}
              >
                <Text style={styles.actionText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setEditingUser(null);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              placeholder="Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
            <TextInput
              placeholder="Avatar URL"
              value={avatar}
              onChangeText={setAvatar}
              style={styles.input}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddUser}>
              <Text style={styles.addButtonText}>{editingUser ? 'Update' : 'Add'} User</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setModalVisible(false);
                setEditingUser(null);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'deepskyblue',
      width: '100%',
      padding: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 16,
      textAlign: 'center',
      color: 'white',
    },
    searchInput: {
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginBottom: 16,
      fontSize: 16,
      color: '#333',
    },
    userCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      padding: 16,
      marginBottom: 12,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 2,
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 16,
    },
    name: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
      flex: 1,
    },
    actions: {
      flexDirection: 'row',
    },
    editButton: {
      backgroundColor: 'green',
      padding: 8,
      borderRadius: 8,
      marginRight: 8,
    },
    deleteButton: {
      backgroundColor: '#DC3545',
      padding: 8,
      borderRadius: 8,
    },
    actionText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 14,
    },
    floatingButton: {
      backgroundColor: '#007BFF',
      width: 60,
      height: 60,
      borderRadius: 30,
      position: 'absolute',
      bottom: 20,
      right: 20,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
    },
    floatingButtonText: {
      color: '#fff',
      fontSize: 32,
      fontWeight: 'bold',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: '#fff',
      padding: 20,
      borderRadius: 10,
      width: '90%',
      shadowColor: '#000',
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 4,
    },
    input: {
      backgroundColor: '#f9f9f9',
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
      fontSize: 16,
      color: '#333',
    },
    addButton: {
      backgroundColor: '#007BFF',
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 12,
    },
    addButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
    cancelButton: {
      backgroundColor: '#DC3545',
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    cancelButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
  
