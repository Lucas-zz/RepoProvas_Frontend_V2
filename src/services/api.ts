import axios from "axios";

const baseAPI = axios.create({
  baseURL: "http://localhost:5000/",
})

interface UserData {
  email: string;
  password: string;
}

export interface Term {
  id: number;
  number: number;
}

export interface Discipline {
  id: number;
  name: string;
  teacherDisciplines: TeacherDisciplines[];
  term: Term;
}

export interface TeacherDisciplines {
  id: number;
  discipline: Discipline;
  teacher: Teacher;
  tests: Test[];
}

export interface Teacher {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Test {
  id: number;
  name: string;
  pdfUrl: string;
  category: Category;
  views: number;
}

export type TestByDiscipline = Term & {
  disciplines: Discipline[];
};

export type TestByTeacher = TeacherDisciplines & {
  teacher: Teacher;
  disciplines: Discipline[];
  tests: Test[];
};

function createHeaders(token: string) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

async function signUp(signUpData: UserData) {
  await baseAPI.post(`/sign-up`, signUpData);
}

async function signIn(signInData: UserData) {
  return baseAPI.post<{ token: string }>(`/sign-in`, signInData);
}

async function getTestsByDiscipline(token: string) {
  const config = createHeaders(token);
  return baseAPI.get<{ tests: TestByDiscipline[] }>(
    "/tests?groupBy=disciplines",
    config
  );
}

async function getTestsByTeacher(token: string) {
  const config = createHeaders(token);
  return baseAPI.get<{ tests: TestByTeacher[] }>(
    `/tests?groupBy=teachers`,
    config
  );
}

async function getCategories(token: string) {
  const config = createHeaders(token);
  return baseAPI.get<{ categories: Category[] }>(`/categories`, config);
}

async function getTeachers(token: string) {
  const config = createHeaders(token);
  return baseAPI.get("/teachers", config);
}

async function getDisciplines(token: string) {
  const config = createHeaders(token);
  return baseAPI.get(`/disciplines`, config);
}

async function getTeachersByDiscipline(discipline: string, token: string) {
  const config = createHeaders(token);
  return baseAPI.get(`/teachers/${discipline}`, config);
}

async function addTest(body: any, token: string) {
  const config = createHeaders(token);
  return baseAPI.post("/tests", body, config);
}

async function countView(id: number, token: string) {
  const config = createHeaders(token);
  return baseAPI.patch(`/tests/${id}/countView`, null, config);
}

const api = {
  signUp,
  signIn,
  getTestsByDiscipline,
  getTestsByTeacher,
  getCategories,
  getTeachers,
  getDisciplines,
  getTeachersByDiscipline,
  addTest,
  countView
};

export default api;
