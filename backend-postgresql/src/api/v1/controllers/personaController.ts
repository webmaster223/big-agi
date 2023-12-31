// Express
import { Request, Response } from 'express';
// Entities
import Persona from '../entity/Persona';
import Category from '../entity/Category';
// Constants, Helpers & Types
import { ResponseCode } from '../types/enum';
import {
  databaseError,
  entityManager,
  limitOffset,
  responseUpdateDelete,
  uuidError,
  validateError,
  validateLimitOffset,
} from '../helpers';

export const createPersona = async (req: Request, res: Response) => {
  // authenticated user and request body
  const { user, body } = req;

  const { title, description, systemMessage, symbol, examples, call, voices, categoryId } = body;

  const category = {
    id: categoryId,
  };
  console.log('req body', body);
  const persona = new Persona({
    title,
    description,
    systemMessage,
    symbol,
    examples,
    call,
    voices,
    category,
  });
  console.log('received category', category);
  // Validation of input for errors
  const errors = await validateError(persona, res);
  if (errors) {
    return;
  }

  try {
    // create the food
    await entityManager.save(persona);
    return res.status(200).json(persona);
  } catch (error) {
    return databaseError(error, res);
  }
};

export const getPersona = async (req: Request, res: Response) => {
  const { personaId } = req.params;
  console.log('Persona console:', req.params);
  // check if food id is valid
  if (uuidError(personaId, 'persona', res)) {
    return;
  }

  // find food by the id
  const persona = await entityManager.findOne(Persona, {
    where: { id: personaId },
    relations: ['category'],
  });

  if (persona) {
    return res.status(200).json({
      code: ResponseCode.SUCCESS,
      message: 'Food found.',
      persona,
    });
  } else {
    return res.status(204).send();
  }
};
export const deletePersona = async (req: Request, res: Response) => {
  const { personaId } = req.params;
  console.log('id', personaId);
  // check if food id is valid
  if (uuidError(personaId, 'persona', res)) {
    return;
  }

  // find food by the id
  const deleted = await entityManager.delete(Persona, { id: personaId });

  return responseUpdateDelete('Persona', deleted, 'Deleted', res);
};
export const updatePersona = async (req: Request, res: Response) => {
  // authenticated user
  const { user, body } = req;

  const { id, title, description, systemMessage, symbol, examples, call, voices, categoryId } = body;
  const category = {
    id: categoryId,
  };
  const persona = new Persona({ title, description, systemMessage, symbol, examples, call, voices, category });

  // Validation of input for errors
  const errors = await validateError(persona, res, true);
  if (errors) {
    return;
  }

  try {
    // update food properties
    const updated = await entityManager.update(Persona, { id: id }, persona);

    return responseUpdateDelete('Persona', updated, 'Updated', res);
  } catch (error) {
    return databaseError(error, res);
  }
};
export const findByTitle = async (req: Request, res: Response) => {
  const { title } = req.body;

  const persona = await entityManager.findOne(Persona, {
    where: { title: title },
    relations: ['category'],
  });

  res.status(200).json(persona);
};

export const findByCategory = async (req: Request, res: Response) => {
  const { categoryId } = req.body;

  const category = await entityManager.findOne(Category, {
    where: { id: categoryId },
    relations: ['personas'],
  });

  res.status(200).json(category);
};

export const getPersonas = async (req: Request, res: Response) => {
  // const { body } = req;

  // // Validate pagination parameters
  // const { limit, offset } = validateLimitOffset(body);

  // find all foods
  const personas = await entityManager.find(Persona, { relations: ['category'] });

  return res.status(200).json(personas);
};
