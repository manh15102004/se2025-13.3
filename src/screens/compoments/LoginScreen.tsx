import React, { useState, useEffect } from "react";
import { SafeAreaView, StatusBar, StyleSheet, Text, TextInput, View, TouchableOpacity, Alert} from "react-native";
import Icon from 'react-native-vector-icons/Fontisto';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';


const LoginScreen = ({ navigation }: any)=>{
    const [isRemember, setIsRemember] = useState(false);
    const [email, setEmail] = useState('demo@example.com');
    const [password, setPassword] = useState('123456');
    
    
    const handleLogin = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email) {
            Alert.alert('Error', 'Email không được để trống');
            return;
        }
        
        if (!emailRegex.test(email)) {
            Alert.alert('Error', 'Email không hợp lệ');
            return;
        }
        
        if (!password) {
            Alert.alert('Error', 'Password không được để trống');
            return;
        }
        
        if (password.length < 6) {
            Alert.alert('Error', 'Password phải có ít nhất 6 ký tự');
            return;
        }
        
        const formData = {
            email: email,
            password: password,
            checkbox: isRemember
        };
        Alert.alert('Login Success', JSON.stringify(formData, null, 2));
        navigation.navigate('Home');
    };

    
    return(
  <SafeAreaView style = {styles.container}>
        <StatusBar backgroundColor={'#f5f5f5ff'} barStyle={"dark-content"}></StatusBar>

            <View style={styles.header}>
                <Text style={styles.welcomeTitle}>Login</Text>
            
            </View>

       
            <View style ={styles.form}>
                <Icon name="email" size={24} color="gray" />
                <TextInput 
                    placeholder="Email Address" 
                    style={styles.input}
                    editable={true}
                    placeholderTextColor="#d1d5db"
                    onChangeText={(text) => setEmail(text)}
                    value={email}
                ></TextInput>
            </View>

            <View style ={styles.form}>
                <Icon name="locked" size={24} color="gray" />
                <TextInput 
                    placeholder="Password" 
                    style={styles.input}
                    editable={true}
                    placeholderTextColor="#d1d5db"
                    secureTextEntry={true}
                    onChangeText={(text) => setPassword(text)}
                    value={password}
                ></TextInput>
                <Icon name="eye-off" size={20} color="#d1d5db" />
            </View>

            <View style={styles.rememberContainer}>
                <TouchableOpacity 
                    style={[styles.checkbox, isRemember && styles.checkboxActive]}
                    onPress={() => setIsRemember(!isRemember)}
                >
                    {isRemember && <Icon name="check" size={14} color="white" />}
                </TouchableOpacity>
                <Text style={styles.rememberText}>Save password</Text>
                <Text style={styles.forgotText}>Forgot password?</Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <Text style={styles.orContinue}>Or continue with</Text>

            <View style={styles.socialContainer}>
                <TouchableOpacity style={styles.socialButton} >
                    <Text style={styles.socialIcon}>f</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Didn't have an account? </Text>
                <TouchableOpacity>
                    <Text style={styles.signupLink}>Sign Up</Text>
                </TouchableOpacity>
            </View>
       
        
    </SafeAreaView>
      
    )
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:'#f5f5f5ff'
    },
    backButton:{
        padding:16,
        width:50,
        height:50,
        borderRadius:25,
        backgroundColor:'#e5e7eb',
        alignItems:'center',
        justifyContent:'center',
        marginTop:10,
        marginLeft:16,
    },
    header:{
        marginHorizontal:16,
        marginTop:20,
        alignItems:'center'
    },
    welcomeTitle:{
        fontSize:28,
        fontWeight:'bold',
        color:'black',
        marginBottom:8,
    },
    title:{
        marginTop:30,
        alignItems:'center'
    },
    form:{
        flexDirection:'row',
        alignItems:'center',
        marginHorizontal:16,
        marginTop:20,
        backgroundColor:'#f3f4f6',
        borderRadius:12,
        paddingHorizontal:16,
    },
    group:{
        backgroundColor:'red',
    },
    input:{
        padding:16,
        height:56,
        flex:1,
        fontSize:16,
        color:'black',
        borderWidth:0,
    },
    icon:{
        fontSize:25,
        position:'absolute',
        top:10,
    },
    button:{
        backgroundColor:'#1f2937',
        padding:16,
        marginHorizontal:16,
        marginTop:24,
        borderRadius:28,
        alignItems:'center',
    },
    buttonText:{
        color:'white',
        fontSize:16,
        fontWeight:'600',
    },
    rememberContainer:{
        flexDirection:'row',
        alignItems:'center',
        marginHorizontal:16,
        marginTop:16,
        justifyContent:'space-between',
    },
    checkbox:{
        width:20,
        height:20,
        borderRadius:4,
        borderWidth:2,
        borderColor:'#d1d5db',
        alignItems:'center',
        justifyContent:'center',
    },
    checkboxActive:{
        backgroundColor:'#d1d5db',
        borderColor:'#d1d5db',
    },
    rememberText:{
        flex:1,
        marginLeft:10,
        color:'#d1d5db',
        fontSize:14,
    },
    forgotText:{
        color:'#f97316',
        fontSize:14,
        fontWeight:'600',
    },
    orContinue:{
        textAlign:'center',
        color:'#9ca3af',
        fontSize:14,
        marginTop:24,
        marginBottom:16,
    },
    socialContainer:{
        flexDirection:'row',
        justifyContent:'center',
        gap:16,
        marginHorizontal:16,
    },
    socialButton:{
        width:56,
        height:56,
        borderRadius:28,
        backgroundColor:'#f3f4f6',
        alignItems:'center',
        justifyContent:'center',
        borderWidth:1,
        borderColor:'#e5e7eb',
    },
    socialIcon:{
        fontSize:24,
        color:'#6b7280',
        fontWeight:'600',
    },
    signupContainer:{
        flexDirection:'row',
        justifyContent:'center',
        marginTop:24,
        marginBottom:20,
    },
    signupText:{
        color:'#9ca3af',
        fontSize:14,
    },
    signupLink:{
        color:'#1f2937',
        fontSize:14,
        fontWeight:'600',
    },
    
})

export default LoginScreen;