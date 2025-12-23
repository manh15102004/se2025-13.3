import React, { useState } from 'react';
import { launchImageLibrary } from 'react-native-image-picker';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StatusBar,
    Alert,
    ActivityIndicator,
    Image, // Import Image
    Modal
} from 'react-native';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/Feather';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { bannerAPI } from '../../api/client';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateBanner'>;

const CreateBannerScreen: React.FC<Props> = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        image: '', // Mặc định rỗng
        title: '',
        subtitle: '',
        targetType: 'none',
        targetValue: '',
        duration: '7', // Mặc định 7 ngày
    });

    const [titleFont, setTitleFont] = useState({
        fontFamily: 'System',
        fontSize: 24,
        fontWeight: 'bold',
        fontStyle: 'normal',
        color: '#ffffff',
        positionX: 5,
        positionY: 30
    });

    const [subtitleFont, setSubtitleFont] = useState({
        fontFamily: 'System',
        fontSize: 14,
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#ffffff',
        positionX: 5,
        positionY: 50
    });

    const [showFontCustomization, setShowFontCustomization] = useState(false);

    const fontFamilies = ['System', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins'];
    const colorPalette = [
        '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff',
        '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080',
        '#ffc0cb', '#a52a2a', '#808080', '#ffd700', '#4a90e2'
    ];

    const handlePickImage = async () => {
        try {
            const result = await launchImageLibrary({
                mediaType: 'photo',
                quality: 0.6,
                includeBase64: true,
                maxWidth: 1024,
                maxHeight: 512, // Tỉ lệ 2:1 cho banner
            });

            if (result.assets?.[0]?.base64) {
                setFormData({
                    ...formData,
                    image: `data:${result.assets[0].type};base64,${result.assets[0].base64}`,
                });
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể chọn ảnh');
        }
    };

    const handleCreate = async () => {
        try {
            if (!formData.image) {
                Alert.alert('Lỗi', 'Vui lòng chọn ảnh banner');
                return;
            }

            const days = parseInt(formData.duration);
            if (isNaN(days) || days <= 0) {
                Alert.alert('Lỗi', 'Thời gian thuê không hợp lệ');
                return;
            }

            setLoading(true);
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(startDate.getDate() + days);
            const price = days * 50000;

            const response = await bannerAPI.createBanner({
                ...formData,
                priority: 0,
                startDate: startDate,
                endDate: endDate,
                price: price,
                // Kiểu font
                titleFontFamily: titleFont.fontFamily,
                titleFontSize: titleFont.fontSize,
                titleFontWeight: titleFont.fontWeight,
                titleFontStyle: titleFont.fontStyle,
                titleColor: titleFont.color,
                titlePositionX: titleFont.positionX,
                titlePositionY: titleFont.positionY,
                subtitleFontFamily: subtitleFont.fontFamily,
                subtitleFontSize: subtitleFont.fontSize,
                subtitleFontWeight: subtitleFont.fontWeight,
                subtitleFontStyle: subtitleFont.fontStyle,
                subtitleColor: subtitleFont.color,
                subtitlePositionX: subtitleFont.positionX,
                subtitlePositionY: subtitleFont.positionY
            });

            if (response.success) {
                // Tạo thành công, quay lại luôn
                navigation.goBack();
            } else {
                Alert.alert('Lỗi', response.message || 'Không thể tạo banner');
            }
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tạo Quảng Cáo Mới</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.label}>Hình ảnh Banner</Text>
                <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
                    {formData.image ? (
                        <Image source={{ uri: formData.image }} style={styles.previewImageInput} resizeMode="cover" />
                    ) : (
                        <View style={styles.placeholderContainer}>
                            <Icon name="image" size={40} color="#ccc" />
                            <Text style={styles.placeholderText}>Chọn ảnh (Tỉ lệ 2:1)</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* ... Inputs ... */}
                <Text style={styles.label}>Thời gian thuê (Ngày)</Text>
                <View style={styles.durationContainer}>
                    {[7, 14, 30].map((days) => (
                        <TouchableOpacity
                            key={days}
                            style={[
                                styles.durationButton,
                                formData.duration === days.toString() && styles.durationButtonActive
                            ]}
                            onPress={() => setFormData({ ...formData, duration: days.toString() })}
                        >
                            <Text style={[
                                styles.durationText,
                                formData.duration === days.toString() && styles.durationTextActive
                            ]}>{days} ngày</Text>
                        </TouchableOpacity>
                    ))}
                    <TextInput
                        style={[styles.input, styles.durationInput]}
                        placeholder="Số ngày khác..."
                        keyboardType="numeric"
                        value={formData.duration}
                        onChangeText={(text) => setFormData({ ...formData, duration: text })}
                    />
                </View>

                {/* Price Display */}
                <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>Chi phí dự kiến:</Text>
                    <Text style={styles.priceValue}>
                        {(parseInt(formData.duration || '0') * 50000).toLocaleString('vi-VN')} đ
                    </Text>
                    <Text style={styles.priceNote}>(50.000 đ/ngày)</Text>
                </View>

                <Text style={styles.label}>Tiêu đề chính</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ví dụ: Giảm giá 50%"
                    value={formData.title}
                    onChangeText={(text) => setFormData({ ...formData, title: text })}
                />

                <Text style={styles.label}>Nội dung phụ</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ví dụ: Cho đơn hàng từ 200k"
                    value={formData.subtitle}
                    onChangeText={(text) => setFormData({ ...formData, subtitle: text })}
                />

                {/* Font Customization Section */}
                <TouchableOpacity
                    style={styles.fontCustomizationHeader}
                    onPress={() => setShowFontCustomization(!showFontCustomization)}
                >
                    <Text style={styles.fontCustomizationTitle}>📝 Tùy chỉnh Font Chữ</Text>
                    <Icon name={showFontCustomization ? "chevron-up" : "chevron-down"} size={20} color="#666" />
                </TouchableOpacity>

                {showFontCustomization && (
                    <View style={styles.fontCustomizationContent}>
                        {/* Title Font Customization */}
                        <View style={styles.fontSection}>
                            <Text style={styles.fontSectionTitle}>Tiêu Đề Chính</Text>

                            {/* Font Family */}
                            <Text style={styles.fontLabel}>Font chữ</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fontFamilyScroll}>
                                {fontFamilies.map((font) => (
                                    <TouchableOpacity
                                        key={font}
                                        style={[
                                            styles.fontFamilyButton,
                                            titleFont.fontFamily === font && styles.fontFamilyButtonActive
                                        ]}
                                        onPress={() => setTitleFont({ ...titleFont, fontFamily: font })}
                                    >
                                        <Text style={[
                                            styles.fontFamilyText,
                                            titleFont.fontFamily === font && styles.fontFamilyTextActive
                                        ]}>
                                            {font}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            {/* Font Size */}
                            <Text style={styles.fontLabel}>Kích thước: {titleFont.fontSize}px</Text>
                            <Slider
                                style={styles.slider}
                                minimumValue={16}
                                maximumValue={48}
                                step={1}
                                value={titleFont.fontSize}
                                onValueChange={(value) => setTitleFont({ ...titleFont, fontSize: Math.round(value) })}
                                minimumTrackTintColor="#4a90e2"
                                maximumTrackTintColor="#ddd"
                                thumbTintColor="#4a90e2"
                            />

                            {/* Bold & Italic Toggles */}
                            <View style={styles.fontToggles}>
                                <TouchableOpacity
                                    style={[
                                        styles.fontToggleButton,
                                        titleFont.fontWeight === 'bold' && styles.fontToggleButtonActive
                                    ]}
                                    onPress={() => setTitleFont({
                                        ...titleFont,
                                        fontWeight: titleFont.fontWeight === 'bold' ? 'normal' : 'bold'
                                    })}
                                >
                                    <Text style={[
                                        styles.fontToggleText,
                                        titleFont.fontWeight === 'bold' && styles.fontToggleTextActiveStyle,
                                        { fontWeight: 'bold' }
                                    ]}>B</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.fontToggleButton,
                                        titleFont.fontStyle === 'italic' && styles.fontToggleButtonActive
                                    ]}
                                    onPress={() => setTitleFont({
                                        ...titleFont,
                                        fontStyle: titleFont.fontStyle === 'italic' ? 'normal' : 'italic'
                                    })}
                                >
                                    <Text style={[
                                        styles.fontToggleText,
                                        titleFont.fontStyle === 'italic' && styles.fontToggleTextActiveStyle,
                                        { fontStyle: 'italic' }
                                    ]}>I</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Color Palette */}
                            <Text style={styles.fontLabel}>Màu chữ</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorPaletteScroll}>
                                {colorPalette.map((color) => (
                                    <TouchableOpacity
                                        key={color}
                                        style={[
                                            styles.colorButton,
                                            { backgroundColor: color },
                                            titleFont.color === color && styles.colorButtonActive
                                        ]}
                                        onPress={() => setTitleFont({ ...titleFont, color })}
                                    >
                                        {titleFont.color === color && (
                                            <Icon name="check" size={16} color={color === '#ffffff' ? '#000' : '#fff'} />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            {/* Position Controls */}
                            <Text style={styles.fontLabel}>Vị trí ngang: {titleFont.positionX}%</Text>
                            <Slider
                                style={styles.slider}
                                minimumValue={0}
                                maximumValue={100}
                                step={1}
                                value={titleFont.positionX}
                                onValueChange={(value) => setTitleFont({ ...titleFont, positionX: Math.round(value) })}
                                minimumTrackTintColor="#4a90e2"
                                maximumTrackTintColor="#ddd"
                                thumbTintColor="#4a90e2"
                            />

                            <Text style={styles.fontLabel}>Vị trí dọc: {titleFont.positionY}%</Text>
                            <Slider
                                style={styles.slider}
                                minimumValue={0}
                                maximumValue={100}
                                step={1}
                                value={titleFont.positionY}
                                onValueChange={(value) => setTitleFont({ ...titleFont, positionY: Math.round(value) })}
                                minimumTrackTintColor="#4a90e2"
                                maximumTrackTintColor="#ddd"
                                thumbTintColor="#4a90e2"
                            />
                        </View>

                        {/* Subtitle Font Customization */}
                        <View style={styles.fontSection}>
                            <Text style={styles.fontSectionTitle}>Nội Dung Phụ</Text>

                            {/* Font Family */}
                            <Text style={styles.fontLabel}>Font chữ</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fontFamilyScroll}>
                                {fontFamilies.map((font) => (
                                    <TouchableOpacity
                                        key={font}
                                        style={[
                                            styles.fontFamilyButton,
                                            subtitleFont.fontFamily === font && styles.fontFamilyButtonActive
                                        ]}
                                        onPress={() => setSubtitleFont({ ...subtitleFont, fontFamily: font })}
                                    >
                                        <Text style={[
                                            styles.fontFamilyText,
                                            subtitleFont.fontFamily === font && styles.fontFamilyTextActive
                                        ]}>
                                            {font}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            {/* Font Size */}
                            <Text style={styles.fontLabel}>Kích thước: {subtitleFont.fontSize}px</Text>
                            <Slider
                                style={styles.slider}
                                minimumValue={10}
                                maximumValue={24}
                                step={1}
                                value={subtitleFont.fontSize}
                                onValueChange={(value) => setSubtitleFont({ ...subtitleFont, fontSize: Math.round(value) })}
                                minimumTrackTintColor="#4a90e2"
                                maximumTrackTintColor="#ddd"
                                thumbTintColor="#4a90e2"
                            />

                            {/* Bold & Italic Toggles */}
                            <View style={styles.fontToggles}>
                                <TouchableOpacity
                                    style={[
                                        styles.fontToggleButton,
                                        subtitleFont.fontWeight === 'bold' && styles.fontToggleButtonActive
                                    ]}
                                    onPress={() => setSubtitleFont({
                                        ...subtitleFont,
                                        fontWeight: subtitleFont.fontWeight === 'bold' ? 'normal' : 'bold'
                                    })}
                                >
                                    <Text style={[
                                        styles.fontToggleText,
                                        subtitleFont.fontWeight === 'bold' && styles.fontToggleTextActiveStyle,
                                        { fontWeight: 'bold' }
                                    ]}>B</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.fontToggleButton,
                                        subtitleFont.fontStyle === 'italic' && styles.fontToggleButtonActive
                                    ]}
                                    onPress={() => setSubtitleFont({
                                        ...subtitleFont,
                                        fontStyle: subtitleFont.fontStyle === 'italic' ? 'normal' : 'italic'
                                    })}
                                >
                                    <Text style={[
                                        styles.fontToggleText,
                                        subtitleFont.fontStyle === 'italic' && styles.fontToggleTextActiveStyle,
                                        { fontStyle: 'italic' }
                                    ]}>I</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Color Palette */}
                            <Text style={styles.fontLabel}>Màu chữ</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorPaletteScroll}>
                                {colorPalette.map((color) => (
                                    <TouchableOpacity
                                        key={color}
                                        style={[
                                            styles.colorButton,
                                            { backgroundColor: color },
                                            subtitleFont.color === color && styles.colorButtonActive
                                        ]}
                                        onPress={() => setSubtitleFont({ ...subtitleFont, color })}
                                    >
                                        {subtitleFont.color === color && (
                                            <Icon name="check" size={16} color={color === '#ffffff' ? '#000' : '#fff'} />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            {/* Position Controls */}
                            <Text style={styles.fontLabel}>Vị trí ngang: {subtitleFont.positionX}%</Text>
                            <Slider
                                style={styles.slider}
                                minimumValue={0}
                                maximumValue={100}
                                step={1}
                                value={subtitleFont.positionX}
                                onValueChange={(value) => setSubtitleFont({ ...subtitleFont, positionX: Math.round(value) })}
                                minimumTrackTintColor="#4a90e2"
                                maximumTrackTintColor="#ddd"
                                thumbTintColor="#4a90e2"
                            />

                            <Text style={styles.fontLabel}>Vị trí dọc: {subtitleFont.positionY}%</Text>
                            <Slider
                                style={styles.slider}
                                minimumValue={0}
                                maximumValue={100}
                                step={1}
                                value={subtitleFont.positionY}
                                onValueChange={(value) => setSubtitleFont({ ...subtitleFont, positionY: Math.round(value) })}
                                minimumTrackTintColor="#4a90e2"
                                maximumTrackTintColor="#ddd"
                                thumbTintColor="#4a90e2"
                            />
                        </View>
                    </View>
                )}


                <Text style={styles.label}>Loại điều hướng</Text>
                <View style={styles.typeContainer}>
                    {['none', 'product', 'category'].map((type) => (
                        <TouchableOpacity
                            key={type}
                            style={[
                                styles.typeButton,
                                formData.targetType === type && styles.typeButtonActive
                            ]}
                            onPress={() => setFormData({ ...formData, targetType: type })}
                        >
                            <Text style={[
                                styles.typeText,
                                formData.targetType === type && styles.typeTextActive
                            ]}>
                                {type === 'none' ? 'Không' : type === 'product' ? 'Sản phẩm' : 'Danh mục'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Xem trước - Đã chuyển xuống dưới cùng */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Xem trước</Text>
                    <View style={styles.previewContainer}>
                        {formData.image ? (
                            <>
                                <Image source={{ uri: formData.image }} style={styles.previewImage} />
                                {/* Title with custom styling - only render if exists */}
                                {formData.title && (
                                    <Text style={[
                                        styles.previewText,
                                        {
                                            position: 'absolute',
                                            left: `${titleFont.positionX}%`,
                                            top: `${titleFont.positionY}%`,
                                            fontFamily: titleFont.fontFamily,
                                            fontSize: titleFont.fontSize,
                                            fontWeight: titleFont.fontWeight as any,
                                            fontStyle: titleFont.fontStyle as any,
                                            color: titleFont.color,
                                            textShadowColor: 'rgba(0,0,0,0.75)',
                                            textShadowOffset: { width: -1, height: 1 },
                                            textShadowRadius: 10
                                        }
                                    ]}>
                                        {formData.title}
                                    </Text>
                                )}
                                {/* Subtitle with custom styling - only render if exists */}
                                {formData.subtitle && (
                                    <Text style={[
                                        styles.previewSubtext,
                                        {
                                            position: 'absolute',
                                            left: `${subtitleFont.positionX}%`,
                                            top: `${subtitleFont.positionY}%`,
                                            fontFamily: subtitleFont.fontFamily,
                                            fontSize: subtitleFont.fontSize,
                                            fontWeight: subtitleFont.fontWeight as any,
                                            fontStyle: subtitleFont.fontStyle as any,
                                            color: subtitleFont.color,
                                            textShadowColor: 'rgba(0,0,0,0.75)',
                                            textShadowOffset: { width: -1, height: 1 },
                                            textShadowRadius: 10
                                        }
                                    ]}>
                                        {formData.subtitle}
                                    </Text>
                                )}
                            </>
                        ) : (
                            <Text style={styles.previewPlaceholderText}>Chọn ảnh để xem trước</Text>
                        )}
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.createButton, loading && styles.disabledButton]}
                    onPress={handleCreate}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.createButtonText}>Gửi Duyệt</Text>
                    )}
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    content: {
        padding: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        fontSize: 16,
    },
    // Removed emojiInput
    imagePicker: {
        height: 150,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        borderStyle: 'dashed',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    previewImageInput: {
        width: '100%',
        height: '100%',
    },
    placeholderContainer: {
        alignItems: 'center',
    },
    placeholderText: {
        marginTop: 8,
        color: '#999',
        fontSize: 14,
    },
    typeContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    typeButton: {
        flex: 1,
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
    },
    typeButtonActive: {
        borderColor: '#4a90e2',
        backgroundColor: '#e6f2ff',
    },
    typeText: {
        color: '#666',
        fontWeight: '500',
    },
    typeTextActive: {
        color: '#4a90e2',
        fontWeight: '700',
    },
    // Đã xóa previewSection để sửa lỗi thuộc tính bị trùng lặp
    bannerPreview: {
        backgroundColor: '#4a90e2',
        borderRadius: 16,
        padding: 16,
        // height: 160, // Chiều cao cố định để đồng bộ
        aspectRatio: 2, // Tỉ lệ 2:1
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        overflow: 'hidden', // Cắt nội dung
        position: 'relative',
    },
    bannerBackground: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
    },
    bannerOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)', // Lớp phủ tối để dễ đọc văn bản
        padding: 16,
        justifyContent: 'center',
    },
    bannerContent: {
        flex: 1,
        justifyContent: 'center',
        zIndex: 2, // Đảm bảo văn bản nằm trên ảnh
    },
    bannerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: 'white',
        marginBottom: 4,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    },
    bannerSubtitle: {
        fontSize: 13,
        color: '#e0e0e0',
        marginBottom: 12,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    },
    shopButton: {
        backgroundColor: '#ffd700',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    shopButtonText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#1a1a2e',
    },
    bannerImage: {
        fontSize: 50,
        zIndex: 2,
    },
    createButton: {
        backgroundColor: '#4a90e2',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 32,
        marginBottom: 32,
    },
    disabledButton: {
        opacity: 0.7,
    },
    createButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    durationContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap', // Cho phép xuống dòng trên màn hình nhỏ
        gap: 8,
        marginBottom: 16,
    },
    durationButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff',
    },
    durationButtonActive: {
        borderColor: '#4a90e2',
        backgroundColor: '#e6f2ff',
    },
    durationText: {
        color: '#666',
        fontWeight: '500',
    },
    durationTextActive: {
        color: '#4a90e2',
        fontWeight: '700',
    },
    durationInput: {
        width: 120,
        textAlign: 'center',
    },
    priceContainer: {
        backgroundColor: '#fff9db',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ffe066',
        marginBottom: 20,
        alignItems: 'center',
    },
    priceLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    priceValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#d63031',
    },
    priceNote: {
        fontSize: 12,
        color: '#888',
        fontStyle: 'italic',
    },
    // Kiểu tùy chỉnh Font
    fontCustomizationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
    },
    fontCustomizationTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    fontCustomizationContent: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    fontSection: {
        marginBottom: 24,
    },
    fontSectionTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#4a90e2',
        marginBottom: 12,
    },
    fontLabel: {
        fontSize: 13,
        color: '#666',
        marginBottom: 8,
        marginTop: 12,
    },
    fontFamilyScroll: {
        marginBottom: 8,
    },
    fontFamilyButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    fontFamilyButtonActive: {
        backgroundColor: '#4a90e2',
        borderColor: '#4a90e2',
    },
    fontFamilyText: {
        fontSize: 13,
        color: '#666',
    },
    fontFamilyTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    slider: {
        width: '100%',
        height: 40,
    },
    fontToggles: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    fontToggleButton: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    fontToggleButtonActive: {
        backgroundColor: '#4a90e2',
        borderColor: '#4a90e2',
    },
    fontToggleText: {
        fontSize: 18,
        color: '#666',
    },
    fontToggleTextActiveStyle: {
        color: '#fff',
    },
    previewSection: {
        marginTop: 16,
        padding: 16,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
    },
    previewLabel: {
        fontSize: 13,
        color: '#666',
        marginBottom: 12,
        fontWeight: '600',
    },
    previewBox: {
        backgroundColor: '#f0f0f0',
        height: 160,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        position: 'relative',
        overflow: 'hidden',
    },
    previewBg: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewHint: {
        color: '#ccc',
        fontSize: 12,
        fontStyle: 'italic',
    },
    previewTitle: {
        color: '#333',
    },
    previewSubtitle: {
        color: '#666',
    },
    // Kiểu xem trước mới
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    previewContainer: {
        height: 160,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
        position: 'relative',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    previewText: {
        fontWeight: 'bold',
        backgroundColor: 'transparent',
    },
    previewSubtext: {
        backgroundColor: 'transparent',
    },
    previewPlaceholderText: {
        textAlign: 'center',
        color: '#999',
        marginTop: 60,
    },
    // Kiểu bảng màu
    colorPaletteScroll: {
        marginBottom: 8,
    },
    colorButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 2,
        borderColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
    },
    colorButtonActive: {
        borderColor: '#4a90e2',
        borderWidth: 3,
    },
});

export default CreateBannerScreen;
