import { User } from '../user/interface';

export const USER_FIELDS_FOR_UPDATE = [
  'first_name',
  'last_name',
  'surname',
  'birthdate',
];

export const getUserUpdatePayload = (payload: any) => {
  const data = {};
  USER_FIELDS_FOR_UPDATE.forEach((key) => {
    if (Object.hasOwnProperty.call(payload, key)) {
      data[key] = payload[key];
    }
  });
  return data as User;
};
