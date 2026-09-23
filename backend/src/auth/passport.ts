import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";

/**
 * Profil normalisé extrait depuis les fournisseurs d'identité tiers (OAuth).
 */
export interface OAuthUser {
  provider: "google" | "facebook";
  providerId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  displayName: string;
  avatarUrl?: string;
}

// Configuration de la stratégie Google OAuth 2.0
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
    "[OAUTH] Identifiants Google manquants (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET). Authentification Google désactivée."
  );
}

// Configuration de la stratégie Facebook OAuth
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
    "[OAUTH] Identifiants Facebook manquants (FACEBOOK_APP_ID / FACEBOOK_APP_SECRET). Authentification Facebook désactivée."
  );
}

export default passport;
