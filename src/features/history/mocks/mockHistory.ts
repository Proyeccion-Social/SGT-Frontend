export const mockHistory = {
  scheduled: [
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
    }
  ],

  completed: [
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
    sessionId: "7",
    tutor: {
      tutorId: "t5",
      fullName: "Luis Ramírez",
      profilePhoto: "https://i.pravatar.cc/150?img=5"
    },
    subject: {
      subjectId: "s5",
      name: "Álgebra Lineal",
      code: "ALG001"
    },
    date: "2025-01-12",
    time: "16:00",
    duration: 2,
    modality: "PRESENCIAL",
    location: "Bloque B, Salón 305",
    title: "Matrices",
    description: "Operaciones con matrices",
    status: "COMPLETED",
    timeUntilSession: "Finalizada",
    rating: {
      overall: 0,
      canRate: true
    }
  },
  {
    sessionId: "8",
    tutor: {
      tutorId: "t6",
      fullName: "Sofía Torres",
      profilePhoto: "https://i.pravatar.cc/150?img=6"
    },
    subject: {
      subjectId: "s6",
      name: "Programación II",
      code: "PROG002"
    },
    date: "2025-01-14",
    time: "18:00",
    duration: 2,
    modality: "VIRTUAL",
    location: "Google Meet",
    title: "POO en Java",
    description: "Clases y objetos",
    status: "COMPLETED",
    timeUntilSession: "Finalizada",
    rating: {
      overall: 0,
      canRate: true
    }
  }
],

  cancelled: [
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
      status: "CANCELLED",
      timeUntilSession: "Cancelada"
    },
    {
      sessionId: "5",
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
      date: "2025-01-08",
      time: "11:00",
      duration: 2,
      modality: "VIRTUAL",
      location: "Google Meet",
      title: "Leyes de Newton",
      description: "Fuerzas y dinámica",
      status: "CANCELLED",
      timeUntilSession: "Cancelada"
    }
  ],

  noShow: [
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
    }
  ],

  statistics: {
    totalCompleted: 12,
    totalCancelled: 2,
    totalNoShow: 1,
    totalScheduled: 3,
    totalHours: 18.5,
    attendanceRate: 85.7
  },

  pagination: {
    page: 1,
    limit: 20,
    totalRecords: 18,
    totalPages: 1
  }
};