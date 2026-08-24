import {Stack} from "expo-router";

export default function screenOwnerHomeSubScreens(){
        return(
        <Stack   screenOptions={{headerShown:false}}>
        <Stack.Screen name="manage-screen" options={{headerShown:false}} />
        <Stack.Screen name="onboarding-tutorial" options={{headerShown:false}} />
        </Stack>
        );
}