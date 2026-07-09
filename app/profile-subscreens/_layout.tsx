import {Stack} from "expo-router";

export default function screenOwnerHomeSubScreens(){
    return(
        <Stack   screenOptions={{headerShown:false}}>
            <Stack.Screen name="edit" options={{headerShown:false}} />
            <Stack.Screen name="feedback" options={{headerShown:false}} />
            <Stack.Screen name="report" options={{headerShown:false}} />
        </Stack>
    );
}