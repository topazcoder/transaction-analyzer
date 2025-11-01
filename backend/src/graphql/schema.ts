import { buildSchema } from 'graphql';
import { typeDefs } from './types';

export const schema = buildSchema(typeDefs);
