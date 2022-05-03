import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Divider,
  Link,
  TextField,
  Typography,
  Autocomplete
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import api, {
  Category,
  TeacherDisciplines,
  Test,
  TestByTeacher,
} from "../services/api";

function Instructors() {
  const { token } = useAuth();

  const navigate = useNavigate();

  const [teachersDisciplines, setTeachersDisciplines] = useState<TestByTeacher[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [teachers, setTeachers] = useState([]);

  const teacherNames: string[] = [];

  teachers.forEach((teacher: any) => teacherNames.push(teacher.name));

  useEffect(() => {
    async function loadPage() {
      if (!token) return;

      const { data: testsData } = await api.getTestsByTeacher(token);
      setTeachersDisciplines(testsData.tests);
      const { data: categoriesData } = await api.getCategories(token);
      setCategories(categoriesData.categories);
      const { data: teacherData } = await api.getTeachers(token);
      setTeachers(teacherData.teachers);
    }
    loadPage();
  }, [token]);

  return (
    <>
      <Divider sx={{ mb: "35px" }} >
        <Autocomplete
          disablePortal
          id="combo-box-demo"
          options={teacherNames}
          sx={{ width: "80vw", maxWidth: "450px" }}
          onInputChange={(e, value) => setSearch(value)}
          renderInput={(params: any) => (
            <TextField
              {...params}
              sx={{ mx: "auto", width: "80vw", maxWidth: "450px" }}
              label="Pesquise por pessoa instrutora"
            />
          )}
        />
      </Divider>
      <Box sx={{ mx: "auto" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10vw",
            paddingBottom: "20vh"
          }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate("/app/disciplinas")}
          >
            Disciplinas
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate("/app/pessoas-instrutoras")}
          >
            Pessoa Instrutora
          </Button>
          <Button variant="outlined" onClick={() => navigate("/app/adicionar")}>
            Adicionar
          </Button>
        </Box>
        {!search
          ? (
            <TeachersDisciplinesAccordions
              categories={categories}
              teachersDisciplines={teachersDisciplines}
            />
          )
          : (
            <TeachersDisciplinesAccordions
              categories={categories}
              teachersDisciplines={teachersDisciplines.filter(el => el.teacher.name === search)}
            />
          )
        }
      </Box>
    </>
  );
}

interface TeachersDisciplinesAccordionsProps {
  teachersDisciplines: TestByTeacher[];
  categories: Category[];
}

function TeachersDisciplinesAccordions({
  categories,
  teachersDisciplines,
}: TeachersDisciplinesAccordionsProps) {
  const teachers = getUniqueTeachers(teachersDisciplines);

  return (
    <Box sx={{ mt: "50px" }}>
      {teachers.map((teacher) => (
        <Accordion sx={{ backgroundColor: "#FFF" }} key={teacher}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="bold">{teacher}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {categories
              .filter(doesCategoryHaveTests(teacher, teachersDisciplines))
              .map((category) => (
                <Categories
                  key={category.id}
                  category={category}
                  teacher={teacher}
                  teachersDisciplines={teachersDisciplines}
                />
              ))}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}

function getUniqueTeachers(teachersDisciplines: TestByTeacher[]) {
  return [
    ...new Set(
      teachersDisciplines.map(
        (teacherDiscipline) => teacherDiscipline.teacher.name
      )
    ),
  ];
}

function doesCategoryHaveTests(
  teacher: string,
  teachersDisciplines: TeacherDisciplines[]
) {
  return (category: Category) =>
    teachersDisciplines.filter(
      (teacherDiscipline) =>
        teacherDiscipline.teacher.name === teacher &&
        testOfThisCategory(teacherDiscipline, category)
    ).length > 0;
}

function testOfThisCategory(
  teacherDiscipline: TeacherDisciplines,
  category: Category
) {
  return teacherDiscipline.tests.some(
    (test) => test.category.id === category.id
  );
}

interface CategoriesProps {
  teachersDisciplines: TeacherDisciplines[];
  category: Category;
  teacher: string;
}

function Categories({
  category,
  teachersDisciplines,
  teacher,
}: CategoriesProps) {
  return (
    <>
      <Box sx={{ mb: "8px" }}>
        <Typography fontWeight="bold">{category.name}</Typography>
        {teachersDisciplines
          .filter(
            (teacherDiscipline) => teacherDiscipline.teacher.name === teacher
          )
          .map((teacherDiscipline) => (
            <Tests
              key={teacherDiscipline.id}
              tests={teacherDiscipline.tests.filter(
                (test) => test.category.id === category.id
              )}
              disciplineName={teacherDiscipline.discipline.name}
            />
          ))}
      </Box>
    </>
  );
}

interface TestsProps {
  disciplineName: string;
  tests: Test[];
}

function Tests({ tests, disciplineName }: TestsProps) {

  const { token } = useAuth();

  async function countView(id: number) {
    if (!token) return;

    await api.countView(id, token);
  }

  return (
    <>
      {tests.map((test) => (
        <Box sx={{ display: "flex", width: "80vw", gap: "30px" }}>
          <Typography key={test.id} color="#878787">
            <Link
              onClick={() => countView(test.id)}
              href={test.pdfUrl}
              target="_blank"
              underline="none"
              color="inherit"
            >{`${test.name} (${disciplineName})`}</Link>
          </Typography>
          <Typography>{`Visualizações: ${test.views}`}</Typography>
        </Box>
      ))}
    </>
  );
}

export default Instructors;