import { useAuthStore } from "@/store/authStore";

const API_URL = import.meta.env.API_URL;

export type CompleteTutorProfileDto = {
  phone: string;
  url_image: string;
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
  const response = await fetch(`${API_URL}/tutors/profile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.message ?? "Profile completion failed");
  }
  return body;
};

export const updateTutorProfile = async (data: Partial<CompleteTutorProfileDto>, accessToken: string) => {
  // RF10: PUT /api/v1/tutor/profile (singular "tutor" as per requirement)
  const response = await fetch(`${API_URL}/tutor/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.message ?? "Profile update failed");
  }
  return body;
};
