module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env.local',
        blacklist: null,
        whitelist: [
          'EXPO_PUBLIC_SUPABASE_URL',
          'EXPO_PUBLIC_SUPABASE_ANON_KEY',
          'EXPO_PUBLIC_GOOGLE_CLIENT_ID'
        ],
        safe: false,
        allowUndefined: true,
      }]
    ]
  };
};
