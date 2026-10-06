import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import type { Student } from './(tabs)/index';

const STORAGE_KEY = '@student_management_data';

export default function FormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const editId = params.id as string | undefined;

  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    if (editId) {
      loadStudentData(editId);
    }
  }, [editId]);

  const loadStudentData = async (id: string) => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const students: Student[] = JSON.parse(data);
        const current = students.find((s) => s.id === id);
        if (current) {
          setName(current.name);
          setStudentId(current.studentId);
          setEmail(current.email);
          setAvatar(current.avatar);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSave = async () => {
    // Kiểm tra các trường trống
    if (!name.trim() || !studentId.trim() || !email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin bắt buộc!');
      return;
    }

    // Kiểm tra định dạng Mã SV: 3 chữ cái đầu + 6 chữ số sau (VD: BIT242333)
    const studentIdRegex = /^[A-Za-z]{3}[0-9]{6}$/;
    if (!studentIdRegex.test(studentId)) {
      Alert.alert('Lỗi', 'Mã sinh viên không đúng định dạng (Gồm 3 chữ cái và 6 số, ví dụ: BIT242333)');
      return;
    }

    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      let students: Student[] = data ? JSON.parse(data) : [];

      if (editId) {
        // Cập nhật
        students = students.map((s) => (s.id === editId ? { ...s, name, studentId, email, avatar } : s));
      } else {
        // Thêm mới
        const newStudent: Student = {
          id: Date.now().toString(),
          name,
          studentId,
          email,
          avatar,
        };
        students.push(newStudent);
      }

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(students));
      router.back();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu dữ liệu!');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Họ tên SV *</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nhập họ tên" />

      <Text style={styles.label}>Mã số SV (3 chữ + 6 số) *</Text>
<TextInput style={styles.input} value={studentId} onChangeText={setStudentId} placeholder="VD: BIT242333" autoCapitalize="characters" />

      <Text style={styles.label}>Email *</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Nhập email" keyboardType="email-address" />

      <Text style={styles.label}>Link ảnh Avatar</Text>
      <TextInput style={styles.input} value={avatar} onChangeText={setAvatar} placeholder="Dán link ảnh (URL)" />

      <Pressable style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Lưu thông tin</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 6, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 16, fontSize: 16 },
  saveButton: { backgroundColor: '#007AFF', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
