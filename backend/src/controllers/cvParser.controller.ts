/**
 * Contrôleur d'analyse locale de CV.
 * Reçoit un document (au format base64 ou multipart) et renvoie les données
 * profil extraites pour le préremplissage automatique de l'onboarding.
 */

import { Request, Response } from "express";
import { parseLocalCV } from "../services/localCVParser";

export const parseCV = async (req: Request, res: Response) => {
  try {
    const { fileName, dataBase64 } = req.body;

    let buffer: Buffer;
    let name: string = fileName || "cv.pdf";

    if (dataBase64) {
      // Nettoie un éventuel préfixe Data URI (data:application/pdf;base64,...)
      const cleanBase64 = dataBase64.replace(/^data:.*?;base64,/, "");
      buffer = Buffer.from(cleanBase64, "base64");
    } else if ((req as any).file && (req as any).file.buffer) {
      buffer = (req as any).file.buffer;
      name = (req as any).file.originalname || name;
    } else {
      return res.status(400).json({
        success: false,
        message: "Fichier requis sous forme de 'dataBase64' ou de fichier multipart."
      });
    }

    const parsedProfile = await parseLocalCV(buffer, name);

    console.log(`[CV-PARSER] CV analysé avec succès pour "${parsedProfile.name}" (${parsedProfile.diploma}, ${parsedProfile.skills.length} compétences).`);

    return res.json({
      success: true,
      data: parsedProfile
    });
  } catch (err: any) {
    console.error("[CV-PARSER] Erreur lors du parsing :", err);
    return res.status(500).json({
      success: false,
      message: "Échec de l'analyse du CV : " + (err.message || "erreur inattendue")
    });
  }
};
