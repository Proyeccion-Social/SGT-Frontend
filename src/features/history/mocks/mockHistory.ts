export const mockHistory = {
  sessions: [
    {
      sessionId: "1",
      tutor: {
        tutorId: "t1",
        fullName: "Carlos Pérez",
        profilePhoto: "https://i.pravatar.cc/150?img=1"
      },
      subject: {
        subjectId: "s1",
        name: "Programación I",
        code: "PROG001"
      },
      date: "2025-01-20",
      time: "14:00",
      duration: 2,
      modality: "PRESENCIAL",
      location: "Edificio Ingeniería, Salón 201",
      title: "Estructuras de control",
      description: "Necesito ayuda con bucles",
      status: "SCHEDULED",
      timeUntilSession: "2 días"
    },

    {
      sessionId: "2",
      tutor: {
        tutorId: "t2",
        fullName: "María García",
        profilePhoto: "https://i.pravatar.cc/150?img=2"
      },
      subject: {
        subjectId: "s2",
        name: "Cálculo I",
        code: "CALC001"
      },
      date: "2025-01-15",
      time: "10:00",
      duration: 1.5,
      modality: "VIRTUAL",
      location: "Zoom",
      title: "Límites y derivadas",
      description: "Repaso para parcial",
      status: "COMPLETED",
      timeUntilSession: "Finalizada",
      rating: {
        overall: 4.5,
        canRate: false
      }
    },

    {
      sessionId: "3",
      tutor: {
        tutorId: "t2",
        fullName: "María García",
        profilePhoto: "https://i.pravatar.cc/150?img=2"
      },
      subject: {
        subjectId: "s2",
        name: "Cálculo I",
        code: "CALC001"
      },
      date: "2025-01-10",
      time: "08:00",
      duration: 1.5,
      modality: "VIRTUAL",
      location: "Zoom",
      title: "Integrales básicas",
      description: "Ejercicios guiados",
      status: "COMPLETED",
      timeUntilSession: "Finalizada",
      rating: {
        overall: 4.8,
        canRate: false
      }
    },

    {
      sessionId: "4",
      tutor: {
        tutorId: "t3",
        fullName: "Juan López",
        profilePhoto: "https://i.pravatar.cc/150?img=3"
      },
      subject: {
        subjectId: "s3",
        name: "Física I",
        code: "FIS001"
      },
      date: "2025-01-10",
      time: "09:00",
      duration: 2,
      modality: "VIRTUAL",
      location: "Google Meet",
      title: "Cinemática",
      description: "Movimiento rectilíneo",
      status: "CANCELLED_BY_TUTOR",
      timeUntilSession: "Cancelada"
    },

    {
      sessionId: "6",
      tutor: {
        tutorId: "t4",
        fullName: "Ana Martínez",
        profilePhoto: "https://i.pravatar.cc/150?img=4"
      },
      subject: {
        subjectId: "s4",
        name: "Química I",
        code: "QUI001"
      },
      date: "2025-01-05",
      time: "11:00",
      duration: 1.5,
      modality: "VIRTUAL",
      location: "Zoom",
      title: "Tabla periódica",
      description: "Propiedades de los elementos",
      status: "NO_SHOW",
      timeUntilSession: "No asistió"
    },

    {
      sessionId: "9",
      tutor: {
        tutorId: "t7",
        fullName: "Andrés Gómez",
        profilePhoto: "https://i.pravatar.cc/150?img=7"
      },
      subject: {
        subjectId: "s7",
        name: "Bases de Datos",
        code: "BD001"
      },
      date: "2025-01-22",
      time: "16:00",
      duration: 1.5,
      modality: "VIRTUAL",
      location: "Google Meet",
      title: "Consultas SQL",
      description: "Joins y subconsultas",
      status: "SCHEDULED",
      timeUntilSession: "4 días"
    }
  ],

  statistics: {
  totalCompleted: 4,
  totalCancelled: 1,
  totalNoShow: 1,
  totalScheduled: 4,
  totalHours: 15.5,
  attendanceRate: 66.7
},
  pagination: {
    total: 47,
    page: 1,
    limit: 10,
    totalPages: 5
  }
};