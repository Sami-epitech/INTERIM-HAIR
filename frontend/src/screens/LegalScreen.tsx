import type { Screen } from "../types";
import { AppName, BackBtn } from "../components/ui";

export function LegalScreen({
    onNavigate,
    onBack,
}: {
    onNavigate: (s: Screen) => void;
    onBack?: () => void;
}) {
    const handleBack = () => {
        if (onBack) {
            onBack();
            return;
        }
        const userMode = localStorage.getItem("user_mode") || "candidate";
        const isLoggedIn = Boolean(
            localStorage.getItem("auth_token") ||
            localStorage.getItem("token") ||
            localStorage.getItem("user_email")
        );
        if (isLoggedIn) {
            onNavigate(userMode === "recruiter" ? "r-dashboard" : "feed");
        } else {
            onNavigate("role-select");
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="px-5 pt-8 pb-4 flex items-center gap-3 border-b border-border">
                <BackBtn onClick={handleBack} />
                <AppName size="sm" />
            </header>

            <main className="flex-1 px-6 py-8 max-w-3xl w-full mx-auto">
                <h1 className="font-serif text-3xl text-foreground">
                    Mentions légales & RGPD
                </h1>

                <div className="mt-8 flex flex-col gap-8 text-sm text-muted-foreground leading-relaxed">
                    <section>
                        <h2 className="text-lg font-semibold text-foreground">
                            Nature et statut du projet
                        </h2>
                        <p className="mt-2">
                            Interim'hair est un prototype technique réalisé exclusivement dans le
                            cadre d'un projet pédagogique.
                            L'application ne constitue en aucun cas une véritable entreprise de
                            travail temporaire ni une offre de service professionnelle.
                            Le prototype ne conclut aucun contrat de mission et n'organise pas
                            juridiquement la mise à disposition de salariés.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-foreground">
                            Provenance des données
                        </h2>
                        <p className="mt-2">
                            Afin de démontrer le fonctionnement de l'application, la majorité des
                            données et profils sont simulés.
                            Seules les offres d'emploi affichées dans le flux proviennent de l'API
                            officielle de France Travail.
                            Ces offres sont réelles, publiques, et ne sont pas créées ni gérées par
                            Interim'hair.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-foreground">
                            Politique de Confidentialité (RGPD)
                        </h2>
                        <p className="mt-2">
                            Chez Interim'hair, la protection de vos données personnelles est une
                            priorité technique et éthique. Voici comment nous collectons, utilisons
                            et protégeons vos informations en toute transparence.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-foreground">
                            1. Quelles données collectons-nous ?
                        </h3>
                        <p className="mt-2">
                            Si vous êtes un Intérimaire : Nous collectons votre e-mail, identité
                            (prénom, nom), compétences (coupe, coloration, etc.), diplômes,
                            localisation, mobilité, taux horaire souhaité, ainsi que votre CV et
                            numéro de téléphone.
                        </p>
                        <p className="mt-2">
                            Si vous êtes un Recruteur : Nous collectons
                            l'e-mail, le nom de votre salon, votre SIRET, votre adresse et votre
                            numéro de téléphone. Vos données d'authentification (mots de passe)
                            sont systématiquement hachées.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-foreground">
                            2. Pourquoi utilisons-nous vos données ?
                        </h3>
                        <p className="mt-2">
                            Vos données servent exclusivement à faire fonctionner notre service,
                            et plus particulièrement notre algorithme de matching.
                            Les critères tels que vos compétences, votre localisation, vos horaires
                            et votre rémunération sont analysés pour calculer un score de compatibilité
                            (0 à 100%) entre une offre et un candidat.
                            Nous utilisons également MongoDB pour enregistrer les logs de calculs
                            algorithmiques et gérer l'envoi de notifications (webhooks) en temps réel
                            tout en évitant les doublons (anti-spam).
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-foreground">
                            3. Comment protégeons-nous vos données sensibles ?
                        </h3>
                        <p className="mt-2">
                            La sécurité de vos données est assurée par des protocoles
                            cryptographiques avancés :
                        </p>
                        <p className="mt-2">
                            Chiffrement au repos : Vos données extrêmement
                            sensibles (comme votre numéro de téléphone, votre CV et vos pièces d'identité)
                            sont chiffrées sur nos serveurs en utilisant l'algorithme robuste AES-256-GCM.
                        </p>
                        <p className="mt-2">
                            Intégrité des fichiers : Le chiffrement AES-256-GCM génère un tag
                            d'authentification garantissant que si un seul octet de votre document
                            est altéré sur le disque, son déchiffrement sera automatiquement rejeté.
                        </p>
                        <p className="mt-2">
                            Sécurité des accès : Les fichiers chiffrés ne sont déchiffrés "à la volée"
                            qu'au moment précis de leur téléchargement par un recruteur explicitement habilité.
                            Les mots de passe sont salés et hachés avec Bcrypt (10 tours), et les sessions
                            sont protégées par des jetons JWT.
                        </p>
                        <p className="mt-2">
                            Sécurité en transit : Toutes les
                            communications avec notre API sont protégées par des en-têtes HTTP stricts
                            (HSTS, protection anti-XSS, anti-clickjacking).
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-foreground">
                            4. Vos droits sur vos données
                        </h3>
                        <p className="mt-2">
                            Conformément au Règlement Général sur la Protection des Données (RGPD),
                            vous disposez d'un droit d'accès, de rectification, de suppression et de
                            portabilité de vos données.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}