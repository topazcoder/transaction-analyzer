import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      return next(new AppError(errorMessage, 400));
    }

    next();
  };
};

export const schemas = {
  naturalLanguageQuery: Joi.object({
    prompt: Joi.string().required().min(3).max(2000),
  }),

  graphqlQuery: Joi.object({
    query: Joi.string().required(),
    variables: Joi.object().optional(),
  }),

  explainResults: Joi.object({
    query: Joi.string().required(),
    results: Joi.any().required(),
  }),

  addressValidation: Joi.object({
    address: Joi.string()
      .required()
      .pattern(/^0x[a-fA-F0-9]{40}$/),
  }),
};
