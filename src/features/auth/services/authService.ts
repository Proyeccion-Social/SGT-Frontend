const API_URL = import.meta.env.API_URL;

export type LoginResult = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    emailVerified: boolean;
  };
};

export type RegisterDto = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type LogoutDto = {
  id: string;
  refreshToken: string;
};

export const validateEmail = async (email: string) => {
  try {
    const response = await fetch(`${API_URL}/auth/check-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    console.log(data)
    return !!data.exists;
  } catch (error) {
    console.error('Error validating email:', error);
    throw new Error('Failed to validate email');
  }
}


export const login = async (
  email: string,
  password: string
): Promise<LoginResult> => {

  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.message ?? "Authentication failed");
  }

  return body;
};

export const fetchMe = async (accessToken: string) => {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!response.ok) throw new Error('Failed to fetch user');
  return response.json();
};

export const register = async (data: RegisterDto) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.message ?? "Registration failed");
  }

  return body;
};

export const logout = async (data: LogoutDto, accessToken: string) => {
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`
    },
    body: JSON.stringify(data),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.message ?? "Logout failed");
  }

  return body;
};

export const changePassword = async (data: any, accessToken: string) => {
  const response = await fetch(`${API_URL}/auth/password/change`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.message ?? "Password change failed");
  }
  return body;
};