import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import type { Student } from './(tabs)/index';

const STORAGE_KEY = '@student_management_data';

export default function DetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const studentIdParam = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    fetchStudentDetail();
  }, [studentIdParam]);

  const fetchStudentDetail = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const list: Student[] = JSON.parse(data);
        const found = list.find((s) => s.id === studentIdParam);
        if (found) setStudent(found);
      }
    } catch (error) {
      console.error('Lỗi lấy chi tiết:', error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có muốn xóa thông tin SV không?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Có',
          style: 'destructive',
          onPress: async () => {
            try {
              const data = await AsyncStorage.getItem(STORAGE_KEY);
              if (data) {
                let list: Student[] = JSON.parse(data);
                list = list.filter((s) => s.id !== studentIdParam);
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
                router.back();
              }
            } catch (error) {
              console.error('Lỗi khi xóa:', error);
            }
          },
        },
      ]
    );
  };

  if (!student) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 40 }}>Đang tải hoặc không tìm thấy dữ liệu...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Image source={{ uri: student.avatar || 'https://via.placeholder.com/150' }} style={styles.avatar} />
        <Text style={styles.name}>{student.name}</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Mã số SV:</Text>
          <Text style={styles.value}>{student.studentId}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{student.email}</Text>
        </View>

        <View style={styles.btnContainer}>
          <Pressable 
            style={[styles.btn, styles.editBtn]} 
            onPress={() => router.push({ pathname: '/form', params: { id: student.id } })}
          >
            <Text style={styles.btnText}>Sửa</Text>
          </Pressable>
<Pressable style={[styles.btn, styles.deleteBtn]} onPress={handleDelete}>
            <Text style={styles.btnText}>Xóa</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 20, alignItems: 'center', elevation: 3 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 16, backgroundColor: '#ccc' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  infoRow: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  label: { fontSize: 16, color: '#666', fontWeight: '500' },
  value: { fontSize: 16, color: '#333', fontWeight: 'bold' },
  btnContainer: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginTop: 30 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 6 },
  editBtn: { backgroundColor: '#3498db' },
  deleteBtn: { backgroundColor: '#e74c3c' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
