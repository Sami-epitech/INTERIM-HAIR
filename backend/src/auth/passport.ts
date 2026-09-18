import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";

export interface OAuthUser {
  provider: "google" | "facebook";
  providerId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  displayName: string;
  avatarUrl?: string;
}

// Configuration Google OAuth
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleCallbackUrl =
  process.env.GOOGLE_CALLBACK_URL || "http://localhost:8000/api/auth/google/callback";

if (googleClientId && googleClientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: googleCallbackUrl,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const user: OAuthUser = {
            provider: "google",
            providerId: profile.id,
            email: profile.emails?.[0]?.value,
            firstName: profile.name?.givenName,
            lastName: profile.name?.familyName,
            displayName: profile.displayName,
            avatarUrl: profile.photos?.[0]?.value,
          };
          return done(null, user);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
} else {
  console.warn(
    "[OAuth Warning] GOOGLE_CLIENT_ID ou GOOGLE_CLIENT_SECRET non définis. Google Auth désactivé."
  );
}

// Configuration Facebook OAuth
const facebookAppId = process.env.FACEBOOK_APP_ID;
const facebookAppSecret = process.env.FACEBOOK_APP_SECRET;
const facebookCallbackUrl =
  process.env.FACEBOOK_CALLBACK_URL || "http://localhost:8000/api/auth/facebook/callback";

if (facebookAppId && facebookAppSecret) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: facebookAppId,
        clientSecret: facebookAppSecret,
        callbackURL: facebookCallbackUrl,
        profileFields: ["id", "emails", "name", "displayName", "photos"],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const user: OAuthUser = {
            provider: "facebook",
            providerId: profile.id,
            email: profile.emails?.[0]?.value,
            firstName: profile.name?.givenName,
            lastName: profile.name?.familyName,
            displayName: profile.displayName,
            avatarUrl: profile.photos?.[0]?.value,
          };
          return done(null, user);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
} else {
  console.warn(
    "[OAuth Warning] FACEBOOK_APP_ID ou FACEBOOK_APP_SECRET non définis. Facebook Auth désactivé."
  );
}

export default passport;
