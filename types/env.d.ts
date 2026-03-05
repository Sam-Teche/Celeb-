declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly NODE_ENV: "development" | "production" | "test";
      readonly PORT?: string;

      // MongoDB
      readonly MONGO_URI: string;

      // JWT
      readonly JWT_SECRET: string;
      readonly JWT_EXPIRES_IN?: string;
      readonly ADMIN_JWT_SECRET: string;

      // Admin
      readonly ADMIN_SUPER_KEY: string;

      // Cloudinary
      readonly CLOUDINARY_CLOUD_NAME: string;
      readonly CLOUDINARY_API_KEY: string;
      readonly CLOUDINARY_API_SECRET: string;

      // Resend
      readonly RESEND_API_KEY: string;
      readonly EMAIL_FROM?: string;

      // OAuth / URLs
      readonly CLIENT_URL?: string;
      readonly NETLIFY_URL?: string;
      readonly ADMIN_URL?: string;
      readonly GOOGLE_CLIENT_ID?: string;
      readonly GOOGLE_CLIENT_SECRET?: string;
      readonly FACEBOOK_CLIENT_ID?: string;
      readonly FACEBOOK_CLIENT_SECRET?: string;
      readonly TWITTER_CONSUMER_KEY?: string;
      readonly TWITTER_CONSUMER_SECRET?: string;
    }
  }
}

export {};
