
import {
  createRegistration as createRegistrationService,
  getRegistrations as getRegistrationsService,
  updateRegistrationStatus as updateRegistrationStatusService,
} from "../services/registration.service.js";

export async function createRegistration(req, res, next) {
  try {
    const registration = await createRegistrationService(req.body);

    return res.status(201).json({
      message: "Inscription créée avec succès",
      data: { registration },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getRegistrations(req, res, next) {
  try {
    const filters = req.validatedQuery ?? req.query;
    const registrations = await getRegistrationsService(filters);

    return res.status(200).json({
      message: "Inscriptions récupérées avec succès",
      data: { registrations },
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateRegistrationStatus(req, res, next) {
  try {
    const registration = await updateRegistrationStatusService(
      req.params.id,
      req.body.status
    );

    return res.status(200).json({
      message: "Statut de l'inscription modifié avec succès",
      data: { registration },
    });
  } catch (error) {
    return next(error);
  }
}
