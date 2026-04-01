import { Redirect } from 'expo-router';

export default function Index() {
  // Currently redirecting straight to login
  // Once auth logic is built, you can conditionally route to /(tabs) or /(auth)
  return <Redirect href="/(auth)/login" />;
}
