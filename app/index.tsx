import { Redirect } from 'expo-router';

export default function Index() {
    // This instantly forwards the app to your role screen the millisecond it boots up
    return <Redirect href="/(auth)/roles" />;
}