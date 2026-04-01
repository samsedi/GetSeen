
import {Platform, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from "react-native-safe-area-context";

export default function reserveNow() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.container}>
                <Text style={styles.HomeScreenText}>ReserveNow screen</Text>
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
