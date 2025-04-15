import * as Notifications from "expo-notifications"
import * as Device from "expo-device"
import { Platform } from "react-native"

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

// Register for push notifications
export async function registerForPushNotificationsAsync() {
  let token

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    })
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }
    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!")
      return
    }
    token = (await Notifications.getExpoPushTokenAsync()).data
  } else {
    console.log("Must use physical device for Push Notifications")
  }

  return token
}

// Schedule a notification
export async function schedulePushNotification({
  title,
  body,
  data = {},
  trigger,
  identifier,
}: {
  title: string
  body: string
  data?: any
  trigger: any
  identifier?: string
}) {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
    },
    trigger,
    identifier,
  })
}

// Cancel a scheduled notification
export async function cancelScheduledNotification(identifier: string) {
  await Notifications.cancelScheduledNotificationAsync(identifier)
}

// Cancel all scheduled notifications
export async function cancelAllScheduledNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync()
}
