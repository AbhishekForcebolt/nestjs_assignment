import { User } from 'src/user/interface';

export const VALID_USER_ID = 'e903725c-6228-4ad5-82a5-381f5be5da11';

export const VALID_USERNAME = 'mock';
export const VALID_MAX_AGE = 100;
export const VALID_MIN_AGE = 0;

export const getNewMockUser = (): User => {
  return {
    birthday: new Date().toDateString(),
    first_name: 'Mock',
    last_name: 'User',
    surname: '',
    username: 'mock_user' + Math.random(),
  };
};

export const UPDATE_USER_DATA = {
  id: VALID_USER_ID,
  first_name: 'Mock' + Math.random(),
};
