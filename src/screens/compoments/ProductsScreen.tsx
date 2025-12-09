import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, TextInput, Image, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import IconAnt from 'react-native-vector-icons/AntDesign';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { productAPI } from '../../api/client';
import { CATEGORIES_HIERARCHY } from '../../constants/categories';

type Props = NativeStackScreenProps<RootStackParamList, 'Products'>;

const ProductsScreen: React.FC<Props> = ({ navigation }) => {
    const [products, setProducts] = React.useState<any[]>([]);
    const [filteredProducts, setFilteredProducts] = React.useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = React.useState('All');
    const [selectedSubCategory, setSelectedSubCategory] = React.useState('All');
    const [searchQuery, setSearchQuery] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const categories = [
        { name: 'All', icon: '>>', image: null, subCategories: [] },
        ...CATEGORIES_HIERARCHY
    ];

    const currentSubCategories = React.useMemo(() => {
        const category = categories.find(c => c.name === selectedCategory);
        return category?.subCategories || [];
    }, [selectedCategory]);

    React.useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);
                const response = await productAPI.getAllProducts();
                if (response.success && response.data) {
                    const transformedProducts = response.data.map((product: any) => ({
                        ...product,
                        stocks: product.quantity || 0,
                        reviews: product.reviews || 0,
                        priceValue: Number(product.price) || 0,
                        price: `${Number(product.price).toLocaleString('vi-VN')}đ`,
                        image: product.image || 'https://via.placeholder.com/300x300?text=No+Image',
                        rating: product.rating || 0,
                    }));
                    setProducts(transformedProducts);
                }
            } catch (error) {
                console.log('Failed to load products:', error);
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, []);

    // Filter products
    React.useEffect(() => {
        let filtered = products;

        if (selectedCategory !== 'All') {
            filtered = filtered.filter(p => p.category === selectedCategory);

            if (selectedSubCategory !== 'All') {
                filtered = filtered.filter(p => p.subCategory === selectedSubCategory);
            }
        }

        if (searchQuery) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredProducts(filtered);
    }, [products, selectedCategory, selectedSubCategory, searchQuery]);

    const handleSelectCategory = (name: string) => {
        setSelectedCategory(name);
        setSelectedSubCategory('All'); // Reset sub-category when main category changes
    };

    const renderProduct = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.productCard}
            onPress={() => navigation.navigate('ProductDetail', { product: item })}
        >
            {item.image && (item.image.startsWith('http') || item.image.startsWith('data:')) ? (
                <Image source={{ uri: item.image }} style={styles.productImage} />
            ) : (
                <View style={[styles.productImage, { backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' }]}>
                    <Text style={{ fontSize: 40 }}>{item.image || '📦'}</Text>
                </View>
            )}
            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                <View style={styles.ratingRow}>
                    <IconAnt name="star" size={12} color="#ffa500" />
                    <Text style={styles.rating}>{item.rating}</Text>
                    <Text style={styles.reviews}>({item.reviews})</Text>
                </View>
                <Text style={styles.price}>{item.price}</Text>
                <Text style={styles.stock}>Stock: {item.stocks}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={'#ffffff'} barStyle={'dark-content'} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={24} color="#1a1a2e" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tất cả sản phẩm</Text>
                <TouchableOpacity>
                    <Icon name="filter" size={24} color="#1a1a2e" />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Icon name="search" size={18} color="#999" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm kiếm sản phẩm..."
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Categories */}
            <View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
                    {categories.map((category, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.categoryButton,
                                selectedCategory === category.name && styles.categoryButtonActive,
                            ]}
                            onPress={() => handleSelectCategory(category.name)}
                        >
                            <View style={styles.categoryContent}>
                                <Text style={styles.categoryIcon}>{category.icon}</Text>
                                <Text
                                    style={[
                                        styles.categoryText,
                                        selectedCategory === category.name && styles.categoryTextActive,
                                    ]}
                                >
                                    {category.name}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Sub Categories */}
                {selectedCategory !== 'All' && currentSubCategories.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.categoriesContainer, { marginTop: -8 }]}>
                        <TouchableOpacity
                            style={[
                                styles.subCategoryButton,
                                selectedSubCategory === 'All' && styles.subCategoryButtonActive,
                            ]}
                            onPress={() => setSelectedSubCategory('All')}
                        >
                            <Text style={[styles.subCategoryText, selectedSubCategory === 'All' && styles.subCategoryTextActive]}>Tất cả</Text>
                        </TouchableOpacity>
                        {currentSubCategories.map((sub, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.subCategoryButton,
                                    selectedSubCategory === sub && styles.subCategoryButtonActive,
                                ]}
                                onPress={() => setSelectedSubCategory(sub)}
                            >
                                <Text style={[styles.subCategoryText, selectedSubCategory === sub && styles.subCategoryTextActive]}>{sub}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </View>

            {/* Products Grid */}
            <FlatList
                data={filteredProducts}
                renderItem={renderProduct}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                contentContainerStyle={styles.productsGrid}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            {loading ? 'Đang tải...' : 'Không có sản phẩm nào'}
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a2e',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 24,
        paddingHorizontal: 12,
        marginHorizontal: 16,
        marginBottom: 12,
        height: 40,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        color: '#1a1a2e',
    },
    categoriesContainer: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    categoryButton: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginRight: 12,
        borderRadius: 16,
        backgroundColor: '#f0f0f0',
        minWidth: 80, // Reduced width for "All >>"
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
    },
    categoryButtonActive: {
        backgroundColor: '#4a90e2',
        borderWidth: 2,
        borderColor: '#4a90e2',
    },
    categoryContent: {
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    categoryIcon: {
        fontSize: 28,
        marginBottom: 4,
    },
    categoryText: {
        fontSize: 11,
        color: '#666',
        fontWeight: '600',
        textAlign: 'center',
    },
    categoryTextActive: {
        color: 'white',
    },
    subCategoryButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 8,
        borderRadius: 12,
        backgroundColor: '#f5f5f5',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    subCategoryButtonActive: {
        backgroundColor: '#e6f2ff',
        borderColor: '#4a90e2',
    },
    subCategoryText: {
        fontSize: 12,
        color: '#666',
    },
    subCategoryTextActive: {
        color: '#4a90e2',
        fontWeight: '600',
    },
    productsGrid: {
        paddingHorizontal: 8,
        paddingBottom: 20,
    },
    productCard: {
        flex: 1,
        margin: 8,
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        overflow: 'hidden',
        maxWidth: '46%',
    },
    productImage: {
        width: '100%',
        height: 150,
        resizeMode: 'cover',
        backgroundColor: '#e8e8e8',
    },
    productInfo: {
        padding: 12,
    },
    productName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1a1a2e',
        marginBottom: 4,
        minHeight: 36,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        gap: 4,
    },
    rating: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1a1a2e',
    },
    reviews: {
        fontSize: 11,
        color: '#999',
    },
    price: {
        fontSize: 16,
        fontWeight: '700',
        color: '#4a90e2',
        marginBottom: 4,
    },
    stock: {
        fontSize: 11,
        color: '#666',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 14,
        color: '#999',
    },
});

export default ProductsScreen;
