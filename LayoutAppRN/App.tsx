import BtapB4App from './btapb4';

export default function App() {
  return <BtapB4App />;
}

/*
  {
    id: 'sv-1',
    name: 'Nguyễn Văn A',
    studentId: 'SV001',
    email: 'nguyenvana@school.edu.vn',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'sv-2',
    name: 'Trần Thị B',
    studentId: 'SV002',
    email: 'tranthib@school.edu.vn',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
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
    avatarPlaceholder: 'Dán link ảnh hoặc để trống',
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
    labelAvatar: 'Student Avatar',
    labelAvatarUrl: 'Image link',
    chooseImage: 'Choose image from device',
    fullNamePlaceholder: 'Enter student full name',
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

const getDeviceLanguage = (): Language => {
  const rawLocale = (NativeModules.I18nManager as any)?.localeIdentifier ?? 'en-US';
  const locale = String(rawLocale).toLowerCase();
  return locale.startsWith('vi') ? 'vi' : 'en';
};

const parseStudentList = (value: string | null): Student[] => {
  if (!value) {
    return initialStudents;
  }

  try {
    const parsed = JSON.parse(value) as Student[];
    return Array.isArray(parsed) ? parsed : initialStudents;
  } catch {
    return initialStudents;
  }
};

const getEmptyForm = (): FormState => ({
  name: '',
  studentId: '',
  email: '',
  avatar: '',
});

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [language, setLanguage] = useState<Language>(getDeviceLanguage());
  const [screen, setScreen] = useState<ScreenName>('list');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(getEmptyForm());
  const [hasLoaded, setHasLoaded] = useState(false);

  const t = translations[language];

  useEffect(() => {
    const bootstrapStudents = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const savedStudents = parseStudentList(stored);
        setStudents(savedStudents);
      } catch {
        setStudents(initialStudents);
      }
      setHasLoaded(true);
    };

    void bootstrapStudents();
  }, []);

  useEffect(() => {
    if (!hasLoaded) {
      return;
    }

    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  }, [students, hasLoaded]);

  useEffect(() => {
    setLanguage(getDeviceLanguage());
  }, []);

  const selectedStudent = useMemo(
    () => students.find(student => student.id === selectedStudentId) ?? null,
    [selectedStudentId, students],
  );

  const openDetailScreen = (studentId: string) => {
    setSelectedStudentId(studentId);
    setScreen('detail');
  };

  const openAddForm = () => {
    setEditingStudentId(null);
    setForm(getEmptyForm());
    setScreen('form');
  };

  const openEditForm = (student: Student) => {
*/

