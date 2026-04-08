export interface TutorInfo {
  id: string;
  name: string;
  photoUrl: string | null;
  modality: string;
  type: string;
  subjects: { id: string; name: string }[];
}

export async function getTutorInfo(
  tutorId: string,
  authHeader?: string
): Promise<TutorInfo> {
  const res = await fetch(
    `${import.meta.env.API_URL}/tutors/${tutorId}`,
    {
      headers: authHeader
        ? { authorization: authHeader }
        : undefined,
    }
  );
const baseUrl = import.meta.env.API_URL;
  console.log("API_URL:", baseUrl);   // Si imprime "undefined", ese es el problema
  console.log("tutorId recibido:", tutorId);

  const url = `${baseUrl}/api/v1/tutors/${tutorId}`;
  console.log("URL FINAL:", url);

  if (!res.ok) {
    throw new Error("No se pudo obtener el tutor");
  }

  const data = await res.json();

  return {
    id: data.id,
    name: data.name,
    photoUrl: data.photo ?? null,
    modality: data.availableModalities?.join(" o ") || "Presencial o virtual",
    type: "Virtual o integral",
    subjects: data.subjectsId ?? [],
  };
}