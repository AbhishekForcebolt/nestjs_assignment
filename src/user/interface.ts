export interface User {
  first_name: string;
  surname: string;
  last_name: string;
  username: string;
  birthday: string;
}

export interface UserQueryParams {
  username: string;
  min_age: number;
  max_age: number;
}
