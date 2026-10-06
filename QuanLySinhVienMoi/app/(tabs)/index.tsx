import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, Pressable, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';

export interface Student {
  id: string;
  name: string;
  studentId: string;
  email: string;
  avatar: string;
}

const STORAGE_KEY = '@student_management_data';

export default function IndexScreen() {
  const [students, setStudents] = useState<Student[]>([]);
  const router = useRouter();

  const loadStudents = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        setStudents(JSON.parse(data));
      }
    } catch (error) {
      console.log(error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadStudents();
    }, [])
  );

  const deleteStudent = async (id: string) => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa sinh viên này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          const updated = students.filter((item) => item.id !== id);
          setStudents(updated);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.addButton} onPress={() => router.push('/form')}>
        <Text style={styles.addButtonText}>+ Thêm sinh viên mới</Text>
      </Pressable>

      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push({ pathname: '/detail', params: { id: item.id } })}
          >
            <Image
              source={{ uri: item.avatar || 'https://via.placeholder.com/150' }}
              style={styles.avatar}
            />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text>Mã SV: {item.studentId}</Text>
              <Text>Email: {item.email}</Text>
            </View>
            <Pressable onPress={() => deleteStudent(item.id)} style={styles.deleteBtn}>
              <Text style={{ color: 'red' }}>Xóa</Text>
            </Pressable>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  addButton: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 16 },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  card: { flexDirection: 'row', backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 10, alignItems: 'center', elevation: 2 },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  info: { flex: 1 },
name: { fontSize: 16, fontWeight: 'bold' },
  deleteBtn: { padding: 8 },
});
