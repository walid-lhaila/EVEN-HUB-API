
import {
  getAllEvents,
  getEventById,
  createEvent as createEventService,
  updateEvent as updateEventService,
  updateEventStatus as updateEventStatusService,
} from "../services/event.service.js";

export async function getEvents(req, res, next) {
  try {
    const events = await getAllEvents({
      ...(req.validatedQuery ?? req.query),
      userId: req.user.id,
    });

    res.status(200).json({
      message: "Événements récupérés avec succès",
      data: { events },
    });
  } catch (error) {
    next(error);
  }
}

export async function getEvent(req, res, next) {
  try {
    const event = await getEventById(
      req.params.id,
      req.user.id
    );

    res.status(200).json({
      message: "Événement récupéré avec succès",
      data: { event },
    });
  } catch (error) {
    next(error);
  }
}

export async function createEvent(req, res, next) {
  try {
    const event = await createEventService(
      req.body,
      req.user.id
    );

    res.status(201).json({
      message: "Événement créé avec succès",
      data: { event },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateEvent(req, res, next) {
  try {
    const event = await updateEventService(
      req.params.id,
      req.body,
      req.user.id
    );

    res.status(200).json({
      message: "Événement modifié avec succès",
      data: { event },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateEventStatus(req, res, next) {
  try {
    const event = await updateEventStatusService(
      req.params.id,
      req.body.status,
      req.user.id
    );

    res.status(200).json({
      message: "Statut de l'événement modifié avec succès",
      data: { event },
    });
  } catch (error) {
    next(error);
  }
}
