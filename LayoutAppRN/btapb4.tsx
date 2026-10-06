import React, { useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Alert,
  FlatList,
  Image,
  NativeModules,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary, type Asset } from 'react-native-image-picker';

type Language = 'vi' | 'en';
type ScreenName = 'list' | 'detail' | 'form';

type Student = {
  id: string;
  name: string;
  studentId: string;
  email: string;
  avatar: string;
};

type FormState = {
  name: string;
  studentId: string;
  email: string;
  avatar: string;
};

const STORAGE_KEY = 'btapb4-students-v1';
const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=SV&background=0D8ABC&color=fff&size=128';

const seedStudents: Student[] = [
  {
    id: 'sv-1',
    name: 'Nguyễn Văn A',
    studentId: 'SV001',
    email: 'a@student.edu.vn',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'sv-2',
    name: 'Trần Thị B',
    studentId: 'SV002',
    email: 'b@student.edu.vn',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  },
];

const translations = {
  vi: {
    appTitle: 'Quản lý Sinh viên',
    addStudent: 'Thêm SV',
    listTitle: 'Danh sách sinh viên',
    emptyText: 'Chưa có sinh viên nào.',
    detailTitle: 'Thông tin chi tiết',
    edit: 'Sửa',
    delete: 'Xóa',
    back: 'Quay lại',
    save: 'Lưu',
    cancel: 'Hủy',
    formTitleNew: 'Thêm sinh viên mới',
    formTitleEdit: 'Chỉnh sửa thông tin',
    labelName: 'Họ tên SV',
    labelStudentId: 'Mã số SV',
    labelEmail: 'Email',
    labelAvatar: 'Ảnh avatar SV',
    labelAvatarUrl: 'Link ảnh',
    chooseImage: 'Chọn ảnh từ thiết bị',
    fullNamePlaceholder: 'Nhập họ tên sinh viên',
    studentIdPlaceholder: 'VD: SV001',
    emailPlaceholder: 'VD: ten@domain.com',
    avatarPlaceholder: 'Dán link ảnh hoặc bỏ trống',
    confirmEdit: 'Bạn có muốn sửa thông tin SV không?',
    confirmDelete: 'Bạn có muốn xóa thông tin SV không?',
    yes: 'Có',
    no: 'Không',
    requiredName: 'Vui lòng nhập họ tên sinh viên.',
    requiredId: 'Vui lòng nhập mã số sinh viên.',
    requiredEmail: 'Vui lòng nhập email.',
    invalidEmail: 'Email không hợp lệ.',
    duplicateId: 'Mã số sinh viên đã tồn tại.',
    successAdd: 'Đã thêm sinh viên mới.',
    successEdit: 'Đã cập nhật thông tin sinh viên.',
    successDelete: 'Đã xóa sinh viên.',
  },
  en: {
    appTitle: 'Student Manager',
    addStudent: 'Add Student',
    listTitle: 'Student List',
    emptyText: 'No students yet.',
    detailTitle: 'Student Details',
    edit: 'Edit',
    delete: 'Delete',
    back: 'Back',
    save: 'Save',
    cancel: 'Cancel',
    formTitleNew: 'Add New Student',
    formTitleEdit: 'Edit Student',
    labelName: 'Full Name',
    labelStudentId: 'Student ID',
    labelEmail: 'Email',
    labelAvatar: 'Avatar',
    labelAvatarUrl: 'Image link',
    chooseImage: 'Choose image from device',
    fullNamePlaceholder: 'Enter student name',
    studentIdPlaceholder: 'Ex: ST001',
    emailPlaceholder: 'Ex: name@example.com',
    avatarPlaceholder: 'Paste image URL or leave empty',
    confirmEdit: 'Do you want to edit student information?',
    confirmDelete: 'Do you want to delete student information?',
    yes: 'Yes',
    no: 'No',
    requiredName: 'Please enter the student full name.',
    requiredId: 'Please enter the student ID.',
    requiredEmail: 'Please enter the email.',
    invalidEmail: 'Email is invalid.',
    duplicateId: 'Student ID already exists.',
    successAdd: 'New student added.',
    successEdit: 'Student information updated.',
    successDelete: 'Student deleted.',
  },
} as const;

const getSystemLanguage = (): Language => {
  const locale = String((NativeModules.I18nManager as any)?.localeIdentifier ?? 'en-US').toLowerCase();
  return locale.startsWith('vi') ? 'vi' : 'en';
};

const getEmptyForm = (): FormState => ({
  name: '',
  studentId: '',
  email: '',
  avatar: '',
});

