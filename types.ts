export type AuthResponse = {
  token: {
    access: string;
    refresh: string;
  };
  user: {
    id: number;
    username: string;
    is_staff: boolean;
  };
};
