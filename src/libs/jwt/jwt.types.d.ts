type PayloadSubjects = 'access' | 'refresh';

export type JwtPayload = {
  aid: string;
  iat: number;
  exp: number;
  sub: PayloadSubjects;
};
