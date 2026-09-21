import { Router, Request, Response, NextFunction } from "express";
import passport, { OAuthUser } from "../auth/passport";
import { generateToken } from "../auth/jwt";

const router = Router();

// Middleware utilitaire pour vérifier si un provider est configuré
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

// -------------------------------------------------------------
// ROUTES GOOGLE
// -------------------------------------------------------------

// 1. Redirection vers l'écran de consentement Google
router.get(
  "/google",
  ensureConfigured("google"),
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

// 2. Callback de retour après validation Google
router.get(
  "/google/callback",
  ensureConfigured("google"),
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=oauth_failed`,
  }),
  (req: Request, res: Response) => {
    const user = req.user as OAuthUser;

    // Génération du token JWT de l'application
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
    // Redirection vers le frontend avec le token
    res.redirect(`${frontendUrl}?token=${encodeURIComponent(token)}`);
  }
);

// -------------------------------------------------------------
// ROUTES FACEBOOK
// -------------------------------------------------------------

// 1. Redirection vers Facebook Login
router.get(
  "/facebook",
  ensureConfigured("facebook"),
  passport.authenticate("facebook", {
    scope: ["email"],
    session: false,
  })
);

// 2. Callback de retour après validation Facebook
router.get(
  "/facebook/callback",
  ensureConfigured("facebook"),
  passport.authenticate("facebook", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=oauth_failed`,
  }),
  (req: Request, res: Response) => {
    const user = req.user as OAuthUser;

    // Génération du token JWT de l'application
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
