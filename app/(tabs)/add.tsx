import React from "react";
import {Platform, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from "react-native-safe-area-context";

export default function add() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.container}>
                <Text style={styles.HomeScreenText}>AddNew</Text>
            </View>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    HomeScreenText:{
        color:"#ffffff",
        alignSelf:'center',
        fontSize:18,
    }
});
