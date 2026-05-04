const API_URL = import.meta.env.API_URL;

export type CompleteTutorProfileDto = {
  phone: string;
  max_weekly_hours: number;
  subject_ids: string[];
  availabilities?: Array<{
    day: string;
    start_time: string;
    end_time: string;
    modality: 'PRESENCIAL' | 'VIRTUAL';
    location?: string;
  }>;
};

export const getTutorStatus = async (accessToken: string) => {
  const response = await fetch(`${API_URL}/tutors/me/status`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error('Failed to fetch tutor status');
  return response.json();
};

export const getTutorProfile = async (accessToken: string) => {
  const response = await fetch(`${API_URL}/tutors/profile`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error('Failed to fetch tutor profile');
  return response.json();
};

export const completeTutorProfile = async (data: CompleteTutorProfileDto, accessToken: string) => {
  const response = await fetch(`${API_URL}/tutors/profile/complete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });

  const body = await response.json().catch(() => null);
  console.log('[completeTutorProfile] status:', response.status, 'body:', JSON.stringify(body, null, 2));
  if (!response.ok) {
    const err = new Error(body?.message ?? "Profile completion failed");
    (err as any).status = response.status;
    (err as any).body = body;
    throw err;
  }
  return body;
};
