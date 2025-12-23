import React, { useState } from "react";
import {
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from "react-native";
import Icon from 'react-native-vector-icons/Feather';
import IconFontisto from 'react-native-vector-icons/Fontisto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from "../../api/client";
import useUserStore from "../../store/userStore";

const LoginScreen = ({ navigation }: any) => {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    // Trạng thái Form
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [isRemember, setIsRemember] = useState(false);
    const [isShipper, setIsShipper] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const { login } = useUserStore();

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleAuth = async () => {
        setErrorMessage(''); // Xóa lỗi trước đó

        // Validation
        if (!email.trim() || !password.trim()) {
            setErrorMessage('Vui lòng nhập đầy đủ email và mật khẩu');
            return;
        }

        if (!validateEmail(email)) {
            setErrorMessage('Email không hợp lệ');
            return;
        }

        if (password.length < 6) {
            setErrorMessage('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        if (!isLogin && !fullName.trim()) {
            setErrorMessage('Vui lòng nhập họ tên');
            return;
        }

        try {
            setIsLoading(true);
            let response;

            if (isLogin) {
                // LOGIN
                response = await authAPI.login(email, password);
            } else {
                // REGISTER
                const role = isShipper ? 'shipper' : 'buyer';
                response = await authAPI.register(email, password, fullName, phone, role);
            }

            if (response.success && response.token) {
                // Lưu dữ liệu vào storage
                await AsyncStorage.multiSet([
                    ['authToken', response.token],
                    ['user', JSON.stringify(response.user)],
                    ['userId', String(response.user.id)],
                    ['userRole', response.user.role] // Lưu vai trò người dùng cho các tính năng admin
                ]);

                // Cập nhật store
                login({
                    name: response.user.fullName,
                    email: response.user.email,
                    avatar: response.user.avatar
                });

                // Điều hướng trực tiếp không cần thông báo
                if (response.user.role === 'shipper') {
                    navigation.replace('ShipperDashboard');
                } else {
                    navigation.replace('MainTabs' as any);
                }
            } else {
                if (isLogin) {
                    setErrorMessage('Tài khoản hoặc mật khẩu không chính xác');
                } else {
                    setErrorMessage(response.message || 'Đăng ký thất bại');
                }
            }
        } catch (error: any) {
            // Log để debug nếu cần nhưng dùng console.log để tránh LogBox hiện lên cho người dùng
            console.log('Auth failed:', error.message);

            if (isLogin) {
                setErrorMessage('Tài khoản hoặc mật khẩu không chính xác');
            } else {
                setErrorMessage(error.message || 'Có lỗi xảy ra, vui lòng thử lại');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        // Xóa lỗi hoặc các trường cụ thể nếu cần
    };

    const handleFacebookLogin = () => {
        Alert.alert('Thông báo', 'Tính năng đăng nhập bằng Facebook đang được phát triển');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={'#f5f5f5'} barStyle={"dark-content"} />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.welcomeTitle}>
                            {isLogin ? 'Đăng Nhập' : 'Đăng Ký'}
                        </Text>
                        <Text style={styles.subtitle}>
                            {isLogin ? 'Chào mừng bạn quay trở lại!' : 'Tạo tài khoản mới để bắt đầu'}
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={styles.formContainer}>

                        {!isLogin && (
                            <>
                                <View style={styles.inputGroup}>
                                    <Icon name="user" size={20} color="#6b7280" style={styles.inputIcon} />
                                    <TextInput
                                        placeholder="Họ và tên"
                                        style={styles.input}
                                        placeholderTextColor="#9ca3af"
                                        value={fullName}
                                        onChangeText={setFullName}
                                        editable={!isLoading}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Icon name="phone" size={20} color="#6b7280" style={styles.inputIcon} />
                                    <TextInput
                                        placeholder="Số điện thoại"
                                        style={styles.input}
                                        placeholderTextColor="#9ca3af"
                                        value={phone}
                                        onChangeText={setPhone}
                                        keyboardType="phone-pad"
                                        editable={!isLoading}
                                    />
                                </View>
                            </>
                        )}

                        <View style={styles.inputGroup}>
                            <Icon name="mail" size={20} color="#6b7280" style={styles.inputIcon} />
                            <TextInput
                                placeholder="Email"
                                style={styles.input}
                                placeholderTextColor="#9ca3af"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                editable={!isLoading}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Icon name="lock" size={20} color="#6b7280" style={styles.inputIcon} />
                            <TextInput
                                placeholder="Mật khẩu"
                                style={styles.input}
                                placeholderTextColor="#9ca3af"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                editable={!isLoading}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Icon name={showPassword ? "eye" : "eye-off"} size={20} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>

                        {isLogin && (
                            <View style={styles.rememberContainer}>
                                <TouchableOpacity
                                    style={styles.checkboxContainer}
                                    onPress={() => setIsRemember(!isRemember)}
                                >
                                    <View style={[styles.checkbox, isRemember && styles.checkboxActive]}>
                                        {isRemember && <Icon name="check" size={12} color="white" />}
                                    </View>
                                    <Text style={styles.rememberText}>Ghi nhớ đăng nhập</Text>
                                </TouchableOpacity>
                                <TouchableOpacity>
                                    <Text style={styles.forgotText}>Quên mật khẩu?</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {!isLogin && (
                            <TouchableOpacity
                                style={[styles.rememberContainer, { marginBottom: 20 }]}
                                onPress={() => setIsShipper(!isShipper)}
                            >
                                <View style={[styles.checkbox, isShipper && styles.checkboxActive]}>
                                    {isShipper && <Icon name="check" size={12} color="white" />}
                                </View>
                                <Text style={styles.rememberText}>Đăng ký làm tài xế (Shipper)</Text>
                            </TouchableOpacity>
                        )}

                        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

                        <TouchableOpacity
                            style={[styles.button, isLoading && styles.buttonDisabled]}
                            onPress={handleAuth}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.buttonText}>
                                    {isLogin ? 'Đăng Nhập' : 'Đăng Ký'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Social Login */}
                    <View style={styles.dividerContainer}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>Hoặc tiếp tục với</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <View style={styles.socialContainer}>
                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={handleFacebookLogin}
                            disabled={isLoading}
                        >
                            <IconFontisto name="facebook" size={20} color="#1877f2" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={() => Alert.alert('Thông báo', 'Tính năng đăng nhập bằng Google đang được phát triển')}
                        >
                            <IconFontisto name="google" size={20} color="#db4437" />
                        </TouchableOpacity>
                    </View>

                    {/* Switch Mode */}
                    <View style={styles.switchContainer}>
                        <Text style={styles.switchText}>
                            {isLogin ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
                        </Text>
                        <TouchableOpacity onPress={toggleMode}>
                            <Text style={styles.switchLink}>
                                {isLogin ? 'Đăng ký ngay' : 'Đăng nhập ngay'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    welcomeTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#6b7280',
    },
    formContainer: {
        marginBottom: 20,
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        paddingHorizontal: 16,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: '#111827',
    },
    button: {
        backgroundColor: '#1f2937',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    rememberContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#d1d5db',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    checkboxActive: {
        backgroundColor: '#1f2937',
        borderColor: '#1f2937',
    },
    rememberText: {
        color: '#6b7280',
        fontSize: 14,
    },
    forgotText: {
        color: '#ef4444',
        fontSize: 14,
        fontWeight: '600',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#e5e7eb',
    },
    dividerText: {
        marginHorizontal: 16,
        color: '#9ca3af',
        fontSize: 14,
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        marginBottom: 30,
    },
    socialButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        elevation: 1,
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    switchText: {
        color: '#6b7280',
        fontSize: 14,
    },
    switchLink: {
        color: '#1f2937',
        fontSize: 14,
        fontWeight: 'bold',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 10,
    },
});

export default LoginScreen;
