
import { createParticipant as createParticipantService, getParticipants as getParticipantsService, updateParticipant as updateParticipantService } from "../services/participant.service.js";

export async function createParticipant(req, res, next) {
  try {
    const participant = await createParticipantService(req.body);

    return res.status(201).json({
      message: "Participant créé avec succès",
      data: { participant },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getParticipants(req, res, next) {
  try {
    const { search = "" } = req.validatedQuery ?? req.query;

    const participants = await getParticipantsService(search);

    return res.status(200).json({
      message: "Participants récupérés avec succès",
      data: { participants },
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateParticipant(req, res, next) {
  try {
    const participant = await updateParticipantService(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      message: "Participant modifié avec succès",
      data: { participant },
    });
  } catch (error) {
    return next(error);
  }
}