const parseStudents = (value: string | null): Student[] => {
  if (!value) {
    return seedStudents;
  }

  try {
    const data = JSON.parse(value) as Student[];
    return Array.isArray(data) ? data : seedStudents;
  } catch {
    return seedStudents;
  }
};

export default function BtapB4App() {
  const scheme = useColorScheme();
  const [language, setLanguage] = useState<Language>(getSystemLanguage());
  const [screen, setScreen] = useState<ScreenName>('list');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(getEmptyForm());
  const [isReady, setIsReady] = useState(false);

  const t = translations[language];

  useEffect(() => {
    const loadData = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        setStudents(parseStudents(raw));
      } catch {
        setStudents(seedStudents);
      }
      setIsReady(true);
    };

    void loadData();
  }, []);

  useEffect(() => {
    setLanguage(getSystemLanguage());
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  }, [students, isReady]);

  const selectedStudent = useMemo(
    () => students.find(student => student.id === selectedStudentId) ?? null,
    [selectedStudentId, students],
  );

  const openDetail = (studentId: string) => {
    setSelectedStudentId(studentId);
    setScreen('detail');
  };

  const openAddForm = () => {
    setEditingStudentId(null);
    setForm(getEmptyForm());
    setScreen('form');
  };

  const chooseImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });

      const asset = result.assets?.[0] as Asset | undefined;
      if (asset?.uri) {
        setForm(prev => ({ ...prev, avatar: asset.uri ?? prev.avatar }));
      }
    } catch {
      Alert.alert(t.appTitle, 'Unable to open image picker.');
    }
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      return t.requiredName;
    }

    if (!form.studentId.trim()) {
      return t.requiredId;
    }

    if (!form.email.trim()) {
      return t.requiredEmail;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(form.email.trim())) {
      return t.invalidEmail;
    }

    const normalizedId = form.studentId.trim().toLowerCase();
    const duplicate = students.some(
      student =>
        student.studentId.trim().toLowerCase() === normalizedId &&
        student.id !== editingStudentId,
    );

    if (duplicate) {
      return t.duplicateId;
    }

    return '';
  };

  const saveStudent = () => {
    const error = validateForm();
    if (error) {
      Alert.alert(t.appTitle, error);
      return;
    }

    const payload: Student = {
      id: editingStudentId ?? `sv-${Date.now()}`,
      name: form.name.trim(),
      studentId: form.studentId.trim(),
      email: form.email.trim(),
      avatar: form.avatar || DEFAULT_AVATAR,
    };

    if (editingStudentId) {
      setStudents(prev => prev.map(item => (item.id === editingStudentId ? payload : item)));
      Alert.alert(t.appTitle, t.successEdit);
    } else {
      setStudents(prev => [payload, ...prev]);
      Alert.alert(t.appTitle, t.successAdd);
    }

    setSelectedStudentId(payload.id);
    setEditingStudentId(null);
    setForm(getEmptyForm());
    setScreen('list');
  };

  const openEditForm = (student: Student) => {
    Alert.alert(t.confirmEdit, '', [
      { text: t.no, style: 'cancel' },
      {
        text: t.yes,
        onPress: () => {
          setEditingStudentId(student.id);
          setForm({
            name: student.name,
            studentId: student.studentId,
            email: student.email,
            avatar: student.avatar,
          });
          setScreen('form');
        },
      },
    ]);
  };

  const deleteStudent = (student: Student) => {
    Alert.alert(t.confirmDelete, '', [
      { text: t.no, style: 'cancel' },
      {
        text: t.yes,
        onPress: () => {
          setStudents(prev => prev.filter(item => item.id !== student.id));
          if (selectedStudentId === student.id) {
            setSelectedStudentId(null);
          }
          setScreen('list');
          Alert.alert(t.appTitle, t.successDelete);
        },
      },
    ]);
  };

  const renderListScreen = () => (
    <View style={styles.screenWrapper}>
      <Text style={styles.sectionTitle}>{t.listTitle}</Text>

      <FlatList
        data={students}
        keyExtractor={item => item.id}
        contentContainerStyle={students.length === 0 ? styles.emptyList : styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>{t.emptyText}</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.listItem} onPress={() => openDetail(item.id)}>
            <Image source={{ uri: item.avatar || DEFAULT_AVATAR }} style={styles.avatarSmall} />
            <View style={styles.listTextWrap}>
              <Text style={styles.studentName}>{item.name}</Text>
              <Text style={styles.studentMeta}>{item.studentId}</Text>
              <Text style={styles.studentMeta}>{item.email}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );

  const renderDetailScreen = () => {
    if (!selectedStudent) {
      return null;
    }

    return (
      <ScrollView contentContainerStyle={styles.detailContainer}>
        <Image source={{ uri: selectedStudent.avatar || DEFAULT_AVATAR }} style={styles.avatarLarge} />
        <Text style={styles.detailName}>{selectedStudent.name}</Text>
        <Text style={styles.detailField}>{t.labelStudentId}: {selectedStudent.studentId}</Text>
        <Text style={styles.detailField}>{t.labelEmail}: {selectedStudent.email}</Text>

        <View style={styles.actionRow}>
          <Pressable style={styles.primaryButton} onPress={() => openEditForm(selectedStudent)}>
            <Text style={styles.primaryButtonText}>{t.edit}</Text>
          </Pressable>
          <Pressable style={styles.dangerButton} onPress={() => deleteStudent(selectedStudent)}>
            <Text style={styles.primaryButtonText}>{t.delete}</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  };

  const renderFormScreen = () => (
    <ScrollView style={styles.formContainer} contentContainerStyle={styles.formContent}>
      <Text style={styles.sectionTitle}>
        {editingStudentId ? t.formTitleEdit : t.formTitleNew}
      </Text>

      <Text style={styles.inputLabel}>{t.labelName}</Text>
      <TextInput
        style={styles.input}
        value={form.name}
        placeholder={t.fullNamePlaceholder}
        onChangeText={value => setForm(prev => ({ ...prev, name: value }))}
      />

      <Text style={styles.inputLabel}>{t.labelStudentId}</Text>
      <TextInput
        style={styles.input}
        value={form.studentId}
        placeholder={t.studentIdPlaceholder}
        onChangeText={value => setForm(prev => ({ ...prev, studentId: value }))}
      />

      <Text style={styles.inputLabel}>{t.labelEmail}</Text>
      <TextInput
        style={styles.input}
        value={form.email}
        placeholder={t.emailPlaceholder}
        keyboardType="email-address"
        onChangeText={value => setForm(prev => ({ ...prev, email: value }))}
      />

      <Text style={styles.inputLabel}>{t.labelAvatarUrl}</Text>
      <TextInput
        style={styles.input}
        value={form.avatar}
        placeholder={t.avatarPlaceholder}
        onChangeText={value => setForm(prev => ({ ...prev, avatar: value }))}
      />

      <Pressable style={styles.secondaryButton} onPress={chooseImage}>
        <Text style={styles.secondaryButtonText}>{t.chooseImage}</Text>
      </Pressable>

      {form.avatar ? (
        <Image source={{ uri: form.avatar || DEFAULT_AVATAR }} style={styles.avatarPreview} />
      ) : null}

      <View style={styles.actionRow}>
        <Pressable style={styles.secondaryButton} onPress={() => setScreen('list')}>
          <Text style={styles.secondaryButtonText}>{t.cancel}</Text>
        </Pressable>
        <Pressable style={styles.primaryButton} onPress={saveStudent}>
          <Text style={styles.primaryButtonText}>{t.save}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.safeArea, scheme === 'dark' && styles.safeAreaDark]}>
        <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />

        <View style={styles.header}>
          <Text style={styles.appTitle}>{t.appTitle}</Text>
          {screen === 'list' ? (
            <Pressable style={styles.addButton} onPress={openAddForm}>
              <Text style={styles.addButtonText}>{t.addStudent}</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.addButton} onPress={() => setScreen('list')}>
              <Text style={styles.addButtonText}>{t.back}</Text>
            </Pressable>
          )}
        </View>

        {screen === 'list' && renderListScreen()}
        {screen === 'detail' && renderDetailScreen()}
        {screen === 'form' && renderFormScreen()}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f2f7ff',
  },
  safeAreaDark: {
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#2563eb',
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addButtonText: {
    color: '#2563eb',
    fontWeight: '700',
  },
  screenWrapper: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarSmall: {
    width: 62,
    height: 62,
    borderRadius: 31,
    marginRight: 12,
  },
  listTextWrap: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  studentMeta: {
    color: '#4b5563',
    fontSize: 14,
    marginTop: 2,
  },
  detailContainer: {
    padding: 20,
    alignItems: 'center',
  },
  avatarLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  detailName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 14,
  },
  detailField: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    color: '#374151',
    fontSize: 16,
  },
  actionRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginTop: 16,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  dangerButton: {
    flex: 1,
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryButtonText: {
    color: '#1f2937',
    fontWeight: '700',
    fontSize: 15,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  formContent: {
    paddingBottom: 32,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  avatarPreview: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignSelf: 'center',
    marginTop: 16,
  },
});
