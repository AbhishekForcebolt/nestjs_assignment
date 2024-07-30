import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import {
  getNewMockUser,
  UPDATE_USER_DATA,
  VALID_MAX_AGE,
  VALID_USER_ID,
  VALID_USERNAME,
} from './mock/users';

describe('UserController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('Get User With Invalid ID', async () => {
    const response = await request(app.getHttpServer()).get(
      '/user/invalid_user_id',
    );
    expect(response.status).toEqual(400);
    expect(response.body).toBeDefined();
    expect(response.body.error).toEqual(true);
  });

  it('Get User With Valid ID', async () => {
    const response = await request(app.getHttpServer()).get(
      `/user/${VALID_USER_ID}`,
    );
    expect(response.status).toEqual(200);
    expect(response.body).toBeDefined();
    expect(response.body.error).toEqual(false);
    expect(response.body.user).toBeTruthy();
  });

  it('Get User With Valid ID', async () => {
    const response = await request(app.getHttpServer()).get(
      `/user/${VALID_USER_ID}`,
    );
    expect(response.status).toEqual(200);
    expect(response.body).toBeDefined();
    expect(response.body.error).toEqual(false);
    expect(response.body.user).toBeTruthy();
  });

  it('Create new User Without Body', async () => {
    const response = await request(app.getHttpServer()).post(`/user/insert`);
    expect(response.status).toEqual(400);
    expect(response.body).toBeDefined();
    expect(response.body.error).toEqual(true);
  });

  it('Create new User With Body', async () => {
    const response = await request(app.getHttpServer())
      .post(`/user/insert`)
      .send(getNewMockUser());

    expect(response.status).toEqual(200);
    expect(response.body).toBeDefined();
    expect(response.body.error).toEqual(false);
    expect(response.body.user).toBeTruthy();
  });

  it('Update User Without Body', async () => {
    const response = await request(app.getHttpServer()).patch(`/user/update`);
    console.log(response.body, 'FFF');
    expect(response.status).toEqual(400);
    expect(response.body).toBeDefined();
    expect(response.body.error).toEqual(true);
  });

  it('Update User With Body', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/user/update`)
      .send(UPDATE_USER_DATA);

    expect(response.status).toEqual(200);
    expect(response.body).toBeDefined();
    expect(response.body.error).toEqual(false);
    expect(response.body.message).toEqual('User updated succssfully.');
  });

  it('Search With Invalid Query Parameters', async () => {
    const response = await request(app.getHttpServer()).get(`/users/search`);
    expect(response.status).toEqual(400);
    expect(response.body).toBeDefined();
    expect(response.body.error).toEqual(true);
    expect(response.body.message).toEqual('Invalid request params.');
  });

  it('Search With Username', async () => {
    const response = await request(app.getHttpServer()).get(
      `/users/search?username=${VALID_USERNAME}`,
    );
    expect(response.status).toEqual(200);
    expect(response.body).toBeDefined();
    expect(response.body.error).toEqual(false);
    expect(response.body.users).toBeTruthy();
    expect(response.body.message).toEqual('Users fetched succssfully.');
  });

  it('Search With Username,Mar_Age and Min_Age', async () => {
    const response = await request(app.getHttpServer()).get(
      `/users/search?username=${VALID_USERNAME}&max_age=${VALID_MAX_AGE}&min_age=${VALID_MAX_AGE}`,
    );
    expect(response.status).toEqual(200);
    expect(response.body).toBeDefined();
    expect(response.body.error).toEqual(false);
    expect(response.body.users).toBeTruthy();
    expect(response.body.message).toEqual('Users fetched succssfully.');
  });
});
