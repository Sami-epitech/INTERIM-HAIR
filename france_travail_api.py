"""
Module d'interaction avec l'API Offres d'emploi de France Travail (v2).
Documentation officielle : https://francetravail.io/produits-partages/catalogue/offres-emploi-v2
"""

import os
import sys
import time
import json
import argparse
from typing import Optional, Dict, Any, List
import requests
from dotenv import load_dotenv

# Reconfiguration de la sortie standard en UTF-8 pour Windows si nécessaire
if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Chargement des variables d'environnement depuis le fichier .env
load_dotenv()


class FranceTravailAPI:
    """Client pour interroger l'API Offres d'emploi de France Travail."""

    AUTH_URL = "https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=%2Fpartenaire"
    BASE_URL = "https://api.francetravail.io/partenaire/offresdemploi/v2"
    DEFAULT_SCOPE = "api_offresdemploiv2 o2dsoffre"
    CODE_ROME = "D1202" # Coiffure

    def __init__(
        self,
        client_id: Optional[str] = None,
        client_secret: Optional[str] = None,
        scope: Optional[str] = None,
    ):
        """
        Initialise le client avec les identifiants de l'API.
        Si non renseignés, ils sont récupérés des variables d'environnement ou des valeurs par défaut.
        """
        self.client_id = client_id or os.getenv("FT_CLIENT_ID")
        self.client_secret = client_secret or os.getenv("FT_CLIENT_SECRET")
        self.scope = scope or self.DEFAULT_SCOPE

        self._access_token: Optional[str] = None
        self._token_expires_at: float = 0.0

    def get_access_token(self, force_refresh: bool = False) -> str:
        """
        Obtient ou renouvelle le jeton d'accès OAuth2 (Client Credentials).
        Le jeton est mis en cache et renouvelé automatiquement avant expiration.
        """
        # Renouveler si le token est manquant, forcé, ou expire dans moins de 60 secondes
        if force_refresh or not self._access_token or time.time() >= (self._token_expires_at - 60):
            payload = {
                "grant_type": "client_credentials",
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "scope": self.scope,
            }
            headers = {"Content-Type": "application/x-www-form-urlencoded"}

            response = requests.post(self.AUTH_URL, data=payload, headers=headers, timeout=15)

            if response.status_code != 200:
                raise RuntimeError(
                    f"Échec de l'authentification ({response.status_code}) : {response.text}"
                )

            data = response.json()
            self._access_token = data.get("access_token")
            expires_in = data.get("expires_in", 1499)
            self._token_expires_at = time.time() + expires_in

        return self._access_token

    def _get_headers(self) -> Dict[str, str]:
        """Génère les en-têtes d'autorisation pour les requêtes HTTP."""
        token = self.get_access_token()
        return {
            "Authorization": f"Bearer {token}",
            "Accept": "application/json",
        }

    def rechercher_offres(
        self,
        mots_cles: Optional[str] = None,
        commune: Optional[str] = None,
        departement: Optional[str] = None,
        code_rome: Optional[str] = CODE_ROME,
        type_contrat: Optional[str] = None,
        nature_contrat: Optional[str] = None,
        distance: Optional[int] = None,
        range_start: int = 0,
        range_end: int = 49,
        extra_params: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Recherche des offres d'emploi selon plusieurs critères.

        Paramètres :
            - mots_cles : Mots-clés de recherche (ex: 'coiffeur', 'développeur python')
            - commune : Code INSEE de la commune (ex: '75115' pour Paris 15e, '59350' pour Lille)
            - departement : Numéro de département (ex: '75', '59')
            - code_rome : Code ROME du métier ('D1202' = Coiffure)
            - type_contrat : Type de contrat (ex: 'CDI', 'CDD', 'MIS' pour intérim)
            - nature_contrat : Nature de contrat (ex: 'E1' pour contrat de travail, 'E2' pour apprentissage)
            - distance : Rayon de recherche en km autour de la commune (0 à 100)
            - range_start : Index de début pour la pagination (max 150 éléments par requête)
            - range_end : Index de fin pour la pagination
            - extra_params : Dictionnaire de paramètres additionnels pour l'API France Travail

        Retourne :
            Un dictionnaire contenant la liste des offres ('resultats') et les métadonnées de pagination.
        """
        url = f"{self.BASE_URL}/offres/search"

        params: Dict[str, Any] = {
            "range": f"{range_start}-{range_end}",
        }

        if mots_cles:
            params["motsCles"] = mots_cles
        if commune:
            params["commune"] = commune
        if departement:
            params["departement"] = departement
        if code_rome:
            params["codeROME"] = code_rome
        if type_contrat:
            params["typeContrat"] = type_contrat
        if nature_contrat:
            params["natureContrat"] = nature_contrat
        if distance is not None:
            params["distance"] = distance

        if extra_params:
            params.update(extra_params)

        response = requests.get(url, headers=self._get_headers(), params=params, timeout=20)

        # Si le token a expiré entre temps, on réessaie une fois après refresh
        if response.status_code == 401:
            self.get_access_token(force_refresh=True)
            response = requests.get(url, headers=self._get_headers(), params=params, timeout=20)

        # 204 No Content : Aucun résultat trouvé
        if response.status_code == 204:
            return {"resultats": [], "content_range": None, "total": 0}

        # 200 OK ou 206 Partial Content sont les codes de succès attendus
        if response.status_code not in (200, 206):
            raise RuntimeError(
                f"Erreur lors de la recherche ({response.status_code}) : {response.text}"
            )

        content_range = response.headers.get("Content-Range", "")
        total = 0
        if "/" in content_range:
            try:
                total = int(content_range.split("/")[-1])
            except ValueError:
                total = 0

        data = response.json()
        resultats = data.get("resultats", [])

        return {
            "resultats": resultats,
            "content_range": content_range,
            "total": total,
            "filtresPossibles": data.get("filtresPossibles", []),
        }

    def rechercher_toutes_les_offres(
        self,
        mots_cles: Optional[str] = None,
        commune: Optional[str] = None,
        departement: Optional[str] = None,
        code_rome: Optional[str] = None,
        type_contrat: Optional[str] = None,
        max_offres: int = 150,
        extra_params: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Récupère automatiquement plusieurs pages d'offres jusqu'à atteindre `max_offres`
        (dans la limite de 1000 offres imposée par l'API France Travail).
        """
        offres_accumulees: List[Dict[str, Any]] = []
        page_size = 149  # Max ~150 par requête
        current_start = 0

        max_offres = min(max_offres, 1000)

        while current_start < max_offres:
            current_end = min(current_start + page_size, max_offres - 1)
            res = self.rechercher_offres(
                mots_cles=mots_cles,
                commune=commune,
                departement=departement,
                code_rome=code_rome,
                type_contrat=type_contrat,
                range_start=current_start,
                range_end=current_end,
                extra_params=extra_params,
            )

            offres = res.get("resultats", [])
            if not offres:
                break

            offres_accumulees.extend(offres)

            # Si on a tout récupéré
            total = res.get("total", 0)
            if len(offres_accumulees) >= total or len(offres) < (current_end - current_start + 1):
                break

            current_start = current_end + 1
            # Respect du rate limiting
            time.sleep(0.3)

        return offres_accumulees

    def get_offre(self, offre_id: str) -> Dict[str, Any]:
        """
        Récupère les détails complets d'une offre à partir de son identifiant.
        """
        url = f"{self.BASE_URL}/offres/{offre_id}"
        response = requests.get(url, headers=self._get_headers(), timeout=15)

        if response.status_code == 401:
            self.get_access_token(force_refresh=True)
            response = requests.get(url, headers=self._get_headers(), timeout=15)

        if response.status_code == 404:
            raise FileNotFoundError(f"Offre d'emploi '{offre_id}' non trouvée.")

        if response.status_code != 200:
            raise RuntimeError(
                f"Erreur lors de la récupération de l'offre ({response.status_code}) : {response.text}"
            )

        return response.json()

    @staticmethod
    def sauvegarder_json(data: Any, filepath: str = "resultat.json") -> None:
        """Sauvegarde les données dans un fichier JSON avec un formatage lisible."""
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        print(f"[OK] Resultats sauvegardes dans '{filepath}' ({os.path.getsize(filepath)} octets).")


    def rechercher_mots_cles_or(
        self,
        liste_mots_cles: List[str],
        limit_par_mot: int = 50,
        **criteres,
    ) -> Dict[str, Any]:
        """
        Effectue une recherche 'OU' en interrogeant l'API pour chaque mot-clé
        et en fusionnant / dédupliquant les offres par leur identifiant 'id'.
        """
        offres_uniques: Dict[str, Dict[str, Any]] = {}

        for mot in liste_mots_cles:
            mot = mot.strip()
            if not mot:
                continue
            try:
                res = self.rechercher_offres(
                    mots_cles=mot,
                    range_start=0,
                    range_end=limit_par_mot - 1,
                    **criteres,
                )
                for offre in res.get("resultats", []):
                    offre_id = offre.get("id")
                    if offre_id and offre_id not in offres_uniques:
                        offres_uniques[offre_id] = offre
            except Exception as err:
                print(f"[WARN] Erreur pour le mot-clé '{mot}': {err}", file=sys.stderr)

        resultats = list(offres_uniques.values())
        return {
            "resultats": resultats,
            "total": len(resultats),
            "mots_cles": liste_mots_cles,
        }


def afficher_recapitulatif(resultats: List[Dict[str, Any]], total: int) -> None:
    """Affiche un résumé clair des offres récupérées dans la console."""
    print("\n" + "=" * 80)
    print(f"  RESULTATS DE LA RECHERCHE ({len(resultats)} affichee(s) sur {total} disponible(s))")
    print("=" * 80)

    for idx, offre in enumerate(resultats, start=1):
        offre_id = offre.get("id", "N/A")
        intitule = offre.get("intitule", "Sans titre")
        entreprise = offre.get("entreprise", {}).get("nom", "Non précisée")
        lieu = offre.get("lieuTravail", {}).get("libelle", "Lieu inconnu")
        type_contrat = offre.get("typeContratLibelle") or offre.get("typeContrat", "N/A")
        date = offre.get("dateActualisation") or offre.get("dateCreation", "")
        date_str = date[:10] if date else "N/A"
        url = f"https://candidat.francetravail.fr/offres/recherche/detail/{offre_id}"

        print(f"\n[{idx}] {intitule}")
        print(f"    - ID          : {offre_id}")
        print(f"    - Entreprise  : {entreprise}")
        print(f"    - Lieu        : {lieu}")
        print(f"    - Contrat     : {type_contrat}")
        print(f"    - Date        : {date_str}")
        print(f"    - Lien direct : {url}")

    print("\n" + "=" * 80 + "\n")


def main():
    parser = argparse.ArgumentParser(
        description="Requête l'API Offres d'emploi de France Travail (francetravail.io)."
    )
    parser.add_argument(
        "-m", "--mots-cles", type=str, default=None,
        help="Mots-clés de la recherche. Séparez par des virgules pour le mode OU (ex: 'coiffure,coiffeur')"
    )
    parser.add_argument(
        "-r", "--code-rome", type=str, default=None,
        help="Code(s) ROME du métier (ex: 'D1202' pour coiffure, 'D1202,D1201' pour coiffure + esthétique)"
    )
    parser.add_argument(
        "-c", "--commune", type=str, default=None,
        help="Code INSEE de la commune (ex: 75115 pour Paris 15e, 59350 pour Lille)"
    )
    parser.add_argument(
        "--distance", type=int, default=None,
        help="Rayon de recherche en km autour de la commune (0 à 100)"
    )
    parser.add_argument(
        "-d", "--departement", type=str, default=None,
        help="Numéro(s) de département (ex: '75', '59', '75,92')"
    )
    parser.add_argument(
        "-t", "--type-contrat", type=str, default=None,
        help="Type(s) de contrat: CDI, CDD, MIS (intérim)... (séparés par virgules ex: 'CDI,MIS')"
    )
    parser.add_argument(
        "--experience", type=str, default=None,
        help="Niveau d'expérience: 1 (moins de 1 an / débutant), 2 (1 à 3 ans), 3 (plus de 3 ans)"
    )
    parser.add_argument(
        "--mode-or", action="store_true",
        help="Active la recherche 'OU' sur les mots-clés séparés par virgules (ex: 'coiffeur,barbier')"
    )
    parser.add_argument(
        "-l", "--limit", type=int, default=10,
        help="Nombre maximal d'offres à afficher (défaut: 10)"
    )
    parser.add_argument(
        "-o", "--output", type=str, default="resultat.json",
        help="Nom du fichier JSON de sortie (défaut: 'resultat.json')"
    )
    parser.add_argument(
        "--id", type=str, default=None,
        help="Récupérer le détail d'une offre spécifique par son ID"
    )

    args = parser.parse_args()

    print("[INFO] Initialisation du client API France Travail...")
    client = FranceTravailAPI()

    # Si un ID spécifique est demandé
    if args.id:
        print(f"[INFO] Récupération de l'offre ID : {args.id}...")
        try:
            offre = client.get_offre(args.id)
            print(f"[OK] Offre trouvée : {offre.get('intitule')}")
            client.sauvegarder_json(offre, args.output)
            print(json.dumps(offre, ensure_ascii=False, indent=2)[:500] + "\n...")
        except Exception as e:
            print(f"[ERREUR] : {e}", file=sys.stderr)
        return

    extra_params = {}
    if args.experience:
        extra_params["experience"] = args.experience

    # Mode OR sur les mots-clés si demandé
    if args.mode_or and args.mots_cles and "," in args.mots_cles:
        mots = [m.strip() for m in args.mots_cles.split(",") if m.strip()]
        print(f"[INFO] Recherche en mode 'OU' sur les mots-clés : {mots}...")
        data = client.rechercher_mots_cles_or(
            liste_mots_cles=mots,
            limit_par_mot=args.limit,
            code_rome=args.code_rome,
            commune=args.commune,
            distance=args.distance,
            departement=args.departement,
            type_contrat=args.type_contrat,
            extra_params=extra_params if extra_params else None,
        )
        resultats = data.get("resultats", [])[:args.limit]
        total = data.get("total", len(resultats))
    else:
        mots_cles = args.mots_cles
        code_rome = args.code_rome or FranceTravailAPI.CODE_ROME

        criteres_label = []
        if mots_cles:
            criteres_label.append(f"mots-clés='{mots_cles}'")
        if code_rome:
            criteres_label.append(f"code_rome='{code_rome}'")
        if args.type_contrat:
            criteres_label.append(f"contrat='{args.type_contrat}'")
        if args.departement:
            criteres_label.append(f"departement='{args.departement}'")

        print(f"[INFO] Recherche d'offres : {', '.join(criteres_label) if criteres_label else 'toutes offres'}...")
        range_end = min(args.limit - 1, 149) if args.limit > 0 else 9

        try:
            data = client.rechercher_offres(
                mots_cles=mots_cles,
                code_rome=code_rome,
                commune=args.commune,
                distance=args.distance,
                departement=args.departement,
                type_contrat=args.type_contrat,
                range_start=0,
                range_end=range_end,
                extra_params=extra_params if extra_params else None,
            )
            resultats = data.get("resultats", [])
            total = data.get("total", len(resultats))

        except Exception as e:
            print(f"[ERREUR] Lors de la requête : {e}", file=sys.stderr)
            sys.exit(1)

    afficher_recapitulatif(resultats, total)

    if args.output:
        client.sauvegarder_json(data, args.output)


if __name__ == "__main__":
    main()

