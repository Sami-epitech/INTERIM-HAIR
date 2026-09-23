import type { Screen } from "../types";
import { AppName, BackBtn } from "../components/ui";

export function LegalScreen({
    onNavigate,
}: {
    onNavigate: (s: Screen) => void;
}) {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="px-5 pt-8 pb-4 flex items-center gap-3 border-b border-border">
                <BackBtn onClick={() => onNavigate("role-select")} />
                <AppName size="sm" />
            </header>

            <main className="flex-1 px-6 py-8 max-w-3xl w-full mx-auto">
                <h1 className="font-serif text-3xl text-foreground">
                    Mentions légales
                </h1>

                <div className="mt-8 flex flex-col gap-8 text-sm text-muted-foreground leading-relaxed">
                    <section>
                        <h2 className="text-lg font-semibold text-foreground">
                            Nature du projet
                        </h2>
                        <p className="mt-2">
                            Interim'hair est un projet pédagogique réalisé dans le cadre d'un
                            projet scolaire. L'application constitue un prototype de plateforme
                            destinée à faciliter la mise en relation entre les professionnels de
                            la coiffure et les entreprises à la recherche de profils.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-foreground">
                            Offres d'emploi
                        </h2>
                        <p className="mt-2">
                            Les offres d'emploi affichées dans le prototype peuvent provenir de
                            l'API de France Travail. Ces données correspondent à des offres
                            d'emploi publiées sur le service France Travail et ne sont pas créées
                            par Interim'hair.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-foreground">
                            Statut du prototype
                        </h2>
                        <p className="mt-2">
                            Interim'hair est un prototype pédagogique et ne constitue pas, dans
                            le cadre de ce projet, une entreprise de travail temporaire. Le
                            prototype ne conclut pas de contrats de mission et n'organise pas
                            juridiquement la mise à disposition de salariés.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-foreground">
                            Données de démonstration
                        </h2>
                        <p className="mt-2">
                            Certaines données et fonctionnalités utilisées pour démontrer le
                            fonctionnement de l'application peuvent être simulées ou limitées
                            aux besoins du projet pédagogique. Les offres provenant de France
                            Travail constituent une exception : elles sont issues de données
                            réelles accessibles via l'API utilisée par le prototype.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-foreground">
                            Finalité pédagogique
                        </h2>
                        <p className="mt-2">
                            Les fonctionnalités présentées servent à démontrer le fonctionnement
                            technique d'une plateforme de mise en relation. Elles ne constituent
                            pas une offre de service professionnelle ni un engagement contractuel
                            de la part d'Interim'hair.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}