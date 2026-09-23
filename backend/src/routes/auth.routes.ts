/**
 * Routes d'authentification tierce (OAuth 2.0 Google et Facebook).
 */
import { Router, Request, Response, NextFunction } from "express";
import passport, { OAuthUser } from "../auth/passport";
import { generateToken } from "../auth/jwt";

const router = Router();

// Middleware de vérification de la configuration des fournisseurs OAuth
const ensureConfigured = (providerName: "google" | "facebook") => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (providerName === "google" && (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET)) {
      return res.status(503).json({
        error: "Le service d'authentification Google n'est pas configuré sur le serveur.",
      });
    }
    if (providerName === "facebook" && (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET)) {
      return res.status(503).json({
        error: "Le service d'authentification Facebook n'est pas configuré sur le serveur.",
      });
    }
    next();
  };
};

// ── Authentification Google ─────────────────────────────────

// Redirection vers l'écran d'autorisation Google
router.get(
  "/google",
  ensureConfigured("google"),
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

// Callback de retour Google après authentification
router.get(
  "/google/callback",
  ensureConfigured("google"),
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=oauth_failed`,
  }),
  (req: Request, res: Response) => {
    const user = req.user as OAuthUser;

    // Émission du jeton d'authentification applicatif
    const token = generateToken(
      {
        userId: user.providerId,
        email: user.email,
        name: user.displayName,
        provider: user.provider,
        avatarUrl: user.avatarUrl,
      },
      "30s"
    );

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}?token=${encodeURIComponent(token)}`);
  }
);

// ── Authentification Facebook ───────────────────────────────

// Redirection vers l'écran d'autorisation Facebook
router.get(
  "/facebook",
  ensureConfigured("facebook"),
  passport.authenticate("facebook", {
    scope: ["email"],
    session: false,
  })
);

// Callback de retour Facebook après authentification
router.get(
  "/facebook/callback",
  ensureConfigured("facebook"),
  passport.authenticate("facebook", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=oauth_failed`,
  }),
  (req: Request, res: Response) => {
    const user = req.user as OAuthUser;

    // Émission du jeton d'authentification applicatif
    const token = generateToken(
      {
        userId: user.providerId,
        email: user.email,
        name: user.displayName,
        provider: user.provider,
        avatarUrl: user.avatarUrl,
      },
      "7d"
    );

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}/auth/callback?token=${encodeURIComponent(token)}`);
  }
);

export default router;
